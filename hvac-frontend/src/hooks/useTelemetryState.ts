import { useCallback, useState } from "react";
import type { HvacTelemetry } from "@/types/telemetry";

interface UseTelemetryStateReturn {
  telemetry: HvacTelemetry[];
  setTelemetry: React.Dispatch<React.SetStateAction<HvacTelemetry[]>>;
  updateTelemetry: (ahu: HvacTelemetry) => void;
}

/**
 * Hook responsible for managing telemetry state
 */
export function useTelemetryState(): UseTelemetryStateReturn {
  const [telemetry, setTelemetry] = useState<HvacTelemetry[]>([]);

  const updateTelemetry = useCallback((ahu: HvacTelemetry) => {
    setTelemetry((prev) => {
      const idx = prev.findIndex(
        (p) => p.stationId === ahu.stationId && p.plantId === ahu.plantId,
      );

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = ahu;
        return copy;
      }

      return [...prev, ahu];
    });
  }, []);

  return {
    telemetry,
    setTelemetry,
    updateTelemetry,
  };
}
