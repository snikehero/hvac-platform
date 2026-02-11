import type { HvacTelemetry } from "@/types/telemetry"

export type RawHvacStatus = "OK" | "WARNING" | "ALARM"

export function getAhuStatus(ahu: HvacTelemetry): RawHvacStatus {
  const raw = ahu.points.status?.value

  if (raw === "ALARM" || raw === "WARNING" || raw === "OK") {
    return raw
  }

  // fallback seguro
  return "OK"
}
