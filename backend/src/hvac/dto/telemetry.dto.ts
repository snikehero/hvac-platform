export class HvacPointDto {
  value: number | string | boolean;
  unit?: string;
  quality?: 'GOOD' | 'BAD' | 'UNCERTAIN';
}

export class TelemetryDto {
  plantId: string;
  stationId: string;
  timestamp: string;
  points: Record<string, HvacPointDto>;
}
