import { Fan } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MetricCardBase } from "./MetricCardBase";
import type { FanCardProps } from "../types";

export function FanCard({
  label,
  value,
  unit,
  quality,
  color,
  status,
}: FanCardProps) {
  const isOn = status === "ON" || String(status) === "1" || String(status) === "true";

  return (
    <MetricCardBase
      icon={Fan}
      label={label}
      value={value}
      unit={unit}
      quality={quality}
      color={color}
      badge={
        <Badge
          className={
            isOn
              ? "bg-green-500/10 text-green-500 border-green-500/20"
              : "bg-muted text-muted-foreground"
          }
        >
          {isOn ? "ACTIVE" : "INACTIVE"}
        </Badge>
      }
    >
      <svg viewBox="0 0 100 100" className="w-full h-32">
        {/* Fan Housing */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* Fan Blades */}
        <g
          className={isOn ? "animate-spin-slow origin-center" : ""}
          style={{ transformOrigin: "50px 50px" }}
        >
          {[0, 120, 240].map((rotation, i) => (
            <path
              key={i}
              d="M 50 50 L 60 30 Q 65 25, 70 30 L 60 45 Z"
              className={`transition-all duration-300 ${
                isOn ? "fill-green-500" : "fill-muted-foreground"
              }`}
              transform={`rotate(${rotation} 50 50)`}
              opacity={isOn ? "0.9" : "0.4"}
            />
          ))}
        </g>

        {/* Center Hub */}
        <circle
          cx="50"
          cy="50"
          r="8"
          className={isOn ? "fill-green-600" : "fill-muted"}
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />

        {/* Air Flow Lines (when ON) */}
        {isOn && (
          <>
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <line
                  x1="50"
                  y1="90"
                  x2="50"
                  y2="95"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  opacity="0.6"
                  strokeLinecap="round"
                >
                  <animate
                    attributeName="y1"
                    values="90;10"
                    dur="1.5s"
                    begin={`${i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="y2"
                    values="95;15"
                    dur="1.5s"
                    begin={`${i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.6;0"
                    dur="1.5s"
                    begin={`${i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                </line>
              </g>
            ))}
          </>
        )}
      </svg>
    </MetricCardBase>
  );
}
