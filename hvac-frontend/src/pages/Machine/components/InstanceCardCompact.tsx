import { ArrowRight } from "lucide-react";
import { STATUS_DOT, STATUS_COLOR } from "@/constants/status";
import type { MachineTelemetry, MachineVariable } from "@/types/machine-type";
import type { DeviceHealthStatus } from "@/domain/device/getDeviceHealth";

interface Props {
  instance: MachineTelemetry;
  health: { status: DeviceHealthStatus; badPoints: number };
  isConnected: boolean;
  sortedVariables: MachineVariable[];
  onClick: () => void;
}

export function InstanceCardCompact({ instance, health, isConnected, sortedVariables, onClick }: Props) {
  const dotColor = STATUS_DOT[health.status] ?? STATUS_DOT.DISCONNECTED;
  const textColor = STATUS_COLOR[health.status] ?? STATUS_COLOR.DISCONNECTED;

  return (
    <tr
      onClick={onClick}
      className="group border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
    >
      {/* Status dot */}
      <td className="py-2 pl-3 pr-2 w-8">
        <span className="relative flex h-2.5 w-2.5">
          {health.status === "ALARM" && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 transition-status ${dotColor}`} />
        </span>
      </td>

      {/* Station ID */}
      <td className={`py-2 pr-3 font-semibold text-sm ${textColor}`}>
        {instance.stationId}
      </td>

      {/* Plant ID */}
      <td className="py-2 pr-4 text-xs text-muted-foreground font-mono">
        {instance.plantId}
      </td>

      {/* Top variables */}
      {sortedVariables.map((varDef) => {
        const point = instance.points[varDef.key];
        const val =
          isConnected && point
            ? typeof point.value === "boolean"
              ? point.value ? "ON" : "OFF"
              : String(point.value)
            : "--";
        return (
          <td key={varDef.key} className="py-2 pr-4 text-sm tabular-nums">
            <span className="font-semibold">{val}</span>
            {point?.unit && (
              <span className="text-xs text-muted-foreground ml-0.5">{point.unit}</span>
            )}
          </td>
        );
      })}

      {/* Timestamp */}
      <td className="py-2 pr-3 text-xs text-muted-foreground hidden lg:table-cell">
        {new Date(instance.timestamp).toLocaleTimeString()}
      </td>

      {/* Arrow */}
      <td className="py-2 pr-3 w-6">
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </td>
    </tr>
  );
}
