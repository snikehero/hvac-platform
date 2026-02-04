/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import type { HvacTelemetry } from "@/types/telemetry"

interface TelemetryContextValue {
  telemetry: HvacTelemetry[]
  connected: boolean
}

export const TelemetryContext =
  createContext<TelemetryContextValue | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [telemetry, setTelemetry] = useState<HvacTelemetry[]>([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io("http://localhost:3000")
    socketRef.current = socket

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))

    // Snapshot inicial
    socket.on("hvac_snapshot", (data: HvacTelemetry[]) => {
      setTelemetry(data)
    })

    // Updates incrementales
    socket.on("hvac_update", (ahu: HvacTelemetry) => {
      setTelemetry((prev) => {
        const idx = prev.findIndex(
          (p) =>
            p.stationId === ahu.stationId &&
            p.plantId === ahu.plantId,
        )

        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = ahu
          return copy
        }

        return [...prev, ahu]
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
