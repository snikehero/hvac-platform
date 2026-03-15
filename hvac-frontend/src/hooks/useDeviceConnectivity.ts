import { useCallback, useEffect, useRef, useState } from "react";

export interface DeviceConnectionStatus {
  isConnected: boolean;
  lastSeen: number;
}

export interface UseDeviceConnectivityReturn {
  connectionStatus: Record<string, DeviceConnectionStatus>;
  isConnected: (deviceKey: string) => boolean;
  updateLastSeen: (deviceKey: string) => void;
  setConnectionStatus: React.Dispatch<
    React.SetStateAction<Record<string, DeviceConnectionStatus>>
  >;
  markAllAsDisconnected: () => void;
}

/**
 * Hook responsible for tracking device connectivity status
 * @param isWebSocketConnected - Whether the global websocket is connected
 * @param onDisconnected - Callback when a device is considered disconnected
 * @param disconnectTimeoutMs - Timeout in milliseconds before marking as disconnected
 * @param checkIntervalMs - How often (in ms) to run the connectivity check (defaults to 5000)
 */
export function useDeviceConnectivity(
  isWebSocketConnected: boolean,
  onDisconnected?: (deviceKey: string) => void,
  disconnectTimeoutMs: number = 60000,
  checkIntervalMs: number = 5000,
): UseDeviceConnectivityReturn {
  const [connectionStatus, setConnectionStatus] = useState<
    Record<string, DeviceConnectionStatus>
  >({});

  const lastSeenRef = useRef<Record<string, number>>({});

  const updateLastSeen = useCallback((deviceKey: string) => {
    const now = Date.now();
    lastSeenRef.current[deviceKey] = now;

    setConnectionStatus((prev) => ({
      ...prev,
      [deviceKey]: { isConnected: true, lastSeen: now },
    }));
  }, []);

  const isConnected = useCallback(
    (deviceKey: string): boolean => {
      const status = connectionStatus[deviceKey];
      if (!status) return false;
      return status.isConnected;
    },
    [connectionStatus],
  );

  const markAllAsDisconnected = useCallback(() => {
    setConnectionStatus((prev) => {
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
    // Don't check connectivity if WebSocket is disconnected
    if (!isWebSocketConnected) {
      return;
    }

    const checkConnectivity = () => {
      const now = Date.now();

      Object.entries(lastSeenRef.current).forEach(([key, lastSeen]) => {
        const isStale = now - lastSeen > disconnectTimeoutMs;

        if (isStale) {
          // Only notify if the status is changing from connected to disconnected
          setConnectionStatus((prev) => {
            const wasConnected = prev[key]?.isConnected !== false;

            // Only call onDisconnected if state is changing
            if (wasConnected && onDisconnected) {
              // Use setTimeout to ensure state update happens first
              setTimeout(() => {
                onDisconnected(key);
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
      });
    };

    const intervalId = setInterval(checkConnectivity, checkIntervalMs);

    return () => clearInterval(intervalId);
  }, [onDisconnected, isWebSocketConnected, disconnectTimeoutMs, checkIntervalMs]);

  return {
    connectionStatus,
    isConnected,
    updateLastSeen,
    setConnectionStatus,
    markAllAsDisconnected,
  };
}
