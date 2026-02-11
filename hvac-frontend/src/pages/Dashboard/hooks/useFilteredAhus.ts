import { useMemo } from "react"
import type { HvacTelemetry } from "@/types/telemetry"
import { getAhuOperationalStatus } from "@/domain/ahu/ahuSelectors"

export function useFilteredAhus(
  telemetry: HvacTelemetry[],
  plantFilter: string | null,
  statusFilter: "OK" | "WARNING" | "ALARM" | "DISCONNECTED" | null
) {
  return useMemo(() => {
    return telemetry.filter((ahu) => {
      const status = getAhuOperationalStatus(ahu)

      /* ---------- filtro planta ---------- */
      if (plantFilter && ahu.plantId !== plantFilter) {
        return false
      }

      /* ---------- sin filtro de estado ---------- */
      if (!statusFilter) {
        return true
      }

      /* ---------- filtro por estado operacional ---------- */
      return status === statusFilter
    })
  }, [telemetry, plantFilter, statusFilter])
}
