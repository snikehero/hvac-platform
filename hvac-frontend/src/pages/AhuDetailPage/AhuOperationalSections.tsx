import type { HvacTelemetry } from "@/types/telemetry"
import { AhuSection } from "@/components/ahu/AhuSection"
import { AhuDataRow } from "@/components/ahu/AhuDataRow"
import type { HvacStatus } from "@/types/hvac-status"

export default function AhuOperationalSections({
  ahu,
  status,
}: {
  ahu: HvacTelemetry
  status?: HvacStatus
}) {
  return (
    <>
      <AhuSection
        title="Temperatura y Humedad"
        backgroundImage="/images/temp-bg.jpg"
        status={status}
      >
        <AhuDataRow
          label="Temperatura"
          point={ahu.points.temperature}
        />
        <AhuDataRow
          label="Humedad"
          point={ahu.points.humidity}
        />
      </AhuSection>

      <AhuSection
        title="Ventilación"
        backgroundImage="/images/ventilation-bg.jpg"
        status={status}
      >
        <AhuDataRow
          label="Ventilador"
          point={ahu.points.fan_status}
        />
        <AhuDataRow
          label="Flujo de aire"
          point={ahu.points.airflow}
        />
        <AhuDataRow
          label="Compuerta"
          point={ahu.points.damper_position}
        />
      </AhuSection>

      <AhuSection
        title="Estado y Energía"
        backgroundImage="/images/energy-bg.jpg"
        status={status}
      >
        <AhuDataRow
          label="Energía"
          point={ahu.points.power_status}
        />
        <AhuDataRow
          label="ΔP Filtros"
          point={ahu.points.filter_dp}
        />
      </AhuSection>
    </>
  )
}