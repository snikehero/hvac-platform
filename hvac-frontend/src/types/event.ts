export type HvacEventType = "OK" | "WARNING" | "ALARM"

export interface HvacEvent {
  timestamp: string
  ahuId: string
  plantId: string
  type: HvacEventType
  message: string
}
