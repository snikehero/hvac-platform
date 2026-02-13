/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacEvent, HvacEventType } from "@/types/event";
import type { HistoryPoint } from "@/types/history";
import { useConnectivityMonitor } from "@/domain/hooks/useConnectivityMonitor";
import { toast } from "sonner";
const MAX_POINTS = 30;

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
  connected: boolean;
  setEvents: React.Dispatch<React.SetStateAction<HvacEvent[]>>;
}

export const TelemetryContext =
  createContext<TelemetryContextValue | null>(null);

export function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [telemetry, setTelemetry] = useState<HvacTelemetry[]>([]);
  const [events, setEvents] = useState<HvacEvent[]>([]);
  const [history, setHistory] = useState<
    Record<string, { temperature: HistoryPoint[]; humidity: HistoryPoint[] }>
  >({});
  const [activeCounts, setActiveCounts] = useState<
    Record<string, { alarms: number; warnings: number }>
  >({});
  const [connected, setConnected] = useState(false);

  const lastStatusRef = useRef<Record<string, HvacEventType>>({});

  useEffect(() => {
    const socket: Socket = io("http://localhost:3000");

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    /* ---------------- SNAPSHOT ---------------- */

    socket.on("hvac_snapshot", (data: HvacTelemetry[]) => {
      setTelemetry(data);

      const newLastStatus: Record<string, HvacEventType> = {};
      const newHistory: TelemetryContextValue["history"] = {};
      const newActiveCounts: TelemetryContextValue["activeCounts"] = {};

      data.forEach((ahu) => {
        const key = `${ahu.plantId}-${ahu.stationId}`;
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
      setHistory(newHistory);
      setActiveCounts(newActiveCounts);
    });

    /* ---------------- UPDATE ---------------- */

    socket.on("hvac_update", (ahu: HvacTelemetry) => {
      const key = `${ahu.plantId}-${ahu.stationId}`;
      const previousStatus = lastStatusRef.current[key];
      const status = ahu.points.status?.value;

      if (
        status === "ALARM" ||
        status === "WARNING" ||
        status === "OK"
      ) {
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
          /* 🔥 TOAST GLOBAL */

          if (status === "ALARM") {
            toast.error(`🚨 AHU ${ahu.stationId} en ALARMA`, {
              description: `Planta ${ahu.plantId}`,
              duration: 8000,
            });
          }

          if (status === "WARNING") {
            toast.warning(`⚠ AHU ${ahu.stationId} en WARNING`, {
              description: `Planta ${ahu.plantId}`,
              duration: 6000,
            });
          }

          if (status === "OK" && previousStatus === "ALARM") {
            toast.success(`✅ AHU ${ahu.stationId} volvió a NORMAL`, {
              description: `Planta ${ahu.plantId}`,
              duration: 4000,
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

      /* Historial */

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

      /* Telemetry */

      setTelemetry((prev) => {
        const idx = prev.findIndex(
          (p) =>
            p.stationId === ahu.stationId &&
            p.plantId === ahu.plantId,
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
    };
  }, []);

useConnectivityMonitor(telemetry,setEvents);

  return (
    <TelemetryContext.Provider
      value={{
        telemetry,
        events,
        history,
        activeCounts,
        connected,
        setEvents,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

/* ---------------- HELPERS ---------------- */

function buildMessage(
  current: HvacEventType,
  previous: HvacEventType,
) {
  if (current === "ALARM") return "Unidad entró en ALARMA";
  if (current === "WARNING")
    return "Unidad en condición de ADVERTENCIA";
  if (current === "OK")
    return "Unidad volvió a estado NORMAL";
  if (current === "DISCONNECTED")
    return "Unidad se desconectó"
  return `Cambio de estado: ${previous} → ${current}`;
}
