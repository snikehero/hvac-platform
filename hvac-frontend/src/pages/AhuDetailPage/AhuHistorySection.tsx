/* eslint-disable @typescript-eslint/no-explicit-any */
import AhuHistoryChart from "@/components/History/AhuHistoryChart"
import { AhuSection } from "@/components/ahu/AhuSection"
import type { HvacStatus } from "@/types/hvac-status"

export default function AhuHistorySection({
  history,
  status,
}: {
  history: any
  status?: HvacStatus
}) {
  return (
    <AhuSection
      title="Histórico reciente"
      status={status}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <AhuHistoryChart
          title="Temperatura"
          unit="°C"
          data={history.temperature}
          status={status}
        />
        <AhuHistoryChart
          title="Humedad"
          unit="%"
          data={history.humidity}
          status={status}
        />
      </div>
    </AhuSection>
  )
}