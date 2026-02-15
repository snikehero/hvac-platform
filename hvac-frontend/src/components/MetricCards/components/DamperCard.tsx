import { Gauge } from "lucide-react";
import { MetricCardBase } from "./MetricCardBase";
import type { DamperCardProps } from "../types";

export function DamperCard({
  label,
  value,
  unit,
  quality,
  color,
}: DamperCardProps) {
  const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const angle = (numValue / 100) * 90; // 0-90 degrees
  const isClosed = numValue < 10;
  const isOpen = numValue > 90;
  const gaugeAngle = -90 + (numValue / 100) * 180; // -90 to 90 degrees for gauge

  return (
    <MetricCardBase
      icon={Gauge}
      label={label}
      value={numValue.toFixed(0)}
      unit={unit}
      quality={quality}
      color={color}
    >
      <svg viewBox="0 0 120 120" className="w-full h-32">
        {/* Outer Frame with depth */}
        <rect
          x="25"
          y="25"
          width="70"
          height="50"
          rx="8"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2.5"
          opacity="0.3"
        />
        <rect
          x="27"
          y="27"
          width="66"
          height="46"
          rx="6"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Airflow Indicator Lines (background) */}
        {isOpen && (
          <>
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <line
                  x1="10"
                  y1={40 + i * 8}
                  x2="30"
                  y2={40 + i * 8}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0"
                >
                  <animate
                    attributeName="x1"
                    values="10;110"
                    dur="2s"
                    begin={`${i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="x2"
                    values="30;130"
                    dur="2s"
                    begin={`${i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.6;0"
                    dur="2s"
                    begin={`${i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </line>
              </g>
            ))}
          </>
        )}

        {/* Damper Blade with 3D effect */}
        <g transform="translate(60, 50)">
          {/* Shadow/depth layer */}
          <rect
            x="-32"
            y="-2"
            width="64"
            height="4"
            rx="2"
            fill="black"
            opacity="0.2"
            transform={`rotate(${-45 + angle})`}
            style={{ transformOrigin: "center" }}
            className="transition-all duration-700"
          />
          {/* Main blade */}
          <rect
            x="-32"
            y="-3"
            width="64"
            height="6"
            rx="3"
            className={`transition-all duration-700 ${
              isClosed
                ? "fill-red-500"
                : isOpen
                  ? "fill-green-500"
                  : "fill-accent"
            }`}
            transform={`rotate(${-45 + angle})`}
            style={{ transformOrigin: "center" }}
            opacity="0.9"
          />
          {/* Blade highlight */}
          <rect
            x="-30"
            y="-2"
            width="60"
            height="2"
            rx="1"
            fill="white"
            opacity="0.3"
            transform={`rotate(${-45 + angle})`}
            style={{ transformOrigin: "center" }}
            className="transition-all duration-700"
          />
        </g>

        {/* Pivot mechanism */}
        <circle
          cx="60"
          cy="50"
          r="6"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
        <circle cx="60" cy="50" r="3" fill="hsl(var(--muted-foreground))" />
        <circle cx="60" cy="50" r="1.5" fill="hsl(var(--border))" />

        {/* Gauge Arc Background */}
        <path
          d="M 30 95 A 30 30 0 0 1 90 95"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Gauge Arc Progress */}
        <path
          d={`M 30 95 A 30 30 0 0 1 ${
            60 + 30 * Math.cos((gaugeAngle * Math.PI) / 180)
          } ${95 - 30 * Math.sin((gaugeAngle * Math.PI) / 180)}`}
          fill="none"
          className={`transition-all duration-700 ${
            isClosed
              ? "stroke-red-500"
              : isOpen
                ? "stroke-green-500"
                : "stroke-accent"
          }`}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Gauge Needle */}
        <g transform={`translate(60, 95) rotate(${gaugeAngle})`}>
          <path
            d="M 0 0 L -2 -25 L 0 -28 L 2 -25 Z"
            className={`transition-all duration-700 ${
              isClosed
                ? "fill-red-500"
                : isOpen
                  ? "fill-green-500"
                  : "fill-accent"
            }`}
            opacity="0.9"
          >
            {(isClosed || isOpen) && (
              <animate
                attributeName="opacity"
                values="0.9;0.6;0.9"
                dur="1s"
                repeatCount="indefinite"
              />
            )}
          </path>
        </g>

        {/* Center gauge dot */}
        <circle cx="60" cy="95" r="4" fill="hsl(var(--background))" />
        <circle
          cx="60"
          cy="95"
          r="2.5"
          className={`transition-all duration-700 ${
            isClosed
              ? "fill-red-500"
              : isOpen
                ? "fill-green-500"
                : "fill-accent"
          }`}
        />

        {/* Status indicators */}
        <circle
          cx="25"
          cy="95"
          r="2.5"
          className={isClosed ? "fill-red-500" : "fill-muted"}
          opacity={isClosed ? "1" : "0.3"}
        >
          {isClosed && (
            <animate
              attributeName="opacity"
              values="1;0.4;1"
              dur="0.8s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle
          cx="95"
          cy="95"
          r="2.5"
          className={isOpen ? "fill-green-500" : "fill-muted"}
          opacity={isOpen ? "1" : "0.3"}
        >
          {isOpen && (
            <animate
              attributeName="opacity"
              values="1;0.4;1"
              dur="0.8s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Labels */}
        <text
          x="25"
          y="110"
          fontSize="7"
          fill="hsl(var(--muted-foreground))"
          textAnchor="middle"
          fontWeight={isClosed ? "bold" : "normal"}
          className={isClosed ? "fill-red-500" : ""}
        >
          0%
        </text>
        <text
          x="60"
          y="115"
          fontSize="9"
          fill="hsl(var(--foreground))"
          textAnchor="middle"
          fontWeight="bold"
        >
          {numValue.toFixed(0)}%
        </text>
        <text
          x="95"
          y="110"
          fontSize="7"
          fill="hsl(var(--muted-foreground))"
          textAnchor="middle"
          fontWeight={isOpen ? "bold" : "normal"}
          className={isOpen ? "fill-green-500" : ""}
        >
          100%
        </text>
      </svg>
    </MetricCardBase>
  );
}
