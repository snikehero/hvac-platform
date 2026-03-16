import { ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_DOT, STATUS_BADGE_VARIANT } from "@/constants/status";
import type { MachineTelemetry, MachineVariable } from "@/types/machine-type";
import type { DeviceHealthStatus } from "@/domain/device/getDeviceHealth";
import type { HistoryPoint } from "@/types/history";
import type { DeviceEvent } from "@/types/device-event";

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: () => void;
  instance: MachineTelemetry;
  health: { status: DeviceHealthStatus; badPoints: number };
  isConnected: boolean;
  displayVariables: MachineVariable[];
  historyData: Record<string, HistoryPoint[]>;
  recentEvents: DeviceEvent[];
}

function MiniSparkline({ points }: { points: HistoryPoint[] }) {
  const last10 = points.slice(-10);
  if (last10.length < 2) return null;
  const W = 64;
  const H = 24;
  const values = last10.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords = last10.map((p, i) => {
    const x = (i / (last10.length - 1)) * W;
    const y = H - ((p.value - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible text-primary opacity-60">
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const EVENT_COLOR: Record<string, string> = {
  ALARM: "text-destructive",
  WARNING: "text-yellow-500",
  OK: "text-green-500",
  DISCONNECTED: "text-muted-foreground",
  RECONNECTED: "text-primary",
};

export function InstanceDrawer({
  open,
  onClose,
  onNavigate,
  instance,
  health,
  isConnected,
  displayVariables,
  historyData,
  recentEvents,
}: Props) {
  const dotColor = STATUS_DOT[health.status] ?? STATUS_DOT.DISCONNECTED;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-[380px] sm:w-[460px] sm:max-w-[460px] overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {health.status === "ALARM" && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${dotColor}`} />
            </span>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg leading-tight">{instance.stationId}</SheetTitle>
              <SheetDescription className="font-mono text-xs">{instance.plantId}</SheetDescription>
            </div>
            <Badge variant={STATUS_BADGE_VARIANT[health.status]}>{health.status}</Badge>
          </div>
        </SheetHeader>

        {/* Metrics grid */}
        <div className="py-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Metrics</h3>
          <div className="grid grid-cols-2 gap-3">
            {displayVariables.map((varDef) => {
              const point = instance.points[varDef.key];
              const history = historyData[varDef.key] ?? [];
              const val =
                isConnected && point
                  ? typeof point.value === "boolean"
                    ? point.value ? "ON" : "OFF"
                    : String(point.value)
                  : "--";
              return (
                <div key={varDef.key} className="rounded-lg border border-border p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">{varDef.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black tabular-nums">{val}</span>
                    {point?.unit && (
                      <span className="text-xs text-muted-foreground">{point.unit}</span>
                    )}
                  </div>
                  {history.length >= 2 && <MiniSparkline points={history} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent events */}
        {recentEvents.length > 0 && (
          <div className="py-4 border-t border-border space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Events</h3>
            <ul className="space-y-2">
              {recentEvents.slice(0, 5).map((ev, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 text-xs font-semibold shrink-0 ${EVENT_COLOR[ev.type] ?? "text-muted-foreground"}`}>
                    {ev.type}
                  </span>
                  <span className="text-muted-foreground flex-1 min-w-0 truncate">{ev.message}</span>
                  <span className="text-xs text-muted-foreground/60 shrink-0">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-muted-foreground py-2 border-t border-border">
          Last update: {new Date(instance.timestamp).toLocaleString()}
        </div>

        <SheetFooter className="pt-4">
          <Button onClick={onNavigate} className="w-full gap-2">
            View full details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
