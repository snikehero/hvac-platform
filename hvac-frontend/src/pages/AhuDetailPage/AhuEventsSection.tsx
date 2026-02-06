/* eslint-disable @typescript-eslint/no-explicit-any */
import AhuEventTimeline from "@/components/EventTimeline/AhuEventTimeLine"
import { AhuSection } from "@/components/ahu/AhuSection"
import type { HvacStatus } from "@/types/hvac-status"
export default function AhuEventsSection({
  events,
  status,
}: {
  events: any[]
  status?: HvacStatus
}) {
  return (
    <AhuSection
      title="Eventos recientes"
      status={status}
    >
      <AhuEventTimeline events={events} />
    </AhuSection>
  )
}