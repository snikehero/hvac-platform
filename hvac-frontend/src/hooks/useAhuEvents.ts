import { useTelemetry } from "./useTelemetry";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacEvent } from "@/types/event";

export function useAhuEvents(ahu?: HvacTelemetry): HvacEvent[] {
  const { events } = useTelemetry();
  if (!ahu) return [];
  return events.filter(
    (e) => e.ahuId === ahu.stationId && e.plantId === ahu.plantId,
  );
}
