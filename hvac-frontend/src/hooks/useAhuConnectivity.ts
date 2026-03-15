import { useCallback } from "react";
import { STALE_THRESHOLD_MS } from "@/domain/ahu/constants";
import type { HvacTelemetry } from "@/types/telemetry";
import {
  useDeviceConnectivity,
  type DeviceConnectionStatus,
} from "./useDeviceConnectivity";

export type AhuConnectionStatus = DeviceConnectionStatus;

function getAhuKey(plantId: string, stationId: string): string {
  return `${plantId}-${stationId}`;
}

interface UseAhuConnectivityReturn {
  ahuConnectionStatus: Record<string, AhuConnectionStatus>;
  isAhuConnected: (plantId: string, stationId: string) => boolean;
  updateLastSeen: (plantId: string, stationId: string) => void;
  setConnectionStatus: React.Dispatch<
    React.SetStateAction<Record<string, AhuConnectionStatus>>
  >;
  markAllAsDisconnected: () => void;
}

/**
 * Hook responsible for tracking AHU connectivity status
 * @param disconnectTimeoutMs - Timeout in milliseconds before marking an AHU as disconnected (defaults to STALE_THRESHOLD_MS)
 * @param checkIntervalMs - How often (in ms) to run the connectivity check (defaults to 5000)
 */
export function useAhuConnectivity(
  telemetry: HvacTelemetry[],
  onDisconnected: (ahu: { plantId: string; stationId: string }) => void,
  isWebSocketConnected: boolean,
  disconnectTimeoutMs: number = STALE_THRESHOLD_MS,
  checkIntervalMs: number = 5_000,
): UseAhuConnectivityReturn {
  const handleDisconnected = useCallback(
    (deviceKey: string) => {
      // Find the telemetry object to know plantId and stationId
      // Or we can just parse the deviceKey since it's `plantId-stationId`
      const ahu = telemetry.find(
        (t) => getAhuKey(t.plantId, t.stationId) === deviceKey,
      );

      if (ahu) {
        onDisconnected({ plantId: ahu.plantId, stationId: ahu.stationId });
      } else {
        // Fallback in case telemetry is empty or ahu is not found
        const [plantId, stationId] = deviceKey.split("-");
        if (plantId && stationId) {
          onDisconnected({ plantId, stationId });
        }
      }
    },
    [onDisconnected, telemetry],
  );

  const {
    connectionStatus,
    isConnected,
    updateLastSeen,
    setConnectionStatus,
    markAllAsDisconnected,
  } = useDeviceConnectivity(
    isWebSocketConnected,
    handleDisconnected,
    disconnectTimeoutMs,
    checkIntervalMs,
  );

  const updateAhuLastSeen = useCallback(
    (plantId: string, stationId: string) => {
      updateLastSeen(getAhuKey(plantId, stationId));
    },
    [updateLastSeen],
  );

  const isAhuConnected = useCallback(
    (plantId: string, stationId: string) => {
      return isConnected(getAhuKey(plantId, stationId));
    },
    [isConnected],
  );

  return {
    ahuConnectionStatus: connectionStatus,
    isAhuConnected,
    updateLastSeen: updateAhuLastSeen,
    setConnectionStatus,
    markAllAsDisconnected,
  };
}

export { getAhuKey };
