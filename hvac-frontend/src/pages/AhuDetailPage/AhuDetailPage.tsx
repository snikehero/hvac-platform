/* eslint-disable react-hooks/rules-of-hooks */
import { useParams } from "react-router-dom"
import { useTelemetry } from "@/hooks/useTelemetry"
import { useAhuHistory } from "@/hooks/useAhuHistory"
import { useAhuEvents } from "@/hooks/useAhuEvents"
import type { HvacStatus } from "@/types/hvac-status"

import AhuHeader from "./AhuHeader"
import AhuOperationalSections from "./AhuOperationalSections"
import AhuHistorySection from "./AhuHistorySection"
import AhuEventsSection from "./AhuEventsSection"

export default function AhuDetailPage() {
  const { telemetry } = useTelemetry()
  const { ahuId, plantId } = useParams()

  const ahu = telemetry.find(
    t => t.stationId === ahuId && t.plantId === plantId
  )

  if (!ahu) {
    return (
      <div className="text-muted-foreground">
        AHU no encontrado
      </div>
    )
  }

  const hvacStatus: HvacStatus | undefined =
  ahu.points.status?.value === "OK" ||
  ahu.points.status?.value === "WARNING" ||
  ahu.points.status?.value === "ALARM"
    ? ahu.points.status.value
    : undefined

  const history = useAhuHistory(ahu)
  const events = useAhuEvents(ahu)

  return (
    <div className="space-y-6">
      <AhuHeader ahu={ahu} status={hvacStatus} />

      <AhuOperationalSections ahu={ahu} status={hvacStatus} />

      <AhuHistorySection history={history} status={hvacStatus} />

      <AhuEventsSection events={events} status={hvacStatus} />

      <div className="text-xs text-muted-foreground">
        Última actualización:{" "}
        {new Date(ahu.timestamp).toLocaleString()}
      </div>
    </div>
  )
}
