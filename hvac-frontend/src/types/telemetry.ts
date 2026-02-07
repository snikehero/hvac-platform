export type Quality = "GOOD" | "BAD" | "UNCERTAIN";

export interface HvacPoint {
  value: number | string | boolean;
  unit?: string;
  quality?: Quality;
}

export interface HvacTelemetry {
  plantId: string;
  stationId: string;
  timestamp: string;
  points: Record<string, HvacPoint>;
}
