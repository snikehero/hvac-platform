import { useMemo } from "react"
import type { HvacTelemetry } from "@/types/telemetry"
import { getAhuHealth } from "@/domain/ahu/getAhuHealth"

export interface PlantStats {
  plantId: string
  total: number
  alarms: number
  warnings: number
  disconnected: number
  status: "CRITICAL" | "DEGRADED" | "HEALTHY"
}

export function usePlantStats(telemetry: HvacTelemetry[]) {
  return useMemo(() => {
    const map = new Map<string, PlantStats>()

    telemetry.forEach((ahu) => {
      const health = getAhuHealth(ahu)

      if (!map.has(ahu.plantId)) {
        map.set(ahu.plantId, {
          plantId: ahu.plantId,
          total: 0,
          alarms: 0,
          warnings: 0,
          disconnected: 0,
          status: "HEALTHY",
        })
      }

      const plant = map.get(ahu.plantId)!
      plant.total++

      if (health.status === "ALARM") plant.alarms++
      else if (health.status === "WARNING") plant.warnings++
      else if (health.status === "DISCONNECTED") plant.disconnected++
    })

    // Determinar estado final por planta
    map.forEach((plant) => {
      if (plant.alarms > 0) {
        plant.status = "CRITICAL"
      } else if (plant.warnings > 0 || plant.disconnected > 0) {
        plant.status = "DEGRADED"
      } else {
        plant.status = "HEALTHY"
      }
    })

    return Array.from(map.values())
  }, [telemetry])
}
