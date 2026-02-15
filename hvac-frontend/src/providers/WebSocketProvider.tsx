/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacEvent, HvacEventType } from "@/types/event";
import type { HistoryPoint } from "@/types/history";
import { STALE_THRESHOLD_MS } from "@/domain/ahu/constants";
import { toast } from "sonner";

const MAX_POINTS = 30;
const CONNECTIVITY_CHECK_INTERVAL = 5_000; // Check every 5 seconds
const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:3000";

/* ---------------- TYPES ---------------- */

export interface AhuConnectionStatus {
  isConnected: boolean;
  lastSeen: number; // timestamp ms
}

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
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(
  null,
);

/* ---------------- HELPERS ---------------- */

function buildMessage(current: HvacEventType, previous: HvacEventType): string {
  if (current === "ALARM") return "Unidad entró en ALARMA";
  if (current === "WARNING") return "Unidad en condición de ADVERTENCIA";
  if (current === "OK" && previous === "DISCONNECTED")
    return "Unidad restableció comunicación";
  if (current === "OK") return "Unidad volvió a estado NORMAL";
  if (current === "DISCONNECTED") return "Unidad perdió comunicación";
  return `Cambio de estado: ${previous} → ${current}`;
}

function getAhuKey(plantId: string, stationId: string): string {
  return `${plantId}-${stationId}`;
}

