import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacStatus } from "@/types/hvac-status";

export function getAhuStatus(ahu: HvacTelemetry): HvacStatus {
  const raw = ahu.points.status?.value;
  return raw === "ALARM" || raw === "WARNING" || raw === "OK"
    ? raw
    : "OK";
}
