import { Thermometer } from "lucide-react";
import { MetricCardBase } from "./MetricCardBase";
import type { TemperatureCardProps } from "../types";

export function TemperatureCard({
  label,
  value,
  unit,
  quality,
  color,
  min = 0,
  max = 40,
  target = 22,
}: TemperatureCardProps) {
  const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const percentage = Math.min(
    Math.max(((numValue - min) / (max - min)) * 100, 0),
    100,
  );
  const isCold = numValue < target - 3;
  const isHot = numValue > target + 3;
  const isGood = !isCold && !isHot && quality !== "BAD";

  return (
    <MetricCardBase
      icon={Thermometer}
      label={label}
      value={numValue.toFixed(1)}
      unit={unit}
      quality={quality}
      color={color}
    >
      <svg viewBox="0 0 100 120" className="w-full h-32">
        {/* Thermometer Body */}
        <rect
          x="42"
          y="10"
          width="16"
          height="70"
          rx="8"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* Mercury Column */}
        <rect
          x="45"
          y={13 + (70 - (70 * percentage) / 100)}
          width="10"
          height={(70 * percentage) / 100}
          rx="5"
          className={`transition-all duration-1000 ${
            isCold ? "fill-blue-400" : isHot ? "fill-red-500" : "fill-primary"
          }`}
        >
          {isGood && (
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </rect>

        {/* Bulb */}
        <circle
          cx="50"
          cy="90"
          r="15"
          className={`transition-all duration-500 ${
            isCold ? "fill-blue-400" : isHot ? "fill-red-500" : "fill-primary"
          }`}
          stroke="hsl(var(--border))"
          strokeWidth="2"
        >
          {(isCold || isHot) && (
            <animate
              attributeName="r"
              values="15;16;15"
              dur="1s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Inner Bulb Shine */}
        <circle cx="47" cy="87" r="5" fill="white" opacity="0.3" />

        {/* Temperature Markers */}
        <line
          x1="35"
          y1="30"
          x2="40"
          y2="30"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
        />
        <line
          x1="35"
          y1="50"
          x2="40"
          y2="50"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
        />
        <line
          x1="35"
          y1="70"
          x2="40"
          y2="70"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
        />
      </svg>
    </MetricCardBase>
  );
}
