import { Gauge } from "lucide-react";
import { MetricCardBase } from "./MetricCardBase";
import type { RpmCardProps } from "../types";

export function RpmCard({
    label,
    value,
    unit,
    quality,
    color,
    min = 0,
    max = 3600,
    target = 1800,
}: RpmCardProps) {
    const numValue = typeof value === "number" ? value : parseFloat(value) || 0;

    // Calculate percentage (0 to 1)
    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    const percent = range > 0 ? (clampedValue - min) / range : 0;

    // Angle for gauge (-90 is left/min, 90 is right/max)
    const gaugeAngle = -90 + percent * 180;

    // Determine status
    const isCritical = numValue >= max * 0.9;
    const isHigh = numValue >= max * 0.75 && !isCritical;

    const strokeColor = isCritical
        ? "stroke-red-500"
        : isHigh
            ? "stroke-yellow-500"
            : "stroke-green-500";

    const fillColor = isCritical
        ? "fill-red-500"
        : isHigh
            ? "fill-yellow-500"
            : "fill-green-500";

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
                    x="15"
                    y="25"
                    width="90"
                    height="75"
                    rx="50"
                    fill="hsl(var(--muted))"
                    stroke="hsl(var(--border))"
                    strokeWidth="2.5"
                    opacity="0.3"
                    className="translate-y-[-10px]"
                />

                {/* Gauge background full arc */}
                <path
                    d="M 20 85 A 40 40 0 0 1 100 85"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    strokeLinecap="round"
                />

                {/* Target indicator */}
                {target > min && target < max && (
                    <path
                        d={`M ${60 + 40 * Math.cos(((-90 + ((target - min) / range) * 180) * Math.PI) / 180)} ${85 + 40 * Math.sin(((-90 + ((target - min) / range) * 180) * Math.PI) / 180)
                            } L ${60 + 32 * Math.cos(((-90 + ((target - min) / range) * 180) * Math.PI) / 180)} ${85 + 32 * Math.sin(((-90 + ((target - min) / range) * 180) * Math.PI) / 180)
                            }`}
                        fill="none"
                        stroke="hsl(var(--foreground))"
                        strokeWidth="3"
                        opacity="0.5"
                    />
                )}

                {/* Gauge Arc Progress */}
                {percent > 0 && (
                    <path
                        d={`M 20 85 A 40 40 0 0 1 ${60 + 40 * Math.cos((gaugeAngle * Math.PI) / 180)
                            } ${85 + 40 * Math.sin((gaugeAngle * Math.PI) / 180)}`}
                        fill="none"
                        className={`transition-all duration-700 ${strokeColor}`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        opacity="0.9"
                    />
                )}

                {/* Gauge Needle */}
                <g transform={`translate(60, 85) rotate(${gaugeAngle})`}>
                    <path
                        d="M 0 0 L -2 -34 L 0 -38 L 2 -34 Z"
                        className={`transition-all duration-700 ${fillColor}`}
                        opacity="0.9"
                    />
                </g>

                {/* Center gauge dot */}
                <circle cx="60" cy="85" r="5" fill="hsl(var(--background))" />
                <circle
                    cx="60"
                    cy="85"
                    r="3"
                    className={`transition-all duration-700 ${fillColor}`}
                />

                {/* Labels */}
                <text
                    x="20"
                    y="105"
                    fontSize="8"
                    fill="hsl(var(--muted-foreground))"
                    textAnchor="middle"
                >
                    {min}
                </text>
                <text
                    x="60"
                    y="108"
                    fontSize="10"
                    fill="hsl(var(--foreground))"
                    textAnchor="middle"
                    fontWeight="bold"
                >
                    {numValue.toFixed(0)} {unit}
                </text>
                <text
                    x="100"
                    y="105"
                    fontSize="8"
                    fill="hsl(var(--muted-foreground))"
                    textAnchor="middle"
                    className={isCritical ? "fill-red-500 font-bold" : ""}
                >
                    {max}
                </text>
            </svg>
        </MetricCardBase>
    );
}
