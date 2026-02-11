export type HvacEventType = "OK" | "WARNING" | "ALARM" | "DISCONNECTED"

export interface HvacEvent {
  timestamp: string
  ahuId: string
  plantId: string
  type: HvacEventType
  message: string
}
