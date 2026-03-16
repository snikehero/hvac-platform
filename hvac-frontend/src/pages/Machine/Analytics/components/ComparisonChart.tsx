import { useMemo } from "react";
import type { StationSeries } from "../hooks/useAnalyticsData";

const W = 600;
const H = 160;
const PAD = { top: 10, right: 12, bottom: 28, left: 44 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

const PALETTE = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
];

interface Props {
  series: StationSeries[];
  unit?: string;
}

export function ComparisonChart({ series, unit }: Props) {
  const activeSeries = series.filter((s) => s.points.length >= 2);

  const { tMin, tMax, yMin, yMax } = useMemo(() => {
    const allPoints = activeSeries.flatMap((s) => s.points);
    if (allPoints.length === 0) return { tMin: 0, tMax: 1, yMin: 0, yMax: 1 };
    const times = allPoints.map((p) => new Date(p.timestamp).getTime());
    const values = allPoints.map((p) => p.value);
    const tMin = Math.min(...times);
    const tMax = Math.max(...times);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const pad = (rawMax - rawMin) * 0.1 || 1;
    return { allPoints, tMin, tMax, yMin: rawMin - pad, yMax: rawMax + pad };
  }, [activeSeries]);

  if (activeSeries.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No data to compare
      </div>
    );
  }

  const tRange = tMax - tMin || 1;
  const yRange = yMax - yMin;

  function toX(ts: string) {
    return PAD.left + ((new Date(ts).getTime() - tMin) / tRange) * CW;
  }
  function toY(val: number) {
    return PAD.top + CH - ((val - yMin) / yRange) * CH;
  }

  const yLabels = Array.from({ length: 5 }, (_, i) => ({
    y: PAD.top + CH - (i / 4) * CH,
    label: (yMin + (i / 4) * yRange).toFixed(1),
  }));

  const xLabels = [0, 0.5, 1].map((frac) => ({
    x: PAD.left + frac * CW,
    label: new Date(tMin + frac * tRange).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
        {yLabels.map(({ y, label }, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={PAD.left + CW} y2={y}
              stroke="currentColor" strokeWidth="0.5" className="text-border" strokeDasharray="4 3" />
            <text x={PAD.left - 4} y={y + 3} fontSize="8" textAnchor="end" className="fill-muted-foreground">
              {label}{unit ? ` ${unit}` : ""}
            </text>
          </g>
        ))}
        {xLabels.map(({ x, label }, i) => (
          <text key={i} x={x} y={H - 4} fontSize="7" textAnchor="middle" className="fill-muted-foreground">
            {label}
          </text>
        ))}
        {activeSeries.map((s, si) => {
          const color = PALETTE[si % PALETTE.length];
          const coords = s.points
            .map((p) => `${toX(p.timestamp).toFixed(1)},${toY(p.value).toFixed(1)}`)
            .join(" ");
          return (
            <polyline key={`${s.plantId}-${s.stationId}`}
              points={coords} fill="none" stroke={color} strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {activeSeries.map((s, si) => (
          <span key={`${s.plantId}-${s.stationId}`} className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-4 rounded-sm inline-block" style={{ background: PALETTE[si % PALETTE.length] }} />
            {s.stationId} <span className="text-muted-foreground">({s.plantId})</span>
          </span>
        ))}
      </div>
    </div>
  );
}
