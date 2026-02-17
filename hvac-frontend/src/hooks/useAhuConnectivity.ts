import { useCallback, useEffect, useRef, useState } from "react";
import { STALE_THRESHOLD_MS } from "@/domain/ahu/constants";
import type { HvacTelemetry } from "@/types/telemetry";

export interface AhuConnectionStatus {
  isConnected: boolean;
  lastSeen: number;
}

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
        const isStale = now - lastSeen > disconnectTimeoutMs;

        if (isStale) {
          const ahu = telemetryRef.current.find(
            (t) => getAhuKey(t.plantId, t.stationId) === key,
          );

          if (ahu) {
            // Only notify if the status is changing from connected to disconnected
            setAhuConnectionStatus((prev) => {
              const wasConnected = prev[key]?.isConnected !== false;

              // Only call onDisconnected if state is changing
              if (wasConnected) {
                // Use setTimeout to ensure state update happens first
                setTimeout(() => {
                  onDisconnected({ plantId: ahu.plantId, stationId: ahu.stationId });
                }, 0);
              }

              return {
                ...prev,
                [key]: {
                  ...prev[key],
                  isConnected: false,
                },
              };
            });
          }
        }
      });
    };

    const intervalId = setInterval(
      checkConnectivity,
      checkIntervalMs,
    );

    return () => clearInterval(intervalId);
  }, [onDisconnected, isWebSocketConnected, disconnectTimeoutMs, checkIntervalMs]);

  return {
    ahuConnectionStatus,
    isAhuConnected,
    updateLastSeen,
    setConnectionStatus: setAhuConnectionStatus,
    markAllAsDisconnected,
  };
}

export { getAhuKey };
