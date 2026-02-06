import { useEffect, useRef, useState } from "react"
import type { HvacTelemetry } from "@/types/telemetry"
import type { HvacEvent } from "@/types/event"

export function useAhuEvents(ahu?: HvacTelemetry) {
  const [events, setEvents] = useState<HvacEvent[]>([])
  const lastStatusRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!ahu) return

    const currentStatus = ahu.points.status?.value as
      | "OK"
      | "WARNING"
      | "ALARM"
      | undefined

    if (!currentStatus) return

    // Primera lectura
    if (!lastStatusRef.current) {
      lastStatusRef.current = currentStatus
      return
    }

    // Cambio de estado => evento
    if (currentStatus !== lastStatusRef.current) {
      const event: HvacEvent = {
        timestamp: ahu.timestamp,
        ahuId: ahu.stationId,
        plantId: ahu.plantId,
        type: currentStatus,
        message: buildMessage(currentStatus, lastStatusRef.current),
      }

      setEvents(prev => [event, ...prev].slice(0, 50))
      lastStatusRef.current = currentStatus
    }
  }, [ahu])

  return events
}

/* ---------- helpers ---------- */

function buildMessage(
  current: string,
  previous: string,
) {
  if (current === "ALARM") {
    return "Unidad entró en ALARMA"
  }

  if (current === "WARNING") {
    return "Unidad en condición de ADVERTENCIA"
  }

  if (current === "OK") {
    return "Unidad volvió a estado NORMAL"
  }

  return `Cambio de estado: ${previous} → ${current}`
}
