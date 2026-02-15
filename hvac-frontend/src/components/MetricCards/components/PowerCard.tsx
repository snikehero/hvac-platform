import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MetricCardBase } from "./MetricCardBase";
import type { PowerCardProps } from "../types";

export function PowerCard({
  label,
  value,
  unit,
  quality,
  color,
  status,
}: PowerCardProps) {
  const isOn = status === "ON" || String(status) === "1" || String(status) === "true";

  return (
    <MetricCardBase
      icon={Zap}
      label={label}
      value={value}
      unit={unit}
      quality={quality}
      color={color}
      badge={
        <Badge
          className={
            isOn
              ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              : "bg-muted text-muted-foreground"
          }
        >
          {isOn ? "POWERED" : "OFF"}
        </Badge>
      }
    >
      <svg viewBox="0 0 100 120" className="w-full h-32">
        {/* Power Symbol Circle */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill={isOn ? "hsl(var(--warning))" : "hsl(var(--muted))"}
          fillOpacity={isOn ? "0.2" : "0.1"}
          stroke="hsl(var(--border))"
          strokeWidth="2"
          className="transition-all duration-500"
        >
          {isOn && (
            <animate
              attributeName="r"
              values="30;32;30"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Lightning Bolt */}
        <path
          d="M 50 25 L 45 45 L 52 45 L 48 65 L 60 42 L 53 42 L 57 25 Z"
          className={`transition-all duration-500 ${
            isOn ? "fill-yellow-400" : "fill-muted-foreground"
          }`}
          opacity={isOn ? "1" : "0.3"}
        >
          {isOn && (
            <>
              <animate
                attributeName="opacity"
                values="1;0.6;1"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </>
          )}
        </path>

        {/* Energy Waves (when ON) */}
        {isOn && (
          <>
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke="hsl(var(--warning))"
                strokeWidth="2"
                opacity="0"
              >
                <animate
                  attributeName="r"
                  values="30;45"
                  dur="2s"
                  begin={`${i * 0.7}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0"
                  dur="2s"
                  begin={`${i * 0.7}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </>
        )}

        {/* Power Flow Lines (when ON) */}
        {isOn && (
          <>
            <line
              x1="50"
              y1="85"
              x2="50"
              y2="95"
              stroke="hsl(var(--warning))"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="1s"
                repeatCount="indefinite"
              />
            </line>
            <line
              x1="45"
              y1="90"
              x2="55"
              y2="90"
              stroke="hsl(var(--warning))"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="1s"
                begin="0.5s"
                repeatCount="indefinite"
              />
            </line>
          </>
        )}
      </svg>
    </MetricCardBase>
  );
}
