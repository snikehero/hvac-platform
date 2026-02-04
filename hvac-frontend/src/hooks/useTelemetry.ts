import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface TelemetryDto {
  plantId: string;
  stationId: string;
  pointKey: string;
  value: number | boolean | string;
  unit?: string;
  timestamp: string | Date;
  quality?: "GOOD" | "BAD" | "UNCERTAIN";
}

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryDto[]>([]);

  useEffect(() => {
    const socket: Socket = io("http://localhost:3000"); // backend en tu máquina
    socket.on("connect", () => console.log("WebSocket conectado"));
    socket.on("telemetry", (data: TelemetryDto) => {
      setTelemetry((prev) => {
        const key = `${data.stationId}-${data.pointKey}`;
        const index = prev.findIndex(
          (t) => `${t.stationId}-${t.pointKey}` === key,
        );
        if (index >= 0) {
          const newArr = [...prev];
          newArr[index] = data;
          return newArr;
        } else {
          return [...prev, data];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return telemetry;
}
