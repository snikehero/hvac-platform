/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo } from "react";
import type { Socket } from "socket.io-client";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacEvent } from "@/types/event";
import type { HistoryPoint } from "@/types/history";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";
import {
  useAhuConnectivity,
  type AhuConnectionStatus,
} from "@/hooks/useAhuConnectivity";
import { useEventManagement } from "@/hooks/useEventManagement";
import { useHistoryManagement } from "@/hooks/useHistoryManagement";
import { useTelemetryState } from "@/hooks/useTelemetryState";
import { NotificationService } from "@/services/NotificationService";
import { useSettings } from "@/context/SettingsContext";
import { useAcks } from "@/context/AckContext";

/* ---------------- CONTEXT ---------------- */

interface TelemetryContextValue {
  telemetry: HvacTelemetry[];
  events: HvacEvent[];
  history: Record<
    string,
    {
      temperature: HistoryPoint[];
      humidity: HistoryPoint[];
    }
  >;
  activeCounts: Record<
    string,
    {
      alarms: number;
      warnings: number;
    }
  >;
  /** WebSocket connection status (browser <-> backend) */
  connected: boolean;
  /** Per-AHU connection status (tracks if AHU is sending data) */
  ahuConnectionStatus: Record<string, AhuConnectionStatus>;
  /** Check if a specific AHU is connected */
  isAhuConnected: (plantId: string, stationId: string) => boolean;
  setEvents: React.Dispatch<React.SetStateAction<HvacEvent[]>>;
  /** Raw Socket.IO socket — used by command hooks to emit events */
  socket: Socket | null;
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(
  null,
);

/* ---------------- PROVIDER ---------------- */

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  // Connection management
  const { socket, connected } = useWebSocketConnection();

  // Settings
  const { settings } = useSettings();

  // Acknowledgment context — clear acks when a machine recovers to OK
  const { clearAck } = useAcks();

  // Telemetry state
  const { telemetry, setTelemetry, updateTelemetry } = useTelemetryState();

  // Event management (declare early)
  const eventManager = useEventManagement();

  // History management (declare early)
  const historyManager = useHistoryManagement();

  // Connectivity tracking - pass a ref callback to avoid circular dependency
  const connectivity = useAhuConnectivity(
    telemetry,
    useCallback(
      (ahu: { plantId: string; stationId: string }) => {
        eventManager.handleDisconnection(ahu);
        const timeoutMinutes = Math.round(settings.thresholds.disconnectTimeoutSeconds / 60);
        NotificationService.notifyDisconnection(
          ahu.stationId,
          ahu.plantId,
          timeoutMinutes,
          settings.general.language,
        );
      },
      [eventManager, settings.thresholds.disconnectTimeoutSeconds, settings.general.language],
    ),
    connected, // Pass WebSocket connection status
    settings.thresholds.disconnectTimeoutSeconds * 1000, // Pass configured timeout in milliseconds
    settings.general.refreshIntervalSeconds * 1000, // Pass configured check interval in milliseconds
  );

  // Event handler for reconnection
  const handleAhuReconnected = useCallback(
    (ahu: { plantId: string; stationId: string }) => {
      NotificationService.notifyReconnection(
        ahu.stationId,
        ahu.plantId,
        settings.general.language,
      );
    },
    [settings.general.language],
  );

