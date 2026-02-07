import { useTelemetry } from "./useTelemetry";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacEvent } from "@/types/event";

/**
 * Hook que devuelve los eventos de un AHU específico
 * usando el estado global de eventos del provider.
 */
export function useAhuEvents(ahu?: HvacTelemetry): HvacEvent[] {
  const { events } = useTelemetry(); // eventos globales

  if (!ahu) return [];

  // filtrar los eventos que pertenecen a este AHU
  return events.filter(
    (e) => e.ahuId === ahu.stationId && e.plantId === ahu.plantId,
  );
}
