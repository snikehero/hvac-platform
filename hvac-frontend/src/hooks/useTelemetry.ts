import { useContext } from "react"
import { TelemetryContext } from "@/providers/WebSocketProvider"

export function useTelemetry() {
  const ctx = useContext(TelemetryContext)
  if (!ctx) throw new Error("useTelemetry must be used inside WebSocketProvider")
  return ctx
}
