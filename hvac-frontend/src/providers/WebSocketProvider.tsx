/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacEvent } from "@/types/event";
import { type HvacEventType } from "@/types/event";
interface TelemetryContextValue {
  telemetry: HvacTelemetry[];
  events: HvacEvent[];
  connected: boolean;
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(
  null,
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [telemetry, setTelemetry] = useState<HvacTelemetry[]>([]);
  const [events, setEvents] = useState<HvacEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const lastStatusRef = useRef<Record<string, string>>({}); // clave: plantId-stationId

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Snapshot inicial
    socket.on("hvac_snapshot", (data: HvacTelemetry[]) => {
      setTelemetry(data);

      // inicializar los lastStatus
      const newLastStatus: Record<string, string> = {};
      data.forEach((ahu) => {
        const key = `${ahu.plantId}-${ahu.stationId}`;
        newLastStatus[key] = String(ahu.points.status?.value ?? "OK");
      });
      lastStatusRef.current = newLastStatus;
    });

    // Updates incrementales
    // Updates incrementales
    socket.on("hvac_update", (ahu: HvacTelemetry) => {
      setTelemetry((prev) => {
        const idx = prev.findIndex(
          (p) => p.stationId === ahu.stationId && p.plantId === ahu.plantId,
        );

        // Generar evento si cambia el status
        const key = `${ahu.plantId}-${ahu.stationId}`;
        const previousStatus = lastStatusRef.current[key];

        // Validar y convertir a HvacEventType
        const rawStatus = ahu.points.status?.value;
        const currentStatus: HvacEventType =
          rawStatus === "OK" || rawStatus === "WARNING" || rawStatus === "ALARM"
            ? rawStatus
            : "OK"; // default seguro

        if (previousStatus && currentStatus !== previousStatus) {
          const event: HvacEvent = {
            timestamp: ahu.timestamp,
            ahuId: ahu.stationId,
            plantId: ahu.plantId,
            type: currentStatus,
            message: buildMessage(
              currentStatus,
              previousStatus as HvacEventType,
            ),
          };
          setEvents((prevEvents) => [event, ...prevEvents].slice(0, 50));
        }

        lastStatusRef.current[key] = currentStatus;

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
    <TelemetryContext.Provider value={{ telemetry, events, connected }}>
      {children}
    </TelemetryContext.Provider>
  );
}

/* ---------- helpers ---------- */
function buildMessage(current: string, previous: string) {
  if (current === "ALARM") return "Unidad entró en ALARMA";
  if (current === "WARNING") return "Unidad en condición de ADVERTENCIA";
  if (current === "OK") return "Unidad volvió a estado NORMAL";
  return `Cambio de estado: ${previous} → ${current}`;
}
