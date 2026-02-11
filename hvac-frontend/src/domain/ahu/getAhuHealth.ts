import type { HvacTelemetry, HvacPoint } from "@/types/telemetry"

import { STALE_THRESHOLD_MS } from "./constants"

export type AhuHealthStatus =
  | "OK"
  | "WARNING"
  | "ALARM"
  | "DISCONNECTED"


export function getAhuHealth(
  ahu: HvacTelemetry,
  hvacStatus?: AhuHealthStatus
): {
  status: AhuHealthStatus
  badPoints: number
  lastUpdate: Date
} {
  const now = Date.now()
  const lastUpdate = new Date(ahu.timestamp)

  // 1️⃣ Desconectado
  if (now - lastUpdate.getTime() > STALE_THRESHOLD_MS) {
    return {
      status: "DISCONNECTED",
      badPoints: 0,
      lastUpdate,
    }
  }

  // 2️⃣ Alarma dura
  if (hvacStatus === "ALARM") {
    return {
      status: "ALARM",
      badPoints: 0,
      lastUpdate,
    }
  }

  // 3️⃣ Contar puntos BAD
  const points = Object.values(ahu.points) as HvacPoint[]
  const badPoints = points.filter(
    p => p?.quality === "BAD"
  ).length

  if (badPoints > 0) {
    return {
      status: "WARNING",
      badPoints,
      lastUpdate,
    }
  }

  // 4️⃣ Todo OK
  return {
    status: "OK",
    badPoints: 0,
    lastUpdate,
  }
}
