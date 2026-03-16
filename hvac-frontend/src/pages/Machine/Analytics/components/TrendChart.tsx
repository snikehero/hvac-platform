import { useMemo } from "react";
import type { HistoryPoint } from "@/types/history";
import { linearRegression } from "../hooks/useAnalyticsData";

const W = 600;
const H = 160;
const PAD = { top: 10, right: 12, bottom: 28, left: 44 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

interface Props {
  points: HistoryPoint[];
  label: string;
  unit?: string;
  color?: string;
}

export function TrendChart({ points, label, unit, color = "#3b82f6" }: Props) {
  const last = points.slice(-60);

  const { coords, regCoords, xLabels, yLabels } = useMemo(() => {
    if (last.length < 2) return { coords: "", regCoords: "", yMin: 0, yMax: 0, xLabels: [], yLabels: [] };

    const values = last.map((p) => p.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const padding = (rawMax - rawMin) * 0.1 || 1;
    const yMin = rawMin - padding;
    const yMax = rawMax + padding;
    const yRange = yMax - yMin;

    const t0 = new Date(last[0].timestamp).getTime();
    const tEnd = new Date(last[last.length - 1].timestamp).getTime();
    const tRange = tEnd - t0 || 1;

    function toXY(ts: string, val: number) {
      const x = PAD.left + ((new Date(ts).getTime() - t0) / tRange) * CW;
      const y = PAD.top + CH - ((val - yMin) / yRange) * CH;
      return { x, y };
    }

    const pts = last.map((p) => toXY(p.timestamp, p.value));
    const coords = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

    // Regression line
    const reg = linearRegression(last);
    let regCoords = "";
    if (reg) {
      const t0s = 0;
      const tEnds = (tEnd - t0) / 1000;
      const y0 = reg.intercept + reg.slope * t0s;
      const y1 = reg.intercept + reg.slope * tEnds;
      const rx0 = PAD.left;
      const ry0 = PAD.top + CH - ((y0 - yMin) / yRange) * CH;
      const rx1 = PAD.left + CW;
      const ry1 = PAD.top + CH - ((y1 - yMin) / yRange) * CH;
      regCoords = `${rx0.toFixed(1)},${ry0.toFixed(1)} ${rx1.toFixed(1)},${ry1.toFixed(1)}`;
    }

    // Axis labels
    const xLabels = [0, 0.25, 0.5, 0.75, 1].map((frac) => {
      const ts = new Date(t0 + frac * tRange);
      return {
        x: PAD.left + frac * CW,
        label: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    });

    const ySteps = 4;
    const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
      const val = yMin + (i / ySteps) * yRange;
      return {
        y: PAD.top + CH - (i / ySteps) * CH,
        label: val.toFixed(1),
      };
    });

    return { coords, regCoords, yMin, yMax, xLabels, yLabels };
  }, [last]);

  if (last.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Not enough history data
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">
        {label}{unit ? ` (${unit})` : ""}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
        {/* Grid lines */}
        {yLabels.map(({ y, label: lbl }, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={PAD.left + CW} y2={y}
              stroke="currentColor" strokeWidth="0.5" className="text-border" strokeDasharray="4 3" />
            <text x={PAD.left - 4} y={y + 3} fontSize="8" textAnchor="end" className="fill-muted-foreground">
              {lbl}
            </text>
          </g>
        ))}

        {/* X labels */}
        {xLabels.map(({ x, label: lbl }, i) => (
          <text key={i} x={x} y={H - 4} fontSize="7" textAnchor="middle" className="fill-muted-foreground">
            {lbl}
          </text>
        ))}

        {/* Regression line */}
        {regCoords && (
          <polyline
            points={regCoords}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="6 3"
            opacity="0.5"
          />
        )}

        {/* Data line */}
        <polyline points={coords} fill="none" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
