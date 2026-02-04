export interface Telemetry {
  plantId: string;
  stationId: string;
  pointKey: string;
  value: number;
  unit?: string;
  timestamp: string;
  quality: "GOOD" | "BAD" | "UNCERTAIN";
}
