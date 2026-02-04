import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { TelemetryDto } from './dto/telemetry.dto';
import { HvacGateway } from './hvac.gateway';

@Injectable()
export class HvacService {
  private readonly state = new Map<string, TelemetryDto>();

  constructor(
    @Inject(forwardRef(() => HvacGateway))
    private readonly gateway: HvacGateway,
  ) {}

  handleTelemetry(payload: TelemetryDto) {
    const key = `${payload.plantId}-${payload.stationId}`;
    this.state.set(key, payload);
    this.gateway.emitUpdate(payload);
  }

  getSnapshot(): TelemetryDto[] {
    return Array.from(this.state.values());
  }
}
