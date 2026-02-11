import type { HvacTelemetry, HvacPoint } from "@/types/telemetry"

import { STALE_THRESHOLD_MS } from "./constants"

export type AhuHealthStatus =
  | "OK"
  | "WARNING"
  | "ALARM"
  | "DISCONNECTED"


export function getAhuHealth(
  ahu: HvacTelemetry,
  operationalStatus?: "OK" | "WARNING" | "ALARM"
): {
  status: AhuHealthStatus
  badPoints: number
  lastUpdate: Date
} {
  const now = Date.now()
  const lastUpdate = new Date(ahu.timestamp)

  // 1️⃣ DISCONNECTED (máxima prioridad)
  if (now - lastUpdate.getTime() > STALE_THRESHOLD_MS) {
    return {
      status: "DISCONNECTED",
      badPoints: 0,
      lastUpdate,
    }
  }

  // 2️⃣ ALARM operacional (segunda prioridad)
  if (operationalStatus === "ALARM") {
    return {
      status: "ALARM",
      badPoints: 0,
      lastUpdate,
    }
  }

  // 3️⃣ Contar BAD points
  const points = Object.values(ahu.points) as HvacPoint[]
  const badPoints = points.filter(p => p?.quality === "BAD").length

  if (badPoints > 0) {
    return {
      status: "WARNING",
      badPoints,
      lastUpdate,
    }
  }

  // 4️⃣ WARNING operacional explícito
  if (operationalStatus === "WARNING") {
    return {
      status: "WARNING",
      badPoints: 0,
      lastUpdate,
    }
  }

  // 5️⃣ OK
  return {
    status: "OK",
    badPoints: 0,
    lastUpdate,
  }
}
