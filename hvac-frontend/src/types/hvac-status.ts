export type HvacStatus = "OK" | "WARNING" | "ALARM"

export function isHvacStatus(
  value: unknown
): value is HvacStatus {
  return (
    value === "OK" ||
    value === "WARNING" ||
    value === "ALARM"
  )
}