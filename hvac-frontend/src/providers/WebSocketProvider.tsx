/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacEvent, HvacEventType } from "@/types/event";
import type { HistoryPoint } from "@/types/history";
import { STALE_THRESHOLD_MS } from "@/domain/ahu/constants";

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
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(
  null,
);

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
  const lastConnectivityRef = useRef<Record<string, boolean>>({});

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
        lastConnectivityRef.current[key] = false;

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

      /* ----- Eventos de estado operativo ----- */

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
        }

        setActiveCounts((prev) => ({
          ...prev,
          [key]: {
            alarms: status === "ALARM" ? 1 : 0,
            warnings: status === "WARNING" ? 1 : 0,
          },
        }));
      }

      /* ----- Historial ----- */

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

      /* ----- Actualizar Telemetry ----- */

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

  /* ---------------- MONITOR DE CONECTIVIDAD ---------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newEvents: HvacEvent[] = [];

      telemetry.forEach((ahu) => {
        const key = `${ahu.plantId}-${ahu.stationId}`;
        const lastUpdate = new Date(ahu.timestamp).getTime();

        const isDisconnected =
          now - lastUpdate > STALE_THRESHOLD_MS;

        const wasDisconnected =
          lastConnectivityRef.current[key] ?? false;

        /* 🔴 Conectado → Desconectado */
        if (isDisconnected && !wasDisconnected) {
          newEvents.push({
            timestamp: new Date().toISOString(),
            ahuId: ahu.stationId,
            plantId: ahu.plantId,
            type: "DISCONNECTED",
            message: "Unidad perdió comunicación",
          });

          setActiveCounts((prev) => ({
            ...prev,
            [key]: { alarms: 0, warnings: 0 },
          }));
        }

        /* 🟢 Desconectado → Conectado */
        if (!isDisconnected && wasDisconnected) {
          newEvents.push({
            timestamp: new Date().toISOString(),
            ahuId: ahu.stationId,
            plantId: ahu.plantId,
            type: "OK",
            message: "Unidad restableció comunicación",
          });
        }

        lastConnectivityRef.current[key] = isDisconnected;
      });

      if (newEvents.length > 0) {
        setEvents((prev) =>
          [...newEvents, ...prev].slice(0, 50),
        );
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [telemetry]);

  return (
    <TelemetryContext.Provider
      value={{ telemetry, events, history, activeCounts, connected }}
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
  return `Cambio de estado: ${previous} → ${current}`;
}
