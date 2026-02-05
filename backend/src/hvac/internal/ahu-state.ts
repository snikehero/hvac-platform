export interface InternalHvacPoint {
  value: number | string | boolean;
  unit?: string;
  quality: 'GOOD' | 'BAD' | 'UNCERTAIN';
}

export interface InternalAhuState {
  plantId: string;
  stationId: string;
  lastUpdate: Date;
  points: Map<string, InternalHvacPoint>;
}
