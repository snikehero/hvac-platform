import { useContext, useMemo } from "react";
import { TelemetryContext } from "@/providers/WebSocketProvider";

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error("useTelemetry must be used inside WebSocketProvider");
  }
  return ctx;
}

/**
 * Hook to get telemetry for a specific AHU with connection status
 */
export function useAhuTelemetry(plantId: string, stationId: string) {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error("useAhuTelemetry must be used inside WebSocketProvider");
  }

  const { telemetry, ahuConnectionStatus, history, activeCounts } = ctx;
  const key = `${plantId}-${stationId}`;

  return useMemo(() => {
    const ahu = telemetry.find(
      (t) => t.plantId === plantId && t.stationId === stationId
    );

    const connectionStatus = ahuConnectionStatus[key];
    const ahuHistory = history[key];
    const counts = activeCounts[key];

    return {
      data: ahu ?? null,
      isConnected: connectionStatus?.isConnected ?? false,
      lastSeen: connectionStatus?.lastSeen ?? null,
      history: ahuHistory ?? { temperature: [], humidity: [] },
      alarms: counts?.alarms ?? 0,
      warnings: counts?.warnings ?? 0,
    };
  }, [telemetry, ahuConnectionStatus, history, activeCounts, plantId, stationId, key]);
}
