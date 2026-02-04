/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import type { TelemetryDto } from "@/types/telemetry"

interface TelemetryContextValue {
  telemetry: TelemetryDto[]
  connected: boolean
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(null)
const USE_MOCK = false

function generateMockTelemetry(): TelemetryDto[] {
  const ahus = ["AHU-01", "AHU-02", "AHU-03"]
  const messages: TelemetryDto[] = []

  ahus.forEach((ahu) => {
    const temperature = +(20 + Math.random() * 12).toFixed(1)
    const humidity = +(40 + Math.random() * 30).toFixed(1)
    const fan_status = Math.random() > 0.15 ? "ON" : "OFF"

    let status: "OK" | "WARNING" | "ALARM" = "OK"
    if (fan_status === "OFF") status = "ALARM"
    else if (temperature < 20 || temperature > 28 || humidity > 65)
      status = "WARNING"

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
        timestamp: new Date().toISOString(),
        quality:
          status === "OK" ? "GOOD" : status === "ALARM" ? "BAD" : "UNCERTAIN",
      },
      {
        plantId: "Plant1",
        stationId: ahu,
        pointKey: "status",
        value: status,
        timestamp: new Date().toISOString(),
        quality:
          status === "OK" ? "GOOD" : status === "ALARM" ? "BAD" : "UNCERTAIN",
      },
    )
  })

  return messages
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [telemetry, setTelemetry] = useState<TelemetryDto[]>([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (USE_MOCK) {
      setConnected(true)
      setTelemetry(generateMockTelemetry())

      const interval = setInterval(() => {
        setTelemetry(generateMockTelemetry())
      }, 3000)

      return () => clearInterval(interval)
    }

    const socket = io("http://localhost:3000")
    socketRef.current = socket

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))

    socket.on("telemetry", (data: TelemetryDto) => {
      setTelemetry((prev) => {
        const key = `${data.stationId}-${data.pointKey}`
        const idx = prev.findIndex(
          (t) => `${t.stationId}-${t.pointKey}` === key,
        )
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = data
          return copy
        }
        return [...prev, data]
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <TelemetryContext.Provider value={{ telemetry, connected }}>
      {children}
    </TelemetryContext.Provider>
  )
}
