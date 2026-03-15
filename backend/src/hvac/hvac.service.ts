import {
  Injectable,
  Inject,
  forwardRef,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { HvacGateway } from './hvac.gateway';
import { InternalAhuState } from './internal/ahu-state';
import { toTelemetryDto } from './mappers/telemetry.mapper';
import { TelemetryDto } from './dto/telemetry.dto';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class HvacService implements OnModuleInit {
  private readonly logger = new Logger(HvacService.name);
  private readonly state = new Map<string, InternalAhuState>();

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
      };
      this.state.set(key, ahu);
    }

    ahu.lastUpdate = new Date(payload.timestamp);

    for (const [pointKey, point] of Object.entries(payload.points)) {
      ahu.points.set(pointKey, {
        value: point.value,
        unit: point.unit,
        quality: point.quality ?? 'GOOD',
      });
    }

    const dto = toTelemetryDto(ahu);
    this.gateway.emitUpdate(dto);

    this.logger.debug(
      `Telemetry received — ${payload.plantId}/${payload.stationId} [${Object.keys(payload.points).join(', ')}]`,
    );
  }

  getSnapshot(): TelemetryDto[] {
    return Array.from(this.state.values()).map(toTelemetryDto);
  }
}
