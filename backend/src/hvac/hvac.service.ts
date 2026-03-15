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
import { HvacGateway } from './hvac.gateway';
import { InternalAhuState } from './internal/ahu-state';
import { toTelemetryDto } from './mappers/telemetry.mapper';
import { TelemetryDto } from './dto/telemetry.dto';
import { MqttService } from '../mqtt/mqtt.service';
import type { DeviceEventType } from '../common/dto/device-event.dto';

@Injectable()
export class HvacService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HvacService.name);
  private readonly state = new Map<string, InternalAhuState>();
  private timer: NodeJS.Timeout;

  constructor(
    @Inject(forwardRef(() => HvacGateway))
    private readonly gateway: HvacGateway,
    private readonly mqttService: MqttService,
  ) {}

  onModuleInit() {
    this.mqttService.registerTopicHandler(
      'hvac/#',
      (_topic: string, raw: unknown) => {
        const dto = plainToInstance(TelemetryDto, raw);
        const errors = validateSync(dto, { skipMissingProperties: false });

        if (errors.length > 0) {
          this.logger.warn(
            `Invalid telemetry on topic "${_topic}": ${errors
              .map((e: ValidationError) =>
                Object.values(e.constraints ?? {}).join(', '),
              )
              .join(' | ')}`,
          );
          return;
        }

        this.handleTelemetry(dto);
      },
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

    for (const [key, ahu] of this.state) {
      if (
        ahu.isConnected &&
        now - ahu.lastUpdate.getTime() > TIMEOUT
      ) {
        ahu.isConnected = false;
        ahu.lastHealthStatus = 'DISCONNECTED';

        this.gateway.emitEvent({
          type: 'DISCONNECTED',
          timestamp: new Date().toISOString(),
          machineType: 'hvac',
          instanceId: ahu.stationId,
          plantId: ahu.plantId,
          message: `HVAC (${ahu.plantId}/${ahu.stationId}) disconnected`,
        });

        this.logger.warn(`HVAC timeout: ${key} disconnected`);
      }
    }
  }

  handleTelemetry(payload: TelemetryDto) {
    const key = `${payload.plantId}-${payload.stationId}`;

    let ahu = this.state.get(key);

    if (!ahu) {
      ahu = {
        plantId: payload.plantId,
        stationId: payload.stationId,
        lastUpdate: new Date(),
        points: new Map(),
        isConnected: true,
        lastHealthStatus: 'OK',
      };
      this.state.set(key, ahu);
    } else if (!ahu.isConnected) {
      ahu.isConnected = true;
      this.gateway.emitEvent({
        type: 'RECONNECTED',
        timestamp: new Date().toISOString(),
        machineType: 'hvac',
        instanceId: ahu.stationId,
        plantId: ahu.plantId,
        message: `HVAC (${ahu.plantId}/${ahu.stationId}) reconnected`,
      });
      this.logger.log(`HVAC reconnected: ${key}`);
    }

    ahu.lastUpdate = new Date();

    for (const [pointKey, point] of Object.entries(payload.points)) {
      ahu.points.set(pointKey, {
        value: point.value,
        unit: point.unit,
        quality: point.quality ?? 'GOOD',
      });
    }

    // Evaluate health status and emit event on transitions
    const newHealth = this.evaluateHealth(ahu);
    if (newHealth !== ahu.lastHealthStatus) {
      const previousType = ahu.lastHealthStatus as DeviceEventType;
      ahu.lastHealthStatus = newHealth;

      this.gateway.emitEvent({
        type: newHealth,
        previousType,
        timestamp: new Date().toISOString(),
        machineType: 'hvac',
        instanceId: ahu.stationId,
        plantId: ahu.plantId,
        message: `HVAC (${ahu.plantId}/${ahu.stationId}) status: ${newHealth}`,
      });

      this.logger.log(`HVAC health change: ${key} ${previousType} → ${newHealth}`);
    }

    const dto = toTelemetryDto(ahu);
    this.gateway.emitUpdate(dto);

    this.logger.debug(
      `Telemetry received — ${payload.plantId}/${payload.stationId} [${Object.keys(payload.points).join(', ')}]`,
    );
  }

  /**
   * Evaluate the health status of an AHU based on its points.
   * Priority: status point ALARM > BAD quality > status point WARNING > OK
   */
  private evaluateHealth(ahu: InternalAhuState): DeviceEventType {
    const statusPoint = ahu.points.get('status');

    if (statusPoint?.value === 'ALARM') return 'ALARM';

    let hasBadQuality = false;
    for (const point of ahu.points.values()) {
      if (point.quality === 'BAD') {
        hasBadQuality = true;
        break;
      }
    }

    if (statusPoint?.value === 'WARNING') return 'WARNING';
    if (hasBadQuality) return 'WARNING';

    return 'OK';
  }

  getSnapshot(): TelemetryDto[] {
    return Array.from(this.state.values()).map(toTelemetryDto);
  }
}
