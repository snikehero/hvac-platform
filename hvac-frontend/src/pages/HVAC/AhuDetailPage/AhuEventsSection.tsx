/* eslint-disable @typescript-eslint/no-explicit-any */
import AhuEventTimeline from "@/pages/HVAC/AhuDetailPage/EventsPanel/AhuEventTimeLine";
import { AhuSection } from "@/pages/HVAC/AhuDetailPage/ahu/AhuSection";
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth";

export default function AhuEventsSection({
  events,
  status,
}: {
  events: any[];
  status: AhuHealthStatus;
}) {
  return (
    <AhuSection title="Eventos recientes" status={status}>
      <AhuEventTimeline events={events} />
    </AhuSection>
  );
}
