import { useCallback, useMemo, useState } from "react";
import type { DeviceEvent } from "@/types/device-event";

const MAX_EVENTS = 200;

interface ActiveCounts {
  alarms: number;
  warnings: number;
}

interface UseDeviceEventManagementReturn {
  /** All device events across all machine types (latest first, max 200) */
  allEvents: DeviceEvent[];
  /** Active alarm/warning counts keyed by "machineType-plantId-stationId" */
  activeCounts: Record<string, ActiveCounts>;
  /** Total active alarms across ALL machine types */
  totalAlarms: number;
  /** Total active warnings across ALL machine types */
  totalWarnings: number;
  /** Add a new device event */
  addEvent: (event: DeviceEvent) => void;
}

/**
 * Manages unified device events from all machine types.
 * Tracks active alarm/warning counts and provides totals.
 */
export function useDeviceEventManagement(): UseDeviceEventManagementReturn {
  const [allEvents, setAllEvents] = useState<DeviceEvent[]>([]);
  const [activeCounts, setActiveCounts] = useState<
    Record<string, ActiveCounts>
  >({});

  const addEvent = useCallback((event: DeviceEvent) => {
    setAllEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));

    const key = `${event.machineType}-${event.plantId}-${event.instanceId}`;

    setActiveCounts((prev) => ({
      ...prev,
      [key]: {
        alarms: event.type === "ALARM" ? 1 : 0,
        warnings: event.type === "WARNING" ? 1 : 0,
      },
    }));
  }, []);

  const totalAlarms = useMemo(
    () =>
      Object.values(activeCounts).reduce((sum, c) => sum + c.alarms, 0),
    [activeCounts],
  );

  const totalWarnings = useMemo(
    () =>
      Object.values(activeCounts).reduce((sum, c) => sum + c.warnings, 0),
    [activeCounts],
  );

  return {
    allEvents,
    activeCounts,
    totalAlarms,
    totalWarnings,
    addEvent,
  };
}
