import { useMemo } from "react";

const W = 400;
const H = 120;
const PAD = { top: 8, right: 8, bottom: 28, left: 32 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;
const BINS = 10;

interface Props {
  values: number[];
  unit?: string;
  color?: string;
}

export function DistributionChart({ values, unit, color = "#3b82f6" }: Props) {
  const { bins, xLabels } = useMemo(() => {
    if (values.length === 0) return { bins: [], xLabels: [] };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const binSize = range / BINS;

    const counts = Array(BINS).fill(0);
    for (const v of values) {
      const idx = Math.min(Math.floor((v - min) / binSize), BINS - 1);
      counts[idx]++;
    }
    const maxCount = Math.max(...counts);

    const bins = counts.map((count, i) => ({
      x: PAD.left + (i / BINS) * CW,
      w: CW / BINS - 2,
      h: maxCount > 0 ? (count / maxCount) * CH : 0,
      count,
      label: (min + i * binSize).toFixed(1),
    }));

    const xLabels = [0, 0.5, 1].map((frac) => ({
      x: PAD.left + frac * CW,
      label: (min + frac * range).toFixed(1),
    }));

    return { bins, xLabels };
  }, [values]);

  if (values.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        No current data
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      {bins.map((bin, i) => (
        <g key={i}>
          <rect
            x={bin.x}
            y={PAD.top + CH - bin.h}
            width={bin.w}
            height={bin.h}
            fill={color}
            opacity="0.7"
            rx="1"
          />
          {bin.count > 0 && (
            <text x={bin.x + bin.w / 2} y={PAD.top + CH - bin.h - 2}
              fontSize="7" textAnchor="middle" className="fill-muted-foreground">
              {bin.count}
            </text>
          )}
        </g>
      ))}
      {/* Axis line */}
      <line x1={PAD.left} y1={PAD.top + CH} x2={PAD.left + CW} y2={PAD.top + CH}
        stroke="currentColor" strokeWidth="1" className="text-border" />
      {xLabels.map(({ x, label }, i) => (
        <text key={i} x={x} y={H - 4} fontSize="7"
          textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
          className="fill-muted-foreground">
          {label}{unit ? ` ${unit}` : ""}
        </text>
      ))}
    </svg>
  );
}
