import { useCallback, useRef, useState } from "react";
import type { HvacEvent, HvacEventType } from "@/types/event";
import type { HvacTelemetry } from "@/types/telemetry";
import { getAhuKey } from "./useAhuConnectivity";

const MAX_EVENTS = 50;

function buildMessage(current: HvacEventType, previous: HvacEventType): string {
  if (current === "ALARM") return "Unidad entró en ALARMA";
  if (current === "WARNING") return "Unidad en condición de ADVERTENCIA";
  if (current === "OK" && previous === "DISCONNECTED")
    return "Unidad restableció comunicación";
  if (current === "OK") return "Unidad volvió a estado NORMAL";
  if (current === "DISCONNECTED") return "Unidad perdió comunicación";
  return `Cambio de estado: ${previous} → ${current}`;
}

interface UseEventManagementReturn {
  events: HvacEvent[];
  activeCounts: Record<string, { alarms: number; warnings: number }>;
  setEvents: React.Dispatch<React.SetStateAction<HvacEvent[]>>;
  addEvent: (event: HvacEvent) => void;
  processStatusChange: (
    ahu: HvacTelemetry,
    onReconnected?: (ahu: { plantId: string; stationId: string }) => void,
  ) => void;
  handleDisconnection: (ahu: { plantId: string; stationId: string }) => void;
  setActiveCounts: React.Dispatch<
    React.SetStateAction<Record<string, { alarms: number; warnings: number }>>
  >;
  initializeFromSnapshot: (data: HvacTelemetry[]) => {
    lastStatus: Record<string, HvacEventType>;
    activeCounts: Record<string, { alarms: number; warnings: number }>;
  };
  updateActiveCountsFromSnapshot: (data: HvacTelemetry[]) => void;
}

/**
 * Hook responsible for managing events and status tracking
 */
export function useEventManagement(): UseEventManagementReturn {
  const [events, setEvents] = useState<HvacEvent[]>([]);
  const [activeCounts, setActiveCounts] = useState<
    Record<string, { alarms: number; warnings: number }>
  >({});

  const lastStatusRef = useRef<Record<string, HvacEventType>>({});

  const addEvent = useCallback((event: HvacEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
  }, []);

  const handleDisconnection = useCallback(
    (ahu: { plantId: string; stationId: string }) => {
      const key = getAhuKey(ahu.plantId, ahu.stationId);
      const previousStatus = lastStatusRef.current[key];

      if (previousStatus !== "DISCONNECTED") {
        lastStatusRef.current[key] = "DISCONNECTED";

        const event: HvacEvent = {
          timestamp: new Date().toISOString(),
          ahuId: ahu.stationId,
          plantId: ahu.plantId,
          type: "DISCONNECTED",
          message: "Unidad perdió comunicación",
        };

        addEvent(event);

        setActiveCounts((prev) => ({
          ...prev,
          [key]: { alarms: 0, warnings: 0 },
        }));
      }
    },
    [addEvent],
  );

  const processStatusChange = useCallback(
    (
      ahu: HvacTelemetry,
      onReconnected?: (ahu: { plantId: string; stationId: string }) => void,
    ) => {
      const key = getAhuKey(ahu.plantId, ahu.stationId);
      const previousStatus = lastStatusRef.current[key];
      const status = ahu.points.status?.value;

      // Check if was disconnected and is now sending data again
      if (previousStatus === "DISCONNECTED" && onReconnected) {
        onReconnected({ plantId: ahu.plantId, stationId: ahu.stationId });
      }

      if (status === "ALARM" || status === "WARNING" || status === "OK") {
        if (status !== previousStatus) {
          lastStatusRef.current[key] = status;

          const event: HvacEvent = {
            timestamp: ahu.timestamp,
            ahuId: ahu.stationId,
            plantId: ahu.plantId,
            type: status,
            message: buildMessage(status, previousStatus ?? "OK"),
          };

          addEvent(event);
        }

        setActiveCounts((prev) => ({
          ...prev,
          [key]: {
            alarms: status === "ALARM" ? 1 : 0,
            warnings: status === "WARNING" ? 1 : 0,
          },
        }));
      }
    },
    [addEvent],
  );

  const initializeFromSnapshot = useCallback((data: HvacTelemetry[]) => {
    const newLastStatus: Record<string, HvacEventType> = {};
    const newActiveCounts: Record<
      string,
      { alarms: number; warnings: number }
    > = {};

    data.forEach((ahu) => {
      const key = getAhuKey(ahu.plantId, ahu.stationId);
      const status = ahu.points.status?.value;

      const validStatus: HvacEventType =
        status === "ALARM" || status === "WARNING" || status === "OK"
          ? status
          : "OK";

      newLastStatus[key] = validStatus;
      newActiveCounts[key] = {
        alarms: validStatus === "ALARM" ? 1 : 0,
        warnings: validStatus === "WARNING" ? 1 : 0,
      };
    });

    lastStatusRef.current = newLastStatus;
    setActiveCounts(newActiveCounts);

    return { lastStatus: newLastStatus, activeCounts: newActiveCounts };
  }, []);

  const updateActiveCountsFromSnapshot = useCallback(
    (data: HvacTelemetry[]) => {
      // This version preserves lastStatusRef and only updates activeCounts
      // Used when reconnecting to not lose event history
      const newActiveCounts: Record<
        string,
        { alarms: number; warnings: number }
      > = {};

      data.forEach((ahu) => {
        const key = getAhuKey(ahu.plantId, ahu.stationId);
        const status = ahu.points.status?.value;

        const validStatus: HvacEventType =
          status === "ALARM" || status === "WARNING" || status === "OK"
            ? status
            : "OK";

        // Update lastStatusRef without erasing previous knowledge
        lastStatusRef.current[key] = validStatus;

        newActiveCounts[key] = {
          alarms: validStatus === "ALARM" ? 1 : 0,
          warnings: validStatus === "WARNING" ? 1 : 0,
        };
      });

      setActiveCounts(newActiveCounts);
    },
    [],
  );

  return {
    events,
    activeCounts,
    setEvents,
    addEvent,
    processStatusChange,
    handleDisconnection,
    setActiveCounts,
    initializeFromSnapshot,
    updateActiveCountsFromSnapshot,
  };
}
