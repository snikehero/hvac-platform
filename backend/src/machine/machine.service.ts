import {
  Injectable,
  Inject,
  forwardRef,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { MqttService } from '../mqtt/mqtt.service';
import { MachineDesignerService } from '../machine-designer/machine-designer.service';
import { MachineGateway } from './machine.gateway';
import {
  GenericTelemetryDto,
  GenericPointDto,
} from './dto/generic-telemetry.dto';
import type { DeviceEventType } from '../common/dto/device-event.dto';

interface MachinePointState {
  value: number | string | boolean;
  unit?: string;
  quality: 'GOOD' | 'BAD' | 'UNCERTAIN';
}

interface MachineInstanceState {
  plantId: string;
  stationId: string;
  lastUpdate: Date;
  points: Map<string, MachinePointState>;
  isConnected: boolean;
  lastHealthStatus: DeviceEventType;
}

@Injectable()
export class MachineService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MachineService.name);

  /** Map<machineTypeSlug, Map<instanceKey, MachineInstanceState>> */
  private readonly state = new Map<string, Map<string, MachineInstanceState>>();

  constructor(
    private readonly mqttService: MqttService,
    @Inject(forwardRef(() => MachineDesignerService))
    private readonly designerService: MachineDesignerService,
    private readonly gateway: MachineGateway,
  ) { }

  private timer: NodeJS.Timeout;

  async onModuleInit() {
    // Provide snapshot function to gateway
    this.gateway.setSnapshotProvider(() => this.getSnapshotAll());

    // Ensure system types (HVAC) are seeded before reading
    // This handles the case where MachineService initializes before MachineDesignerService
    await this.designerService.ensureSystemTypes();

    // Load all machine types from DB and register handlers
    const machineTypes = await this.designerService.findAll();

    for (const mt of machineTypes) {
      this.registerMachineType(mt.slug, mt.mqttTopic);
    }

    this.logger.log(
      `Initialized ${machineTypes.length} machine type(s): ${machineTypes.map((mt) => mt.slug).join(', ') || 'none'}`,
    );

    this.timer = setInterval(() => this.checkConnectivity(), 5000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private checkConnectivity() {
    const now = Date.now();
    const TIMEOUT = 60000;

    for (const [slug, typeState] of this.state) {
      for (const [key, instance] of typeState) {
        if (
          instance.isConnected &&
          now - instance.lastUpdate.getTime() > TIMEOUT
        ) {
          instance.isConnected = false;
          instance.lastHealthStatus = 'DISCONNECTED';

          this.gateway.emitEvent({
            type: 'DISCONNECTED',
            timestamp: new Date().toISOString(),
            machineType: slug,
            instanceId: instance.stationId,
            plantId: instance.plantId,
            message: `Machine ${slug} (${instance.plantId}/${instance.stationId}) disconnected`,
          });

          this.logger.warn(`Machine timeout: ${key} disconnected`);
        }
      }
    }
  }

  /** Register a new machine type for MQTT handling (called on startup and when new types are created) */
  registerMachineType(slug: string, mqttTopic: string): void {
    if (!this.state.has(slug)) {
      this.state.set(slug, new Map());
    }

    this.mqttService.registerTopicHandler(
      mqttTopic,
      (_topic: string, raw: unknown) => {
        const dto = plainToInstance(GenericTelemetryDto, raw);
        const errors = validateSync(dto, { skipMissingProperties: false });

        if (errors.length > 0) {
          this.logger.warn(
            `Invalid telemetry for "${slug}" on topic "${_topic}": ${errors
              .map((e: ValidationError) =>
                Object.values(e.constraints ?? {}).join(', '),
              )
              .join(' | ')}`,
          );
          return;
        }

        this.handleTelemetry(slug, dto);
      },
    );
  }

  /** Unregister a machine type (called when a type is deleted) */
  unregisterMachineType(slug: string, mqttTopic: string): void {
    this.state.delete(slug);
    this.mqttService.unregisterTopicHandler(mqttTopic);
  }

  /** Update registration when topic changes */
  updateMachineType(
    slug: string,
    oldTopic: string,
    newTopic: string,
  ): void {
    this.mqttService.unregisterTopicHandler(oldTopic);
    this.registerMachineType(slug, newTopic);
  }

  handleTelemetry(machineTypeSlug: string, payload: GenericTelemetryDto) {
    const typeState = this.state.get(machineTypeSlug);
    if (!typeState) return;

    const key = `${payload.plantId}-${payload.stationId}`;

    let instance = typeState.get(key);
    if (!instance) {
      instance = {
        plantId: payload.plantId,
        stationId: payload.stationId,
        lastUpdate: new Date(),
        points: new Map(),
        isConnected: true,
        lastHealthStatus: 'OK',
      };
      typeState.set(key, instance);
    } else {
      if (!instance.isConnected) {
        instance.isConnected = true;
        this.gateway.emitEvent({
          type: 'RECONNECTED',
          timestamp: new Date().toISOString(),
          machineType: machineTypeSlug,
          instanceId: instance.stationId,
          plantId: instance.plantId,
          message: `Machine ${machineTypeSlug} (${instance.plantId}/${instance.stationId}) reconnected`,
        });
        this.logger.log(`Machine reconnected: ${key}`);
      }
    }

    instance.lastUpdate = new Date();

    for (const [pointKey, point] of Object.entries(payload.points)) {
      instance.points.set(pointKey, {
        value: point.value,
        unit: point.unit,
        quality: point.quality ?? 'GOOD',
      });
    }

    // Evaluate health status and emit event on transitions
    const newHealth = this.evaluateHealth(instance);
    if (newHealth !== instance.lastHealthStatus) {
      const previousType = instance.lastHealthStatus;
      instance.lastHealthStatus = newHealth;

      this.gateway.emitEvent({
        type: newHealth,
        previousType,
        timestamp: new Date().toISOString(),
        machineType: machineTypeSlug,
        instanceId: instance.stationId,
        plantId: instance.plantId,
        message: `Machine ${machineTypeSlug} (${instance.plantId}/${instance.stationId}) status: ${newHealth}`,
      });

      this.logger.log(
        `Machine health change: ${key} ${previousType} → ${newHealth}`,
      );
    }

    const dto = this.instanceToDto(instance, payload.timestamp);
    this.gateway.emitUpdate(machineTypeSlug, dto);

    this.logger.debug(
      `Machine telemetry — ${machineTypeSlug}/${payload.plantId}/${payload.stationId} [${Object.keys(payload.points).join(', ')}]`,
    );
  }

  /**
   * Evaluate the health status of a machine instance based on its points.
   * Priority: status point ALARM > BAD quality > status point WARNING > OK
   */
  private evaluateHealth(instance: MachineInstanceState): DeviceEventType {
    const statusPoint = instance.points.get('status');

    // 1. Explicit ALARM from status point
    if (statusPoint?.value === 'ALARM') return 'ALARM';

    // 2. Any point with BAD quality → WARNING
    let hasBadQuality = false;
    for (const point of instance.points.values()) {
      if (point.quality === 'BAD') {
        hasBadQuality = true;
        break;
      }
    }

    // 3. Explicit WARNING from status point
    if (statusPoint?.value === 'WARNING') return 'WARNING';

    // 4. BAD quality → WARNING
    if (hasBadQuality) return 'WARNING';

    return 'OK';
  }

  getSnapshot(machineTypeSlug: string): GenericTelemetryDto[] {
    const typeState = this.state.get(machineTypeSlug);
    if (!typeState) return [];

    return Array.from(typeState.values()).map((instance) =>
      this.instanceToDto(instance, instance.lastUpdate.toISOString()),
    );
  }

  getSnapshotAll(): Record<string, GenericTelemetryDto[]> {
    const result: Record<string, GenericTelemetryDto[]> = {};
    for (const [slug, typeState] of this.state) {
      result[slug] = Array.from(typeState.values()).map((instance) =>
        this.instanceToDto(instance, instance.lastUpdate.toISOString()),
      );
    }
    return result;
  }

  private instanceToDto(
    instance: MachineInstanceState,
    timestamp: string,
  ): GenericTelemetryDto {
    const points: Record<string, GenericPointDto> = {};

    for (const [key, point] of instance.points) {
      points[key] = {
        value: point.value,
        unit: point.unit,
        quality: point.quality,
      };
    }

    return {
      plantId: instance.plantId,
      stationId: instance.stationId,
      timestamp,
      points,
    };
  }
}
