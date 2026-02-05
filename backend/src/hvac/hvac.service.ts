import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { HvacGateway } from './hvac.gateway';
import { InternalAhuState } from './internal/ahu-state';
import { toTelemetryDto } from './mappers/telemetry.mapper';
import { TelemetryDto } from './dto/telemetry.dto';

@Injectable()
export class HvacService {
  private readonly state = new Map<string, InternalAhuState>();

  constructor(
    @Inject(forwardRef(() => HvacGateway))
    private readonly gateway: HvacGateway,
  ) {}

  // 👈 ahora recibe "payload crudo", NO DTO interno
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

    // 👉 SOLO aquí se vuelve DTO
    const dto = toTelemetryDto(ahu);
    this.gateway.emitUpdate(dto);

    console.log(
      '[HVAC]',
      payload.plantId,
      payload.stationId,
      Object.keys(payload.points),
    );
  }

  getSnapshot(): TelemetryDto[] {
    return Array.from(this.state.values()).map(toTelemetryDto);
  }
}
