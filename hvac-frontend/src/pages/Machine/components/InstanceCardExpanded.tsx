import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_DOT, STATUS_BADGE_VARIANT } from "@/constants/status";
import type { MachineTelemetry, MachineVariable } from "@/types/machine-type";
import type { DeviceHealthStatus } from "@/domain/device/getDeviceHealth";
import type { HistoryPoint } from "@/types/history";

interface Props {
  instance: MachineTelemetry;
  health: { status: DeviceHealthStatus; badPoints: number };
  isConnected: boolean;
  sortedVariables: MachineVariable[];
  historyData: Record<string, HistoryPoint[]>;
  onClick: () => void;
}

function MiniSparkline({ points, className }: { points: HistoryPoint[]; className?: string }) {
  const last12 = points.slice(-12);
  if (last12.length < 2) return null;
  const W = 80;
  const H = 28;
  const values = last12.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords = last12.map((p, i) => {
    const x = (i / (last12.length - 1)) * W;
    const y = H - ((p.value - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className={`overflow-visible ${className ?? ""}`}>
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      />
    </svg>
  );
}

export function InstanceCardExpanded({
  instance,
  health,
  isConnected,
  sortedVariables,
  historyData,
  onClick,
}: Props) {
  const dotColor = STATUS_DOT[health.status] ?? STATUS_DOT.DISCONNECTED;

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer group hover:shadow-md transition-shadow transition-status"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {health.status === "ALARM" && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 transition-status ${dotColor}`} />
            </span>
            <div>
              <CardTitle className="text-lg">{instance.stationId}</CardTitle>
              <CardDescription className="font-mono text-xs">{instance.plantId}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_BADGE_VARIANT[health.status]}>{health.status}</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {sortedVariables.map((varDef) => {
            const point = instance.points[varDef.key];
            const history = historyData[varDef.key] ?? [];
            const val =
              isConnected && point
                ? typeof point.value === "boolean"
                  ? point.value ? "ON" : "OFF"
                  : String(point.value)
                : "--";

            return (
              <div key={varDef.key} className="space-y-1">
                <p className="text-xs text-muted-foreground">{varDef.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black tabular-nums">{val}</span>
                  {point?.unit && (
                    <span className="text-xs text-muted-foreground">{point.unit}</span>
                  )}
                </div>
                {history.length >= 2 && (
                  <MiniSparkline points={history} className="text-primary" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          {new Date(instance.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
