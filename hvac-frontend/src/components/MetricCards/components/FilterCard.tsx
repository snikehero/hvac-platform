import { Filter } from "lucide-react";
import { MetricCardBase } from "./MetricCardBase";
import type { FilterCardProps } from "../types";

export function FilterCard({
  label,
  value,
  unit,
  quality,
  color,
  min = 0,
  max = 500,
  critical = 400,
}: FilterCardProps) {
  const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const percentage = Math.min(
    Math.max(((numValue - min) / (max - min)) * 100, 0),
    100,
  );
  const isCritical = numValue > critical;
  const isWarning = numValue > critical * 0.75;

  return (
    <MetricCardBase
      icon={Filter}
      label={label}
      value={numValue.toFixed(0)}
      unit={unit}
      quality={quality}
      color={color}
    >
      <svg viewBox="0 0 100 120" className="w-full h-32">
        {/* Filter Frame */}
        <rect
          x="25"
          y="20"
          width="50"
          height="60"
          rx="5"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* Filter Grid Pattern */}
        {[0, 1, 2, 3, 4].map((row) => (
          <g key={row}>
            {[0, 1, 2].map((col) => (
              <rect
                key={col}
                x={30 + col * 13}
                y={25 + row * 11}
                width="10"
                height="8"
                rx="1"
                className={`transition-all duration-1000 ${
                  isCritical
                    ? "fill-red-500"
                    : isWarning
                      ? "fill-yellow-500"
                      : "fill-muted-foreground"
                }`}
                opacity={0.3 + (percentage / 100) * 0.5}
              />
            ))}
          </g>
        ))}

        {/* Clog Indicator */}
        <rect
          x="27"
          y={80 - (58 * percentage) / 100}
          width="46"
          height={(58 * percentage) / 100}
          rx="3"
          className={`transition-all duration-1000 ${
            isCritical
              ? "fill-red-400"
              : isWarning
                ? "fill-yellow-400"
                : "fill-green-500"
          }`}
          opacity="0.3"
        />

        {/* Pressure Gauge */}
        <g transform="translate(50, 95)">
          {/* Gauge Arc */}
          <path
            d="M -20 0 A 20 20 0 0 1 20 0"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="3"
          />

          {/* Needle */}
          <line
            x1="0"
            y1="0"
            x2={-20 * Math.cos((percentage / 100) * Math.PI)}
            y2={-20 * Math.sin((percentage / 100) * Math.PI)}
            className={`transition-all duration-700 ${
              isCritical
                ? "stroke-red-500"
                : isWarning
                  ? "stroke-yellow-500"
                  : "stroke-green-500"
            }`}
            strokeWidth="2"
            strokeLinecap="round"
          >
            {isCritical && (
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="0.5s"
                repeatCount="indefinite"
              />
            )}
          </line>

          {/* Center Dot */}
          <circle cx="0" cy="0" r="2" fill="hsl(var(--border))" />
        </g>

        {/* Warning Indicator */}
        {isCritical && (
          <text
            x="50"
            y="15"
            fontSize="10"
            fill="hsl(var(--destructive))"
            textAnchor="middle"
            fontWeight="bold"
          >
            REPLACE
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </text>
        )}
      </svg>
    </MetricCardBase>
  );
}
