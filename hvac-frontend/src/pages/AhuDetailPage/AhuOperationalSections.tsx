import { useState } from "react"
import type { HvacTelemetry } from "@/types/telemetry"
import type { HvacStatus } from "@/types/hvac-status"
import { AhuSection } from "@/components/ahu/AhuSection"
import { AhuDataRow } from "@/components/ahu/AhuDataRow"
import { AHU_SECTIONS } from "@/config/ahuSections.config"
import { SortableAhuSection } from "./SortableAhuSection"

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core"

import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"

export default function AhuOperationalSections({
  ahu,
  status,
}: {
  ahu: HvacTelemetry
  status?: HvacStatus
}) {
  const [sections, setSections] = useState(AHU_SECTIONS)

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={event => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        setSections(items => {
          const oldIndex = items.findIndex(
            s => s.title === active.id
          )
          const newIndex = items.findIndex(
            s => s.title === over.id
          )

          return arrayMove(items, oldIndex, newIndex)
        })
      }}
    >
      <SortableContext
        items={sections.map(s => s.title)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sections.map(section => (
            <SortableAhuSection
              key={section.title}
              id={section.title}
            >
              <AhuSection
                title={section.title}
                status={status}
              >
                {section.rows.map(row => {
                  const point = ahu.points[row.pointKey]
                  const formattedPoint =
                    point && row.format
                      ? {
                          ...point,
                          displayValue: row.format(point.value),
                        }
                      : point

                  return (
                    <AhuDataRow
                      key={row.label}
                      label={row.label}
                      pointKey={row.pointKey}
                      point={formattedPoint}
                    />
                  )
                })}
              </AhuSection>
            </SortableAhuSection>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
