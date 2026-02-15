import { useCallback, useEffect, useRef, useState } from "react";
import { STALE_THRESHOLD_MS } from "@/domain/ahu/constants";
import type { HvacTelemetry } from "@/types/telemetry";

export interface AhuConnectionStatus {
  isConnected: boolean;
  lastSeen: number;
}

const CONNECTIVITY_CHECK_INTERVAL = 5_000;

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
 */
export function useAhuConnectivity(
  telemetry: HvacTelemetry[],
  onDisconnected: (ahu: { plantId: string; stationId: string }) => void,
  isWebSocketConnected: boolean,
): UseAhuConnectivityReturn {
  const [ahuConnectionStatus, setAhuConnectionStatus] = useState<
    Record<string, AhuConnectionStatus>
  >({});

  const lastSeenRef = useRef<Record<string, number>>({});
  const telemetryRef = useRef<HvacTelemetry[]>(telemetry);

  // Keep telemetry ref in sync
  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  const updateLastSeen = useCallback((plantId: string, stationId: string) => {
    const key = getAhuKey(plantId, stationId);
    const now = Date.now();
    lastSeenRef.current[key] = now;

    setAhuConnectionStatus((prev) => ({
      ...prev,
      [key]: { isConnected: true, lastSeen: now },
    }));
  }, []);

  const isAhuConnected = useCallback(
    (plantId: string, stationId: string): boolean => {
      const key = getAhuKey(plantId, stationId);
      const status = ahuConnectionStatus[key];
      if (!status) return false;
      return status.isConnected;
    },
    [ahuConnectionStatus],
  );

  const markAllAsDisconnected = useCallback(() => {
    setAhuConnectionStatus((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key] = {
          ...updated[key],
          isConnected: false,
        };
      });
      return updated;
    });
  }, []);

  // Periodic connectivity check
  useEffect(() => {
    // Don't check AHU connectivity if WebSocket is disconnected
    if (!isWebSocketConnected) {
      return;
    }

    const checkConnectivity = () => {
      const now = Date.now();

      Object.entries(lastSeenRef.current).forEach(([key, lastSeen]) => {
        const isStale = now - lastSeen > STALE_THRESHOLD_MS;

        if (isStale) {
          const ahu = telemetryRef.current.find(
            (t) => getAhuKey(t.plantId, t.stationId) === key,
          );

          if (ahu) {
            // Mark as disconnected FIRST
            setAhuConnectionStatus((prev) => ({
              ...prev,
              [key]: {
                ...prev[key],
                isConnected: false,
              },
            }));

            // Then notify via callback
            onDisconnected({ plantId: ahu.plantId, stationId: ahu.stationId });
          }
        }
      });
    };

    const intervalId = setInterval(
      checkConnectivity,
      CONNECTIVITY_CHECK_INTERVAL,
    );

    return () => clearInterval(intervalId);
  }, [onDisconnected, isWebSocketConnected]);

  return {
    ahuConnectionStatus,
    isAhuConnected,
    updateLastSeen,
    setConnectionStatus: setAhuConnectionStatus,
    markAllAsDisconnected,
  };
}

export { getAhuKey };