/* ---------------- PROVIDER ---------------- */

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  // State
  const [telemetry, setTelemetry] = useState<HvacTelemetry[]>([]);
  const [events, setEvents] = useState<HvacEvent[]>([]);
  const [history, setHistory] = useState<
    Record<string, { temperature: HistoryPoint[]; humidity: HistoryPoint[] }>
  >({});
  const [activeCounts, setActiveCounts] = useState<
    Record<string, { alarms: number; warnings: number }>
  >({});
  const [connected, setConnected] = useState(false);
  const [ahuConnectionStatus, setAhuConnectionStatus] = useState<
    Record<string, AhuConnectionStatus>
  >({});

  // Refs for tracking without causing re-renders
  const socketRef = useRef<Socket | null>(null);
  const lastStatusRef = useRef<Record<string, HvacEventType>>({});
  const lastSeenRef = useRef<Record<string, number>>({});
  const telemetryRef = useRef<HvacTelemetry[]>([]);

  // Keep telemetryRef in sync
  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  // Update last seen timestamp for an AHU
  const updateLastSeen = useCallback((key: string) => {
    const now = Date.now();
    lastSeenRef.current[key] = now;
    setAhuConnectionStatus((prev) => ({
      ...prev,
      [key]: { isConnected: true, lastSeen: now },
    }));
  }, []);

  // Check if AHU is connected
  const isAhuConnected = useCallback(
    (plantId: string, stationId: string): boolean => {
      const key = getAhuKey(plantId, stationId);
      const status = ahuConnectionStatus[key];
      if (!status) return false;
      return status.isConnected;
    },
    [ahuConnectionStatus],
  );

  // Handle AHU disconnection
  const handleAhuDisconnected = useCallback(
    (ahu: { plantId: string; stationId: string }) => {
      const key = getAhuKey(ahu.plantId, ahu.stationId);
      const previousStatus = lastStatusRef.current[key];

      // Only fire event if not already disconnected
      if (previousStatus !== "DISCONNECTED") {
        lastStatusRef.current[key] = "DISCONNECTED";

        const event: HvacEvent = {
          timestamp: new Date().toISOString(),
          ahuId: ahu.stationId,
          plantId: ahu.plantId,
          type: "DISCONNECTED",
          message: "Unidad perdió comunicación",
        };

        setEvents((prev) => [event, ...prev].slice(0, 50));
        setActiveCounts((prev) => ({
          ...prev,
          [key]: { alarms: 0, warnings: 0 },
        }));
        setAhuConnectionStatus((prev) => ({
          ...prev,
          [key]: {
            isConnected: false,
            lastSeen: prev[key]?.lastSeen ?? Date.now(),
          },
        }));

        toast.error(`🔴 AHU ${ahu.stationId} desconectado`, {
          description: `Planta ${ahu.plantId} - Sin datos por más de 2 minutos`,
          duration: 3000,
        });
      }
    },
    [],
  );

  // Handle AHU reconnection
  const handleAhuReconnected = useCallback(
    (ahu: { plantId: string; stationId: string }) => {
      const key = getAhuKey(ahu.plantId, ahu.stationId);
      const previousStatus = lastStatusRef.current[key];

      if (previousStatus === "DISCONNECTED") {
        const event: HvacEvent = {
          timestamp: new Date().toISOString(),
          ahuId: ahu.stationId,
          plantId: ahu.plantId,
          type: "OK",
          message: "Unidad restableció comunicación",
        };

        setEvents((prev) => [event, ...prev].slice(0, 50));

        toast.success(`🟢 AHU ${ahu.stationId} reconectado`, {
          description: `Planta ${ahu.plantId}`,
          duration: 4000,
        });
      }
    },
    [],
  );

  // Process status change for an AHU
  const processStatusChange = useCallback(
    (ahu: HvacTelemetry) => {
      const key = getAhuKey(ahu.plantId, ahu.stationId);
      const previousStatus = lastStatusRef.current[key];
      const status = ahu.points.status?.value;

      // Check if was disconnected and is now sending data again
      if (previousStatus === "DISCONNECTED") {
        handleAhuReconnected(ahu);
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

          setEvents((prev) => [event, ...prev].slice(0, 50));

          // Toasts for status changes
          if (status === "ALARM") {
            toast.error(`🚨 AHU ${ahu.stationId} en ALARMA`, {
              description: `Planta ${ahu.plantId}`,
              duration: 3000,
            });
          } else if (status === "WARNING") {
            toast.warning(`⚠ AHU ${ahu.stationId} en WARNING`, {
              description: `Planta ${ahu.plantId}`,
              duration: 3000,
            });
          } else if (status === "OK" && previousStatus === "ALARM") {
            toast.success(`✅ AHU ${ahu.stationId} volvió a NORMAL`, {
              description: `Planta ${ahu.plantId}`,
              duration: 3000,
            });
          }
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
    [handleAhuReconnected],
  );

  // Update history for an AHU
  const updateHistory = useCallback((ahu: HvacTelemetry) => {
    const key = getAhuKey(ahu.plantId, ahu.stationId);

    setHistory((prev) => {
      const prevHist = prev[key] ?? { temperature: [], humidity: [] };

      const newTemp =
        typeof ahu.points.temperature?.value === "number"
          ? [
              ...prevHist.temperature,
              {
                timestamp: ahu.timestamp,
                value: ahu.points.temperature.value,
              },
            ].slice(-MAX_POINTS)
          : prevHist.temperature;

      const newHum =
        typeof ahu.points.humidity?.value === "number"
          ? [
              ...prevHist.humidity,
              {
                timestamp: ahu.timestamp,
                value: ahu.points.humidity.value,
              },
            ].slice(-MAX_POINTS)
          : prevHist.humidity;

      return { ...prev, [key]: { temperature: newTemp, humidity: newHum } };
    });
  }, []);

  // Connectivity check interval (uses refs, no state dependencies)
  useEffect(() => {
    const checkConnectivity = () => {
      const now = Date.now();

      // Check each known AHU
      Object.entries(lastSeenRef.current).forEach(([key, lastSeen]) => {
        const isStale = now - lastSeen > STALE_THRESHOLD_MS;

        if (isStale) {
          // Find the AHU info from current telemetry
          const ahu = telemetryRef.current.find(
            (t) => getAhuKey(t.plantId, t.stationId) === key,
          );

          if (ahu) {
            handleAhuDisconnected(ahu);
          }
        }
      });
    };

    const intervalId = setInterval(
      checkConnectivity,
      CONNECTIVITY_CHECK_INTERVAL,
    );

    return () => clearInterval(intervalId);
  }, [handleAhuDisconnected]);

  // WebSocket connection
  useEffect(() => {
    const socket: Socket = io(WS_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      toast.success("Conectado al servidor", { duration: 2000 });
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      toast.error("Desconectado del servidor", {
        description: `Razón: ${reason}. Reconectando...`,
        duration: 5000,
      });
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    /* ---------------- SNAPSHOT ---------------- */
    socket.on("hvac_snapshot", (data: HvacTelemetry[]) => {
      const now = Date.now();
      const newLastStatus: Record<string, HvacEventType> = {};
      const newHistory: TelemetryContextValue["history"] = {};
      const newActiveCounts: TelemetryContextValue["activeCounts"] = {};
      const newConnectionStatus: Record<string, AhuConnectionStatus> = {};

      data.forEach((ahu) => {
        const key = getAhuKey(ahu.plantId, ahu.stationId);
        const status = ahu.points.status?.value;

        const validStatus: HvacEventType =
          status === "ALARM" || status === "WARNING" || status === "OK"
            ? status
            : "OK";

        newLastStatus[key] = validStatus;
        lastSeenRef.current[key] = now;

        newConnectionStatus[key] = {
          isConnected: true,
          lastSeen: now,
        };

        newActiveCounts[key] = {
          alarms: validStatus === "ALARM" ? 1 : 0,
          warnings: validStatus === "WARNING" ? 1 : 0,
        };

        const temp =
          typeof ahu.points.temperature?.value === "number"
            ? [
                {
                  timestamp: ahu.timestamp,
                  value: ahu.points.temperature.value,
                },
              ]
            : [];

        const hum =
          typeof ahu.points.humidity?.value === "number"
            ? [
                {
                  timestamp: ahu.timestamp,
                  value: ahu.points.humidity.value,
                },
              ]
            : [];

        newHistory[key] = { temperature: temp, humidity: hum };
      });

      lastStatusRef.current = newLastStatus;
      setTelemetry(data);
      setHistory(newHistory);
      setActiveCounts(newActiveCounts);
      setAhuConnectionStatus(newConnectionStatus);
    });

    /* ---------------- UPDATE ---------------- */
    socket.on("hvac_update", (ahu: HvacTelemetry) => {
      const key = getAhuKey(ahu.plantId, ahu.stationId);

      // Update last seen timestamp FIRST
      updateLastSeen(key);

      // Process status changes
      processStatusChange(ahu);

      // Update history
      updateHistory(ahu);

      // Update telemetry state
      setTelemetry((prev) => {
        const idx = prev.findIndex(
          (p) => p.stationId === ahu.stationId && p.plantId === ahu.plantId,
        );

        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = ahu;
          return copy;
        }

        return [...prev, ahu];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [updateLastSeen, processStatusChange, updateHistory]);

  // Memoize context value
  const contextValue = useMemo<TelemetryContextValue>(
    () => ({
      telemetry,
      events,
      history,
      activeCounts,
      connected,
      ahuConnectionStatus,
      isAhuConnected,
      setEvents,
    }),
    [
      telemetry,
      events,
      history,
      activeCounts,
      connected,
      ahuConnectionStatus,
      isAhuConnected,
    ],
  );

  return (
    <TelemetryContext.Provider value={contextValue}>
      {children}
    </TelemetryContext.Provider>
  );
}
