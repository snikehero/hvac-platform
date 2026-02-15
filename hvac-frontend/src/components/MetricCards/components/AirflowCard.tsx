import { Wind } from "lucide-react";
import { MetricCardBase } from "./MetricCardBase";
import type { AirflowCardProps } from "../types";

export function AirflowCard({
  label,
  value,
  unit,
  quality,
  color,
  min = 0,
  max = 1000,
}: AirflowCardProps) {
  const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const percentage = Math.min(
    Math.max(((numValue - min) / (max - min)) * 100, 0),
    100,
  );
  const isLow = percentage < 20;
  const isHigh = percentage > 80;

  return (
    <MetricCardBase
      icon={Wind}
      label={label}
      value={numValue.toFixed(0)}
      unit={unit}
      quality={quality}
      color={color}
    >
      <svg viewBox="0 0 120 100" className="w-full h-32">
        {/* Wind Tunnel */}
        <rect
          x="10"
          y="40"
          width="100"
          height="20"
          rx="10"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* Flow Indicator */}
        <rect
          x="12"
          y="42"
          width={(96 * percentage) / 100}
          height="16"
          rx="8"
          className={`transition-all duration-1000 ${
            isLow
              ? "fill-orange-400"
              : isHigh
                ? "fill-green-500"
                : "fill-chart-4"
          }`}
          opacity="0.7"
        />

        {/* Wind Particles */}
        {percentage > 10 && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <line
                  x1="0"
                  y1={45 + i * 3}
                  x2="20"
                  y2={45 + i * 3}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0"
                >
                  <animate
                    attributeName="x1"
                    values="0;120"
                    dur={`${2 - percentage / 100}s`}
                    begin={`${i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="x2"
                    values="20;140"
                    dur={`${2 - percentage / 100}s`}
                    begin={`${i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.8;0"
                    dur={`${2 - percentage / 100}s`}
                    begin={`${i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                </line>
              </g>
            ))}
          </>
        )}

        {/* Percentage Markers */}
        <text x="15" y="35" fontSize="8" fill="hsl(var(--muted-foreground))">
          0%
        </text>
        <text x="95" y="35" fontSize="8" fill="hsl(var(--muted-foreground))">
          100%
        </text>
      </svg>
    </MetricCardBase>
  );
}
