import { useEffect, useState } from "react";
import type { Telemetry } from "../types/telemetry";
import { getLatestTelemetry } from "../services/hvac.api";
import { socket } from "../services/socket";

export function useHvacTelemetry() {
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);

  useEffect(() => {
    // snapshot inicial
    getLatestTelemetry().then(setTelemetry);

    // tiempo real
    socket.on("telemetry", (data: Telemetry) => {
      setTelemetry((prev) => {
        const key = `${data.stationId}-${data.pointKey}`;
        const index = prev.findIndex(
          (t) => `${t.stationId}-${t.pointKey}` === key,
        );

        if (index >= 0) {
          const copy = [...prev];
          copy[index] = data;
          return copy;
        }

        return [...prev, data];
      });
    });

    return () => {
      socket.off("telemetry");
    };
  }, []);

  return telemetry;
}
