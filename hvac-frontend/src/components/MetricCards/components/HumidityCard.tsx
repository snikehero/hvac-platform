import { Droplets } from "lucide-react";
import { MetricCardBase } from "./MetricCardBase";
import type { HumidityCardProps } from "../types";

export function HumidityCard({
  label,
  value,
  unit,
  quality,
  color,
}: HumidityCardProps) {
  const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const percentage = Math.min(Math.max(numValue, 0), 100);
  const isLow = percentage < 30;
  const isHigh = percentage > 70;
  const isGood = !isLow && !isHigh && quality !== "BAD";

  return (
    <MetricCardBase
      icon={Droplets}
      label={label}
      value={numValue.toFixed(0)}
      unit={unit}
      quality={quality}
      color={color}
    >
      <svg viewBox="0 0 100 120" className="w-full h-32">
        {/* Water Drop Shape */}
        <path
          d="M 50 20 Q 65 35, 65 55 Q 65 75, 50 85 Q 35 75, 35 55 Q 35 35, 50 20 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* Water Level */}
        <defs>
          <clipPath id="dropClip">
            <path d="M 50 20 Q 65 35, 65 55 Q 65 75, 50 85 Q 35 75, 35 55 Q 35 35, 50 20 Z" />
          </clipPath>
        </defs>

        <g clipPath="url(#dropClip)">
          <rect
            x="35"
            y={85 - (65 * percentage) / 100}
            width="30"
            height={(65 * percentage) / 100}
            className={`transition-all duration-1000 ${
              isLow
                ? "fill-orange-400"
                : isHigh
                  ? "fill-blue-600"
                  : "fill-accent"
            }`}
            opacity="0.8"
          />

          {/* Water Wave Animation */}
          {isGood && (
            <>
              <path
                d={`M 35 ${85 - (65 * percentage) / 100} Q 42.5 ${85 - (65 * percentage) / 100 - 2}, 50 ${85 - (65 * percentage) / 100} T 65 ${85 - (65 * percentage) / 100}`}
                fill="none"
                stroke="white"
                strokeWidth="1"
                opacity="0.5"
              >
                <animate
                  attributeName="d"
                  values={`M 35 ${85 - (65 * percentage) / 100} Q 42.5 ${85 - (65 * percentage) / 100 - 2}, 50 ${85 - (65 * percentage) / 100} T 65 ${85 - (65 * percentage) / 100};
                           M 35 ${85 - (65 * percentage) / 100} Q 42.5 ${85 - (65 * percentage) / 100 + 2}, 50 ${85 - (65 * percentage) / 100} T 65 ${85 - (65 * percentage) / 100};
                           M 35 ${85 - (65 * percentage) / 100} Q 42.5 ${85 - (65 * percentage) / 100 - 2}, 50 ${85 - (65 * percentage) / 100} T 65 ${85 - (65 * percentage) / 100}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
            </>
          )}
        </g>

        {/* Droplet Highlights */}
        <circle cx="45" cy="40" r="2" fill="white" opacity="0.6" />
        <circle cx="55" cy="50" r="1.5" fill="white" opacity="0.4" />
      </svg>
    </MetricCardBase>
  );
}
