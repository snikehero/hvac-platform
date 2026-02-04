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

// ------------------------
// Mock generator
// ------------------------
function generateMockTelemetry(): TelemetryDto[] {
  const ahus = ["AHU-01", "AHU-02", "AHU-03"];
  const messages: TelemetryDto[] = [];

  ahus.forEach((ahu) => {
    const temperature = +(20 + Math.random() * 12).toFixed(1);
    const humidity = +(40 + Math.random() * 30).toFixed(1);
    const fan_status = Math.random() > 0.15 ? "ON" : "OFF";

    let status: "OK" | "WARNING" | "ALARM" = "OK";
    if (fan_status === "OFF") status = "ALARM";
    else if (temperature < 20 || temperature > 28 || humidity > 65)
      status = "WARNING";

    messages.push(
      {
        plantId: "Plant1",
        stationId: ahu,
        pointKey: "temperature",
        value: temperature,
        unit: "°C",
        timestamp: new Date().toISOString(),
        quality:
          status === "OK" ? "GOOD" : status === "ALARM" ? "BAD" : "UNCERTAIN",
      },
      {
        plantId: "Plant1",
        stationId: ahu,
        pointKey: "humidity",
        value: humidity,
        unit: "%",
        timestamp: new Date().toISOString(),
        quality:
          status === "OK" ? "GOOD" : status === "ALARM" ? "BAD" : "UNCERTAIN",
      },
      {
        plantId: "Plant1",
        stationId: ahu,
        pointKey: "fan_status",
        value: fan_status,
        unit: "",
        timestamp: new Date().toISOString(),
        quality:
          status === "OK" ? "GOOD" : status === "ALARM" ? "BAD" : "UNCERTAIN",
      },
      {
        plantId: "Plant1",
        stationId: ahu,
        pointKey: "status",
        value: status,
        unit: "",
        timestamp: new Date().toISOString(),
        quality:
          status === "OK" ? "GOOD" : status === "ALARM" ? "BAD" : "UNCERTAIN",
      },
    );
  });

  return messages;
}

// ------------------------
// Hook
// ------------------------
export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryDto[]>([]);

  const USE_MOCK = true; // <--- toggle this for development / live backend

  useEffect(() => {
    if (USE_MOCK) {
      // Initial mock after first render
      setTimeout(() => {
        console.log("Using mock telemetry data");
        setTelemetry(generateMockTelemetry());
      }, 0);

      // Update every 3s to simulate live telemetry
      const interval = setInterval(() => {
        setTelemetry(generateMockTelemetry());
      }, 3000);

      return () => clearInterval(interval);
    } else {
      // Live backend
      const socket: Socket = io("http://localhost:3000");
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
    }
  }, []);

  return telemetry;
}
