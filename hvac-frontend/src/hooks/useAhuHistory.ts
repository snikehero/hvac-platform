import { useMemo } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import type { HistoryPoint } from "@/types/history";
import type { HvacTelemetry } from "@/types/telemetry";

export function useAhuHistory(ahu?: HvacTelemetry) {
  const { history } = useTelemetry();

  // Crear la clave del AHU actual
  const key = ahu ? `${ahu.plantId}-${ahu.stationId}` : undefined;

  // Memoizar para no recalcular en cada render
  const result = useMemo(() => {
    if (!key || !history[key]) {
      return {
        temperature: [] as HistoryPoint[],
        humidity: [] as HistoryPoint[],
      };
    }
    return history[key];
  }, [key, history]);

  return result;
}
