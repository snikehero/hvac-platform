import { useEffect, useRef } from "react";
import { STALE_THRESHOLD_MS } from "@/domain/ahu/constants";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacEvent } from "@/types/event";

export function useConnectivityMonitor(
  telemetry: HvacTelemetry[],
  setEvents: React.Dispatch<React.SetStateAction<HvacEvent[]>>
) {
  const lastConnectivityRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newEvents: HvacEvent[] = [];

      telemetry.forEach((ahu) => {
        const key = `${ahu.plantId}-${ahu.stationId}`;
        const lastUpdate = new Date(ahu.timestamp).getTime();

        const isDisconnected =
          now - lastUpdate > STALE_THRESHOLD_MS;

        const wasDisconnected =
          lastConnectivityRef.current[key] ?? false;

        if (isDisconnected && !wasDisconnected) {
          newEvents.push({
            timestamp: new Date().toISOString(),
            ahuId: ahu.stationId,
            plantId: ahu.plantId,
            type: "DISCONNECTED",
            message: "Unidad perdió comunicación",
          });
        }

        if (!isDisconnected && wasDisconnected) {
          newEvents.push({
            timestamp: new Date().toISOString(),
            ahuId: ahu.stationId,
            plantId: ahu.plantId,
            type: "OK",
            message: "Unidad restableció comunicación",
          });
        }

        lastConnectivityRef.current[key] = isDisconnected;
      });

      if (newEvents.length > 0) {
        setEvents((prev) =>
          [...newEvents, ...prev].slice(0, 50)
        );
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [telemetry, setEvents]);
}
