import { useTelemetry } from "./useTelemetry"
import type { HvacTelemetry } from "@/types/telemetry"
import type { HvacEvent } from "@/types/event"

export function useAhuEvents(ahu?: HvacTelemetry): HvacEvent[] {
  const { events } = useTelemetry()
  if (!ahu) return []




  // 1️⃣ Filtrar solo eventos del AHU
  const ahuEvents = events
    .filter(
      e =>
        e.ahuId === ahu.stationId &&
        e.plantId === ahu.plantId
    )
    // 2️⃣ Ordenar por tiempo ASC
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    )

  const result: HvacEvent[] = []
  let lastWasCritical = false

  for (const event of ahuEvents) {
    if (event.type === "OK") {
      // OK solo si es recuperación real
      if (lastWasCritical) {
        result.push(event)
        lastWasCritical = false
      }
      continue
    }

    // WARNING o ALARM
    result.push(event)
    lastWasCritical = true
  }

  return result
}
