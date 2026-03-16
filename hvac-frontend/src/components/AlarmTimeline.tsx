import { useState, useMemo, useRef } from "react";
import type { DeviceEvent } from "@/types/device-event";

type ZoomWindow = "5m" | "1h" | "24h";

const ZOOM_MS: Record<ZoomWindow, number> = {
  "5m": 5 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
};

const EVENT_FILL: Record<string, string> = {
  ALARM: "#ef4444",
  WARNING: "#eab308",
  OK: "#22c55e",
  DISCONNECTED: "#6b7280",
  RECONNECTED: "#3b82f6",
};

const W = 900;
const H = 64;
const Y_CENTER = H / 2;
const DOT_R = 6;
const CLUSTER_R = 10;
const AXIS_Y = H - 10;

interface ClusteredPoint {
  x: number;
  events: DeviceEvent[];
  color: string;
}

interface TooltipState {
  x: number;
  y: number;
  events: DeviceEvent[];
}

interface Props {
  events: DeviceEvent[];
}

export function AlarmTimeline({ events }: Props) {
  const [zoom, setZoom] = useState<ZoomWindow>("1h");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const windowMs = ZOOM_MS[zoom];
  const now = Date.now();
  const windowStart = now - windowMs;

  // Filter events within window
  const visibleEvents = useMemo(
    () => events.filter((e) => new Date(e.timestamp).getTime() >= windowStart),
    [events, windowStart],
  );

  // Map event ts → x coordinate
  function tsToX(ts: string): number {
    const t = new Date(ts).getTime();
    return ((t - windowStart) / windowMs) * W;
  }

  // Cluster events whose x positions are within 20px
  const clusters = useMemo<ClusteredPoint[]>(() => {
    if (visibleEvents.length === 0) return [];

    const sorted = [...visibleEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    const result: ClusteredPoint[] = [];
    const threshold = (20 / W) * windowMs;

    for (const ev of sorted) {
      const evTs = new Date(ev.timestamp).getTime();
      const last = result[result.length - 1];

      if (last) {
        const lastTs = new Date(last.events[last.events.length - 1].timestamp).getTime();
        if (evTs - lastTs <= threshold) {
          last.events.push(ev);
          // Update color: alarm > warning > others
          if (ev.type === "ALARM") last.color = EVENT_FILL.ALARM;
          else if (ev.type === "WARNING" && last.color !== EVENT_FILL.ALARM)
            last.color = EVENT_FILL.WARNING;
          last.x = tsToX(ev.timestamp);
          continue;
        }
      }

      result.push({
        x: tsToX(ev.timestamp),
        events: [ev],
        color: EVENT_FILL[ev.type] ?? EVENT_FILL.DISCONNECTED,
      });
    }

    return result;
  }, [visibleEvents, windowStart, windowMs]);

  // Axis labels
  const axisLabels = useMemo(() => {
    const count = 5;
    return Array.from({ length: count + 1 }, (_, i) => {
      const t = new Date(windowStart + (windowMs / count) * i);
      const label =
        zoom === "24h"
          ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: zoom === "5m" ? "2-digit" : undefined });
      return { x: (i / count) * W, label };
    });
  }, [windowStart, windowMs, zoom]);

  function handleMouseMove(
    e: React.MouseEvent<SVGGElement>,
    cluster: ClusteredPoint,
  ) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      events: cluster.events,
    });
  }

  const isEmpty = visibleEvents.length === 0;

  return (
    <div className="space-y-3">
      {/* Zoom controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          {visibleEvents.length} event{visibleEvents.length !== 1 ? "s" : ""} in window
        </span>
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(["5m", "1h", "24h"] as ZoomWindow[]).map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                zoom === z
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Timeline */}
      <div className="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-16"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Axis line */}
          <line
            x1={0}
            y1={AXIS_Y}
            x2={W}
            y2={AXIS_Y}
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
          />

          {/* Axis labels */}
          {axisLabels.map(({ x, label }, i) => (
            <text
              key={i}
              x={x}
              y={H - 1}
              fontSize="7"
              textAnchor={i === 0 ? "start" : i === axisLabels.length - 1 ? "end" : "middle"}
              className="fill-muted-foreground"
            >
              {label}
            </text>
          ))}

          {/* "Now" indicator */}
          <line
            x1={W}
            y1={0}
            x2={W}
            y2={AXIS_Y}
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="3 2"
            opacity="0.4"
          />

          {isEmpty ? (
            <text
              x={W / 2}
              y={Y_CENTER - 4}
              textAnchor="middle"
              fontSize="9"
              className="fill-muted-foreground"
            >
              No events in this window
            </text>
          ) : (
            clusters.map((c, i) => {
              const isCluster = c.events.length > 1;
              const r = isCluster ? CLUSTER_R : DOT_R;
              return (
                <g
                  key={i}
                  onMouseMove={(e) => handleMouseMove(e, c)}
                  onMouseLeave={() => setTooltip(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={c.x}
                    cy={Y_CENTER - 8}
                    r={r}
                    fill={c.color}
                    opacity="0.85"
                  />
                  {isCluster && (
                    <text
                      x={c.x}
                      y={Y_CENTER - 8 + 3}
                      textAnchor="middle"
                      fontSize="7"
                      fill="white"
                      fontWeight="bold"
                    >
                      {c.events.length}
                    </text>
                  )}
                  {/* Stem */}
                  <line
                    x1={c.x}
                    y1={Y_CENTER - 8 + r}
                    x2={c.x}
                    y2={AXIS_Y}
                    stroke={c.color}
                    strokeWidth="1"
                    opacity="0.4"
                  />
                </g>
              );
            })
          )}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none max-w-[220px] rounded-md border border-border bg-popover shadow-md p-2 text-xs space-y-1"
            style={{ left: Math.min(tooltip.x + 8, W - 230), top: Math.max(tooltip.y - 60, 4) }}
          >
            {tooltip.events.slice(0, 4).map((ev, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span
                  className="mt-0.5 h-2 w-2 rounded-full shrink-0"
                  style={{ background: EVENT_FILL[ev.type] ?? "#6b7280" }}
                />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{ev.instanceId}</div>
                  <div className="text-muted-foreground truncate">{ev.message}</div>
                  <div className="text-muted-foreground/60">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {tooltip.events.length > 4 && (
              <div className="text-muted-foreground text-[10px]">
                +{tooltip.events.length - 4} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries(EVENT_FILL).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
