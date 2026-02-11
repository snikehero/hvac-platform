/* eslint-disable react-hooks/rules-of-hooks */
import { useParams } from "react-router-dom";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAhuEvents } from "@/hooks/useAhuEvents";

import { getAhuHealth } from "@/domain/ahu/getAhuHealth";
import AhuEventsSection from "../AhuDetailPage/AhuEventsSection";

export default function AhuEventsPage() {
  const { telemetry } = useTelemetry();
  const { ahuId, plantId } = useParams();

  const ahu = telemetry.find(
    (t) => t.stationId === ahuId && t.plantId === plantId,
  );

  if (!ahu) return null;

  const events = useAhuEvents(ahu);

  // ✅ Dominio decide estado real
  const health = getAhuHealth(ahu);

  return (
    <div className="h-full p-4 space-y-2">
      <h2 className="text-lg font-semibold">
        Eventos – {ahu.stationId}
      </h2>

      <AhuEventsSection
        events={events}
        status={health.status}
      />
    </div>
  );
}
