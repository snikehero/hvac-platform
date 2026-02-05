import { InternalAhuState } from '../internal/ahu-state';
import { TelemetryDto } from '../dto/telemetry.dto';

export function toTelemetryDto(state: InternalAhuState): TelemetryDto {
  return {
    plantId: state.plantId,
    stationId: state.stationId,
    timestamp: state.lastUpdate.toISOString(),
    points: Object.fromEntries(state.points),
  };
}
