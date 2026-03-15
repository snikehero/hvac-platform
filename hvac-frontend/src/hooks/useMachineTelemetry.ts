import { useContext, useMemo } from "react";
import { TelemetryContext } from "@/providers/WebSocketProvider";
import type { MachineTelemetry } from "@/types/machine-type";

/**
 * Access machine telemetry data from the WebSocket context.
 * If machineType is provided, returns only instances of that type.
 * Otherwise returns all machine telemetry.
 */
export function useMachineTelemetry(machineType?: string) {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error(
      "useMachineTelemetry must be used within WebSocketProvider",
    );
  }

  const instances = useMemo(() => {
    if (!machineType) return ctx.machineTelemetry;
    return {
      [machineType]: ctx.machineTelemetry[machineType] ?? [],
    };
  }, [ctx.machineTelemetry, machineType]);

  const typeInstances = useMemo<MachineTelemetry[]>(() => {
    if (!machineType) return [];
    return ctx.machineTelemetry[machineType] ?? [];
  }, [ctx.machineTelemetry, machineType]);

  return {
    allMachineTelemetry: ctx.machineTelemetry,
    machineTelemetry: instances,
    instances: typeInstances,
    connected: ctx.connected,
    machineConnectionStatus: ctx.machineConnectionStatus,
    isMachineConnected: ctx.isMachineConnected,
    machineEvents: ctx.machineEvents,
  };
}
