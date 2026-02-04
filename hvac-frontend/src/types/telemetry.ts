export interface TelemetryDto {
  plantId: string
  stationId: string
  pointKey: string
  value: number | boolean | string
  unit?: string
  timestamp: string | Date
  quality?: "GOOD" | "BAD" | "UNCERTAIN"
}
