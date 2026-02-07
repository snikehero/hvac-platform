import { useContext } from "react";
import { TelemetryContext } from "@/providers/WebSocketProvider";
export function useWebSocket() {
  const context = useContext(TelemetryContext);
  if (!context)
    throw new Error("useWebSocket debe usarse dentro de WebSocketProvider");
  return context.connected;
}
