import type { HvacTelemetry } from "@/types/telemetry"
import type { HvacStatus } from "@/types/hvac-status"
import { AhuSection } from "@/components/ahu/AhuSection"
import { AhuDataRow } from "@/components/ahu/AhuDataRow"
import { AHU_SECTIONS } from "@/config/ahuSections.config"
export default function AhuOperationalSections({
  ahu,
  status,
}: {
  ahu: HvacTelemetry
  status?: HvacStatus
}) {
  return (
  <div
    className="
      grid
      grid-cols-1
      sm:grid-cols-2
      xl:grid-cols-3
      gap-4
    "
  >
    {AHU_SECTIONS.map(section => (
      <AhuSection
        key={section.title}
        title={section.title}
        status={status}
      >
        {section.rows.map(row => {
          const point = ahu.points[row.pointKey]
          const formattedPoint =
            point && row.format
              ? { ...point, value: row.format(point.value) }
              : point

          return (
            <AhuDataRow
              key={row.label}
              label={row.label}
              point={formattedPoint}
            />
          )
        })}
      </AhuSection>
    ))}
  </div>
)

}
