import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import type { HistoryPoint } from "@/types/history";

/* ---------------- CONTEXT ---------------- */

export interface TelemetryContextValue {
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
  getInstanceHistory: (machineType: string, plantId: string, stationId: string) => Record<string, HistoryPoint[]>;
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(null);

/* ---------------- PROVIDER ---------------- */

/**
 * Manages real-time telemetry state: machine data, connectivity, events, and history.
 * Consumes the WebSocket connection internally via useWebSocketConnection.
 */
export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const { socket, connected } = useWebSocketConnection();
  const { settings: globalSettings } = useGlobalSettings();
  const { clearAck } = useAcks();
  const { machineTypes } = useMachineTypes();

  const [machineTelemetry, setMachineTelemetry] = useState<Record<string, MachineTelemetry[]>>({});

  const deviceEventManager = useDeviceEventManagement();
  const machineConnectivity = useDeviceConnectivity(
    connected,
    undefined,
    globalSettings.disconnectTimeoutSeconds * 1000,
    globalSettings.refreshIntervalSeconds * 1000,
  );
  const deviceHistoryManager = useDeviceHistoryManagement();

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

  const handleMachineSnapshot = useCallback(
    (data: Record<string, MachineTelemetry[]>) => {
      setMachineTelemetry(data);

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
        newConnectionStatus[key] = { isConnected: true, lastSeen: now };
        machineConnectivity.updateLastSeen(key);
      });

      machineConnectivity.setConnectionStatus(newConnectionStatus);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getTrackedVarKeys, machineConnectivity.updateLastSeen, machineConnectivity.setConnectionStatus, deviceHistoryManager.initializeFromSnapshot],
  );

  const handleMachineUpdate = useCallback(
    (data: MachineTelemetry) => {
      const { machineType } = data;
      const key = `${data.plantId}-${data.stationId}`;

      machineConnectivity.updateLastSeen(key);

      const trackedKeys = getTrackedVarKeys(machineType);
      if (trackedKeys.length > 0) {
        deviceHistoryManager.updateHistory(machineType, data, trackedKeys);
      }

      setMachineTelemetry((prev) => {
        const typeInstances = prev[machineType] ?? [];
        const existingIdx = typeInstances.findIndex(
          (inst) => `${inst.plantId}-${inst.stationId}` === key,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getTrackedVarKeys, machineConnectivity.updateLastSeen, deviceHistoryManager.updateHistory],
  );

  const handleDeviceEvent = useCallback(
    (event: DeviceEvent) => {
      deviceEventManager.addEvent(event);
      if (event.type === "OK" && (event.previousType === "ALARM" || event.previousType === "WARNING")) {
        clearAck(event.plantId, event.instanceId, event.machineType);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deviceEventManager.addEvent, clearAck],
  );

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

  useEffect(() => {
    if (!connected) {
      machineConnectivity.markAllAsDisconnected();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, machineConnectivity.markAllAsDisconnected]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <ErrorBoundary>{children}</ErrorBoundary>
    </TelemetryContext.Provider>
  );
}
