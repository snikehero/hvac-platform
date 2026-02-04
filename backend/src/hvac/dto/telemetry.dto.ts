export class TelemetryDto {
  plantId: string;
  stationId: string;
  pointKey: string;
  value: number | boolean | string;
  unit?: string;
  timestamp: Date;
  quality?: 'GOOD' | 'BAD' | 'UNCERTAIN';
}
