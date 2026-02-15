import { Activity } from "lucide-react";
import { MetricCardBase } from "./MetricCardBase";
import type { GenericCardProps } from "../types";

export function GenericCard({
  label,
  value,
  unit,
  quality,
  color,
  icon,
}: GenericCardProps) {
  return (
    <MetricCardBase
      icon={icon || Activity}
      label={label}
      value={value}
      unit={unit}
      quality={quality}
      color={color}
    >
      <svg viewBox="0 0 100 100" className="w-full h-32">
        {/* Simple Bar Chart */}
        <rect
          x="20"
          y="70"
          width="15"
          height="20"
          rx="2"
          fill="hsl(var(--primary))"
          opacity="0.6"
        />
        <rect
          x="42"
          y="50"
          width="15"
          height="40"
          rx="2"
          fill="hsl(var(--primary))"
          opacity="0.8"
        />
        <rect
          x="64"
          y="30"
          width="15"
          height="60"
          rx="2"
          fill="hsl(var(--primary))"
          opacity="1"
        >
          <animate
            attributeName="opacity"
            values="1;0.7;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    </MetricCardBase>
  );
}
