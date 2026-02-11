import { useMemo } from "react"
import type { HvacTelemetry } from "@/types/telemetry"
import { getAhuHealth } from "@/domain/ahu/getAhuHealth"

export function useFilteredAhus(
  telemetry: HvacTelemetry[],
  plantFilter: string | null,
  statusFilter: "OK" | "WARNING" | "ALARM" | "DISCONNECTED" | null
) {
  return useMemo(() => {
    return telemetry.filter((ahu) => {
      const health = getAhuHealth(ahu)
      const status = health.status

      /* ---------- filtro planta ---------- */
      if (plantFilter && ahu.plantId !== plantFilter) {
        return false
      }

      /* ---------- sin filtro de estado ---------- */
      if (!statusFilter) {
        return true
      }

      /* ---------- filtro por estado real (health) ---------- */
      return status === statusFilter
    })
  }, [telemetry, plantFilter, statusFilter])
}
