import { useMemo, useCallback } from "react";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { useDeviceHealth } from "@/hooks/useDeviceHealth";
import { useMachineTypes } from "@/context/MachineTypeContext";
import type { MachineType, MachineTelemetry, MachineVariable } from "@/types/machine-type";
import type { DeviceHealthResult } from "@/domain/device/getDeviceHealth";
import type { DeviceEvent } from "@/types/device-event";
import type { HistoryPoint } from "@/types/history";

export type SystemStatus = "OPTIMAL" | "DEGRADED" | "CRITICAL" | "NO_DATA";

export interface InstanceHealthEntry {
  instance: MachineTelemetry;
  health: DeviceHealthResult;
  isConnected: boolean;
}

export interface PlantGroup {
  plantId: string;
  instances: MachineTelemetry[];
  ok: number;
  warning: number;
  alarm: number;
  disconnected: number;
  operationalPercent: number;
}

export interface ExecutiveDashboardStats {
  total: number;
  ok: number;
  warning: number;
  alarm: number;
  disconnected: number;
  operationalPercent: number;
}

export interface ExecutiveDashboardData {
  machineType: MachineType | undefined;
  instances: MachineTelemetry[];
  instanceHealthMap: Map<string, InstanceHealthEntry>;
  stats: ExecutiveDashboardStats;
  systemStatus: SystemStatus;
  plantGroups: PlantGroup[];
  recentEvents: DeviceEvent[];
  stabilityScore: number;
  displayVariables: MachineVariable[];
  getInstanceHistory: (plantId: string, stationId: string) => Record<string, HistoryPoint[]>;
}

export function useExecutiveDashboardData(machineTypeSlug: string | undefined): ExecutiveDashboardData {
  const { machineTypes } = useMachineTypes();
  const {
    instances,
    isMachineConnected,
    deviceEvents,
    getInstanceHistory: ctxGetInstanceHistory,
  } = useMachineTelemetry(machineTypeSlug);
  const getHealth = useDeviceHealth(machineTypeSlug);

  const machineType = useMemo(
    () => machineTypes.find((mt) => mt.slug === machineTypeSlug),
    [machineTypes, machineTypeSlug],
  );

  const instanceHealthMap = useMemo(() => {
    const map = new Map<string, InstanceHealthEntry>();
    for (const inst of instances) {
      const mapKey = `${inst.machineType}-${inst.plantId}-${inst.stationId}`;
      const connKey = `${inst.plantId}-${inst.stationId}`;
      const isConnected = isMachineConnected(connKey);
      const health = getHealth(inst.points, isConnected);
      map.set(mapKey, { instance: inst, health, isConnected });
    }
    return map;
  }, [instances, isMachineConnected, getHealth]);

  const stats = useMemo<ExecutiveDashboardStats>(() => {
    let ok = 0, warning = 0, alarm = 0, disconnected = 0;
    for (const entry of instanceHealthMap.values()) {
      switch (entry.health.status) {
        case "OK": ok++; break;
        case "WARNING": warning++; break;
        case "ALARM": alarm++; break;
        case "DISCONNECTED": disconnected++; break;
      }
    }
    const total = instances.length;
    const operationalPercent = total > 0 ? Math.round((ok / total) * 100) : 0;
    return { total, ok, warning, alarm, disconnected, operationalPercent };
  }, [instanceHealthMap, instances.length]);

  const systemStatus = useMemo<SystemStatus>(() => {
    if (stats.total === 0) return "NO_DATA";
    if (stats.alarm > 0) return "CRITICAL";
    if (stats.warning > 0 || stats.disconnected > 0) return "DEGRADED";
    return "OPTIMAL";
  }, [stats]);

  const plantGroups = useMemo<PlantGroup[]>(() => {
    const groupMap = new Map<string, PlantGroup>();
    for (const inst of instances) {
      let group = groupMap.get(inst.plantId);
      if (!group) {
        group = { plantId: inst.plantId, instances: [], ok: 0, warning: 0, alarm: 0, disconnected: 0, operationalPercent: 0 };
        groupMap.set(inst.plantId, group);
      }
      group.instances.push(inst);
      const key = `${inst.machineType}-${inst.plantId}-${inst.stationId}`;
      const entry = instanceHealthMap.get(key);
      if (entry) {
        switch (entry.health.status) {
          case "OK": group.ok++; break;
          case "WARNING": group.warning++; break;
          case "ALARM": group.alarm++; break;
          case "DISCONNECTED": group.disconnected++; break;
        }
      }
    }
    for (const group of groupMap.values()) {
      const total = group.instances.length;
      group.operationalPercent = total > 0 ? Math.round((group.ok / total) * 100) : 0;
    }
    // Sort by severity: ALARM plants first
    return Array.from(groupMap.values()).sort((a, b) => {
      if (a.alarm !== b.alarm) return b.alarm - a.alarm;
      if (a.disconnected !== b.disconnected) return b.disconnected - a.disconnected;
      if (a.warning !== b.warning) return b.warning - a.warning;
      return a.plantId.localeCompare(b.plantId);
    });
  }, [instances, instanceHealthMap]);

  const recentEvents = useMemo(() => {
    if (!machineTypeSlug) return [];
    return deviceEvents
      .filter((e) => e.machineType === machineTypeSlug)
      .slice(0, 15);
  }, [deviceEvents, machineTypeSlug]);

  const stabilityScore = useMemo(() => {
    if (recentEvents.length === 0) return 100;
    const nonAlarm = recentEvents.filter((e) => e.type !== "ALARM" && e.type !== "DISCONNECTED").length;
    return Math.round((nonAlarm / recentEvents.length) * 100);
  }, [recentEvents]);

  const displayVariables = useMemo<MachineVariable[]>(() => {
    if (!machineType) return [];
    return machineType.variables
      .filter((v) => v.dataType === "number")
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 3);
  }, [machineType]);

  const getInstanceHistory = useCallback(
    (plantId: string, stationId: string): Record<string, HistoryPoint[]> => {
      if (!machineTypeSlug) return {};
      return ctxGetInstanceHistory(machineTypeSlug, plantId, stationId);
    },
    [machineTypeSlug, ctxGetInstanceHistory],
  );

  return {
    machineType,
    instances,
    instanceHealthMap,
    stats,
    systemStatus,
    plantGroups,
    recentEvents,
    stabilityScore,
    displayVariables,
    getInstanceHistory,
  };
}
