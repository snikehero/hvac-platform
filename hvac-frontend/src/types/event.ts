export type HvacEventType = "OK" | "WARNING" | "ALARM" | "DISCONNECTED"

export interface HvacEvent {
  timestamp: string
  ahuId: string
  plantId: string
  type: HvacEventType
  previousType?: HvacEventType
  message: string
}

/**
 * Translates an event message at render time based on type/previousType.
 * This avoids "frozen" translations when the user switches language.
 */
export function getEventMessage(
  event: HvacEvent,
  eventMessages: {
    enteredAlarm: string
    warningCondition: string
    communicationRestored: string
    backToNormal: string
    communicationLost: string
    statusChange: string
  },
  tf: (text: string, values: Record<string, string | number>) => string,
): string {
  const { type, previousType } = event

  if (type === "ALARM") return eventMessages.enteredAlarm
  if (type === "WARNING") return eventMessages.warningCondition
  if (type === "OK" && previousType === "DISCONNECTED")
    return eventMessages.communicationRestored
  if (type === "OK") return eventMessages.backToNormal
  if (type === "DISCONNECTED") return eventMessages.communicationLost
  return tf(eventMessages.statusChange, {
    previous: previousType ?? "OK",
    current: type,
  })
}
