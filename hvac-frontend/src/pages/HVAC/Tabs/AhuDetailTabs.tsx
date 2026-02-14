import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AhuDetailPage from "../AhuDetailPage/AhuDetailContent";
import AhuEventsPage from "../AhuEventsPage/AhuEventsPage";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useParams } from "react-router-dom";
import { useAhuEvents } from "@/hooks/useAhuEvents";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";

export default function AhuDetailTabs() {
  const { telemetry } = useTelemetry();
  const { ahuId, plantId } = useParams();

  const ahu = telemetry.find(
    (t) => t.stationId === ahuId && t.plantId === plantId,
  );

  const events = useAhuEvents(ahu);

  const health = ahu ? getAhuHealth(ahu) : undefined;

  // 🔥 Glow solo si realmente está en ALARM
  const alarmActive = health?.status === "ALARM";

  return (
    <Tabs defaultValue="detail" className="h-screen">
      <TabsList className="mb-2">
        <TabsTrigger value="detail">Detalle</TabsTrigger>

        <TabsTrigger
          value="events"
          className={alarmActive ? "alarm-glow relative" : "relative"}
        >
          Eventos
          {events.length > 0 && (
            <span className="absolute -top-1 -right-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
              {events.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="detail" className="h-full">
        <AhuDetailPage />
      </TabsContent>

      <TabsContent value="events" className="h-full overflow-y-auto">
        <AhuEventsPage />
      </TabsContent>
    </Tabs>
  );
}
