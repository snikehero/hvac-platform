/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacEvent, HvacEventType } from "@/types/event";
import type { HistoryPoint } from "@/types/history";

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
  connected: boolean;
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(
  null,
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [telemetry, setTelemetry] = useState<HvacTelemetry[]>([]);
  const [events, setEvents] = useState<HvacEvent[]>([]);
  const [history, setHistory] = useState<
    Record<string, { temperature: HistoryPoint[]; humidity: HistoryPoint[] }>
  >({});
  const [connected, setConnected] = useState(false);

  // Ref para guardar el último estado de cada AHU
  const lastStatusRef = useRef<Record<string, HvacEventType>>({});

  useEffect(() => {
    const socket: Socket = io("http://localhost:3000");

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Snapshot inicial
    socket.on("hvac_snapshot", (data: HvacTelemetry[]) => {
      setTelemetry(data);

      // Inicializar lastStatusRef y el historial
      const newLastStatus: Record<string, HvacEventType> = {};
      const newHistory: TelemetryContextValue["history"] = {};

      data.forEach((ahu) => {
        const key = `${ahu.plantId}-${ahu.stationId}`;

        // Estado inicial
        const status = ahu.points.status?.value;
        newLastStatus[key] =
          status === "OK" || status === "WARNING" || status === "ALARM"
            ? status
            : "OK";

        // Historial inicial
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
            ? [{ timestamp: ahu.timestamp, value: ahu.points.humidity.value }]
            : [];

        newHistory[key] = {
          temperature: temp,
          humidity: hum,
        };
      });

      lastStatusRef.current = newLastStatus;
      setHistory(newHistory);
    });

    // Updates incrementales
    socket.on("hvac_update", (ahu: HvacTelemetry) => {
      const key = `${ahu.plantId}-${ahu.stationId}`;
      const previousStatus = lastStatusRef.current[key];
      const currentStatus = ahu.points.status?.value as
        | HvacEventType
        | undefined;

      // Generar evento si cambió el status
      if (
        currentStatus &&
        (currentStatus === "OK" ||
          currentStatus === "WARNING" ||
          currentStatus === "ALARM") &&
        currentStatus !== previousStatus
      ) {
        const event: HvacEvent = {
          timestamp: ahu.timestamp,
          ahuId: ahu.stationId,
          plantId: ahu.plantId,
          type: currentStatus,
          message: buildMessage(currentStatus, previousStatus ?? "OK"),
        };

        setEvents((prevEvents) => [event, ...prevEvents].slice(0, 50));
        lastStatusRef.current[key] = currentStatus;
      }

      // Actualizar historial de temperatura y humedad
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
                { timestamp: ahu.timestamp, value: ahu.points.humidity.value },
              ].slice(-MAX_POINTS)
            : prevHist.humidity;

        return {
          ...prev,
          [key]: { temperature: newTemp, humidity: newHum },
        };
      });

      // Actualizar telemetry
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
    };
  }, []);

  return (
    <TelemetryContext.Provider
      value={{ telemetry, events, history, connected }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

/* ---------- helpers ---------- */
function buildMessage(current: HvacEventType, previous: HvacEventType) {
  if (current === "ALARM") return "Unidad entró en ALARMA";
  if (current === "WARNING") return "Unidad en condición de ADVERTENCIA";
  if (current === "OK") return "Unidad volvió a estado NORMAL";
  return `Cambio de estado: ${previous} → ${current}`;
}