  // Handle hvac_update events
  const handleHvacUpdate = useCallback(
    (ahu: HvacTelemetry) => {
      // Update last seen timestamp
      connectivity.updateLastSeen(ahu.plantId, ahu.stationId);

      // Process status changes and notifications
      const previousStatus = eventManager.events.find(
        (e) => e.ahuId === ahu.stationId && e.plantId === ahu.plantId,
      )?.type;

      eventManager.processStatusChange(ahu, handleAhuReconnected);

      // When a machine recovers to OK after an alarm/warning episode,
      // clear its ack so the next failure must be acknowledged fresh.
      const currentStatus = ahu.points.status?.value;
      if (
        currentStatus === "OK" &&
        (previousStatus === "ALARM" || previousStatus === "WARNING")
      ) {
        clearAck(ahu.plantId, ahu.stationId);
      }
      if (
        currentStatus &&
        (currentStatus === "ALARM" ||
          currentStatus === "WARNING" ||
          currentStatus === "OK")
      ) {
        NotificationService.notifyStatusChange(
          ahu.stationId,
          ahu.plantId,
          currentStatus,
          previousStatus,
          settings.general.language,
        );
      }

      // Update history
      historyManager.updateHistory(ahu);

      // Update telemetry state
      updateTelemetry(ahu);
    },
    [
      connectivity.updateLastSeen,
      eventManager.events,
      eventManager.processStatusChange,
      historyManager.updateHistory,
      updateTelemetry,
      handleAhuReconnected,
      settings.general.language,
    ],
  );

  // Handle hvac_snapshot events
  const handleHvacSnapshot = useCallback(
    (data: HvacTelemetry[]) => {
      const now = Date.now();

      // Only fully initialize if we don't have existing data (first load)
      const isFirstLoad = telemetry.length === 0;

      if (isFirstLoad) {
        // Initialize event management
        eventManager.initializeFromSnapshot(data);

        // Initialize history
        historyManager.initializeFromSnapshot(data);
      } else {
        // On reconnection, merge new data with existing state
        // Update active counts but preserve event history
        eventManager.updateActiveCountsFromSnapshot(data);

        data.forEach((ahu) => {
          // Update telemetry
          updateTelemetry(ahu);

          // Update history (append new points, don't replace)
          historyManager.updateHistory(ahu);
        });
      }

      // Always update connectivity status (even on reconnection)
      const newConnectionStatus: Record<string, AhuConnectionStatus> = {};
      data.forEach((ahu) => {
        const key = `${ahu.plantId}-${ahu.stationId}`;
        newConnectionStatus[key] = {
          isConnected: true,
          lastSeen: now,
        };
        connectivity.updateLastSeen(ahu.plantId, ahu.stationId);
      });

      connectivity.setConnectionStatus(newConnectionStatus);

      // Only set telemetry on first load, otherwise updateTelemetry handles it
      if (isFirstLoad) {
        setTelemetry(data);
      }
    },
    [
      telemetry.length,
      eventManager.initializeFromSnapshot,
      eventManager.updateActiveCountsFromSnapshot,
      historyManager.initializeFromSnapshot,
      historyManager.updateHistory,
      connectivity.updateLastSeen,
      connectivity.setConnectionStatus,
      setTelemetry,
      updateTelemetry,
    ],
  );

  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("hvac_snapshot", handleHvacSnapshot);
    socket.on("hvac_update", handleHvacUpdate);

    return () => {
      socket.off("hvac_snapshot", handleHvacSnapshot);
      socket.off("hvac_update", handleHvacUpdate);
    };
  }, [socket, handleHvacSnapshot, handleHvacUpdate]);

  // Mark all AHUs as disconnected when WebSocket disconnects
  useEffect(() => {
    if (!connected) {
      connectivity.markAllAsDisconnected();
    }
  }, [connected, connectivity.markAllAsDisconnected]);

  // Memoize context value
  const contextValue = useMemo<TelemetryContextValue>(
    () => ({
      telemetry,
      events: eventManager.events,
      history: historyManager.history,
      activeCounts: eventManager.activeCounts,
      connected,
      ahuConnectionStatus: connectivity.ahuConnectionStatus,
      isAhuConnected: connectivity.isAhuConnected,
      setEvents: eventManager.setEvents,
      socket,
    }),
    [
      telemetry,
      eventManager.events,
      eventManager.activeCounts,
      eventManager.setEvents,
      historyManager.history,
      connected,
      connectivity.ahuConnectionStatus,
      connectivity.isAhuConnected,
      socket,
    ],
  );

  return (
    <TelemetryContext.Provider value={contextValue}>
      {children}
    </TelemetryContext.Provider>
  );
}
