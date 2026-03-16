/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import type { MachineTelemetry } from "@/types/machine-type";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";
import { useDeviceConnectivity, type DeviceConnectionStatus } from "@/hooks/useDeviceConnectivity";
import type { DeviceEvent } from "@/types/device-event";
import { useDeviceEventManagement } from "@/hooks/useDeviceEventManagement";
import { useDeviceHistoryManagement, type DeviceHistoryData } from "@/hooks/useDeviceHistoryManagement";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import { useAcks } from "@/context/AckContext";
import { useMachineTypes } from "@/context/MachineTypeContext";

/* ---------------- CONTEXT ---------------- */

interface TelemetryContextValue {
  connected: boolean;
  socket: Socket | null;
  machineTelemetry: Record<string, MachineTelemetry[]>;
  machineConnectionStatus: Record<string, DeviceConnectionStatus>;
  isMachineConnected: (machineKey: string) => boolean;
  deviceEvents: DeviceEvent[];
  deviceActiveCounts: Record<string, { alarms: number; warnings: number }>;
  totalAlarms: number;
  totalWarnings: number;
  machineHistory: DeviceHistoryData;
  getInstanceHistory: (machineType: string, plantId: string, stationId: string) => Record<string, import("@/types/history").HistoryPoint[]>;
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(
  null,
);

/* ---------------- PROVIDER ---------------- */

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  // Connection management
  const { socket, connected } = useWebSocketConnection();

  // Global settings (language, timeout, notifications)
  const { settings: globalSettings } = useGlobalSettings();

  // Acknowledgment context — clear acks when a machine recovers to OK
  const { clearAck } = useAcks();

  // Machine type definitions (for determining tracked variables)
  const { machineTypes } = useMachineTypes();

  // Machine telemetry state (generic machines)
  const [machineTelemetry, setMachineTelemetry] = useState<
    Record<string, MachineTelemetry[]>
  >({});

  // Unified device event management (all machine types including HVAC)
  const deviceEventManager = useDeviceEventManagement();

  // Machine connectivity
  const machineConnectivity = useDeviceConnectivity(
    connected,
    undefined, // We don't notify from client anymore, the backend emits `machine_event`
    globalSettings.disconnectTimeoutSeconds * 1000,
    globalSettings.refreshIntervalSeconds * 1000
  );

  // Device history management (generic machines)
  const deviceHistoryManager = useDeviceHistoryManagement();

  // Helper: get tracked variable keys for a machine type
  const getTrackedVarKeys = useCallback(
    (machineTypeSlug: string): string[] => {
      const mt = machineTypes.find((t) => t.slug === machineTypeSlug);
      if (!mt) return [];
      return mt.variables
        .filter((v) => v.cardConfig?.trackHistory === true)
        .map((v) => v.key);
    },
    [machineTypes],
  );

  // Handle machine_snapshot events (generic machines)
  const handleMachineSnapshot = useCallback(
    (data: Record<string, MachineTelemetry[]>) => {
      setMachineTelemetry(data);

      // Initialize device history from snapshot
      for (const [slug, instances] of Object.entries(data)) {
        const trackedKeys = getTrackedVarKeys(slug);
        if (trackedKeys.length > 0) {
          deviceHistoryManager.initializeFromSnapshot(slug, instances, trackedKeys);
        }
      }

      const newConnectionStatus: Record<string, DeviceConnectionStatus> = {};
      const now = Date.now();

      Object.values(data).flat().forEach((inst) => {
        const key = `${inst.plantId}-${inst.stationId}`;
        newConnectionStatus[key] = {
          isConnected: true,
          lastSeen: now,
        };
        machineConnectivity.updateLastSeen(key);
      });

      machineConnectivity.setConnectionStatus(newConnectionStatus);
    },
    [machineConnectivity.updateLastSeen, machineConnectivity.setConnectionStatus, getTrackedVarKeys, deviceHistoryManager.initializeFromSnapshot],
  );

  // Handle machine_update events (generic machines)
  const handleMachineUpdate = useCallback(
    (data: MachineTelemetry) => {
      const { machineType } = data;
      const key = `${data.plantId}-${data.stationId}`;

      machineConnectivity.updateLastSeen(key);

      // Update device history for tracked variables
      const trackedKeys = getTrackedVarKeys(machineType);
      if (trackedKeys.length > 0) {
        deviceHistoryManager.updateHistory(machineType, data, trackedKeys);
      }

      setMachineTelemetry((prev) => {
        const typeInstances = prev[machineType] ?? [];
        const key = `${data.plantId}-${data.stationId}`;
        const existingIdx = typeInstances.findIndex(
          (inst) =>
            `${inst.plantId}-${inst.stationId}` === key,
        );

        const updated = [...typeInstances];
        if (existingIdx >= 0) {
          updated[existingIdx] = data;
        } else {
          updated.push(data);
        }

        return { ...prev, [machineType]: updated };
      });
    },
    [machineConnectivity.updateLastSeen, getTrackedVarKeys, deviceHistoryManager.updateHistory],
  );

  // Handle unified device_event from backend (all machine types including HVAC)
  const handleDeviceEvent = useCallback((event: DeviceEvent) => {
    deviceEventManager.addEvent(event);

    // When a device transitions to OK, clear its acks so the next
    // alarm episode starts unacknowledged.
    if (
      event.type === "OK" &&
      (event.previousType === "ALARM" || event.previousType === "WARNING")
    ) {
      clearAck(event.plantId, event.instanceId, event.machineType);
    }
  }, [deviceEventManager.addEvent, clearAck]);

  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("machine_snapshot", handleMachineSnapshot);
    socket.on("machine_update", handleMachineUpdate);
    socket.on("device_event", handleDeviceEvent);

    return () => {
      socket.off("machine_snapshot", handleMachineSnapshot);
      socket.off("machine_update", handleMachineUpdate);
      socket.off("device_event", handleDeviceEvent);
    };
  }, [socket, handleMachineSnapshot, handleMachineUpdate, handleDeviceEvent]);

  // Mark all devices as disconnected when WebSocket disconnects
  useEffect(() => {
    if (!connected) {
      machineConnectivity.markAllAsDisconnected();
    }
  }, [connected, machineConnectivity.markAllAsDisconnected]);

  // Memoize context value
  const contextValue = useMemo<TelemetryContextValue>(
    () => ({
      connected,
      socket,
      machineTelemetry,
      machineConnectionStatus: machineConnectivity.connectionStatus,
      isMachineConnected: machineConnectivity.isConnected,
      deviceEvents: deviceEventManager.allEvents,
      deviceActiveCounts: deviceEventManager.activeCounts,
      totalAlarms: deviceEventManager.totalAlarms,
      totalWarnings: deviceEventManager.totalWarnings,
      machineHistory: deviceHistoryManager.history,
      getInstanceHistory: deviceHistoryManager.getInstanceHistory,
    }),
    [
      connected,
      socket,
      machineTelemetry,
      machineConnectivity.connectionStatus,
      machineConnectivity.isConnected,
      deviceEventManager.allEvents,
      deviceEventManager.activeCounts,
      deviceEventManager.totalAlarms,
      deviceEventManager.totalWarnings,
      deviceHistoryManager.history,
      deviceHistoryManager.getInstanceHistory,
    ],
  );

  return (
    <TelemetryContext.Provider value={contextValue}>
      {children}
    </TelemetryContext.Provider>
  );
}
