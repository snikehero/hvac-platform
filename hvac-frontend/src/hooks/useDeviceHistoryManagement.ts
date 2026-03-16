import { useCallback, useState } from "react";
import type { HistoryPoint } from "@/types/history";
import type { MachineTelemetry } from "@/types/machine-type";

const MAX_POINTS = 30;
const MAX_TRACKED_INSTANCES = 500;

/**
 * History data keyed by "machineType-plantId-stationId",
 * with each variable key mapping to an array of history points.
 */
export type DeviceHistoryData = Record<string, Record<string, HistoryPoint[]>>;

function getInstanceKey(machineType: string, plantId: string, stationId: string): string {
  return `${machineType}-${plantId}-${stationId}`;
}

interface UseDeviceHistoryManagementReturn {
  history: DeviceHistoryData;
  updateHistory: (
    machineType: string,
    telemetry: MachineTelemetry,
    trackedVarKeys: string[],
  ) => void;
  initializeFromSnapshot: (
    machineType: string,
    instances: MachineTelemetry[],
    trackedVarKeys: string[],
  ) => void;
  getInstanceHistory: (
    machineType: string,
    plantId: string,
    stationId: string,
  ) => Record<string, HistoryPoint[]>;
}

/**
 * Generic history management for any machine type.
 * Tracks history for variables whose cardConfig has trackHistory: true.
 */
export function useDeviceHistoryManagement(): UseDeviceHistoryManagementReturn {
  const [history, setHistory] = useState<DeviceHistoryData>({});

  const updateHistory = useCallback(
    (machineType: string, telemetry: MachineTelemetry, trackedVarKeys: string[]) => {
      if (trackedVarKeys.length === 0) return;

      const instanceKey = getInstanceKey(machineType, telemetry.plantId, telemetry.stationId);

      setHistory((prev) => {
        const prevInstance = prev[instanceKey] ?? {};
        const updated = { ...prevInstance };

        for (const varKey of trackedVarKeys) {
          const point = telemetry.points[varKey];
          if (point && typeof point.value === "number") {
            const prevPoints = updated[varKey] ?? [];
            updated[varKey] = [
              ...prevPoints,
              { timestamp: telemetry.timestamp, value: point.value },
            ].slice(-MAX_POINTS);
          }
        }

        const next = { ...prev, [instanceKey]: updated };

        // LRU eviction: if we exceed the limit, remove oldest entries
        const keys = Object.keys(next);
        if (keys.length > MAX_TRACKED_INSTANCES) {
          const toRemove = keys.slice(0, keys.length - MAX_TRACKED_INSTANCES);
          for (const k of toRemove) delete next[k];
        }

        return next;
      });
    },
    [],
  );

  const initializeFromSnapshot = useCallback(
    (machineType: string, instances: MachineTelemetry[], trackedVarKeys: string[]) => {
      if (trackedVarKeys.length === 0) return;

      setHistory((prev) => {
        const next = { ...prev };

        for (const inst of instances) {
          const instanceKey = getInstanceKey(machineType, inst.plantId, inst.stationId);
          const varHistory: Record<string, HistoryPoint[]> = {};

          for (const varKey of trackedVarKeys) {
            const point = inst.points[varKey];
            if (point && typeof point.value === "number") {
              varHistory[varKey] = [
                { timestamp: inst.timestamp, value: point.value },
              ];
            }
          }

          next[instanceKey] = varHistory;
        }

        return next;
      });
    },
    [],
  );

  const getInstanceHistory = useCallback(
    (machineType: string, plantId: string, stationId: string): Record<string, HistoryPoint[]> => {
      const instanceKey = getInstanceKey(machineType, plantId, stationId);
      return history[instanceKey] ?? {};
    },
    [history],
  );

  return {
    history,
    updateHistory,
    initializeFromSnapshot,
    getInstanceHistory,
  };
}
