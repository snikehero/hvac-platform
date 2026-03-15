import { Zap } from "lucide-react";
import { MetricCardBase } from "./MetricCardBase";
import type { CurrentCardProps } from "../types";

export function CurrentCard({
    label,
    value,
    unit,
    quality,
    color,
    min = 0,
    max = 100,
    critical = 80,
}: CurrentCardProps) {
    const numValue = typeof value === "number" ? value : parseFloat(value) || 0;

    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    const percentage = range > 0 ? ((clampedValue - min) / range) * 100 : 0;

    const isCritical = numValue >= critical;
    const isWarning = numValue >= critical * 0.8 && !isCritical;

    const barColor = isCritical
        ? "fill-red-500"
        : isWarning
            ? "fill-yellow-500"
            : "fill-blue-500";

    return (
        <MetricCardBase
            icon={Zap}
            label={label}
            value={numValue.toFixed(1)}
            unit={unit}
            quality={quality}
            color={color}
        >
            <svg viewBox="0 0 100 120" className="w-full h-32">
                {/* Background Bar */}
                <rect
                    x="35"
                    y="20"
                    width="30"
                    height="80"
                    rx="15"
                    fill="hsl(var(--muted))"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                />

                {/* Progress Bar Fill */}
                <rect
                    x="35"
                    y={100 - (80 * percentage) / 100}
                    width="30"
                    height={(80 * percentage) / 100}
                    rx="15"
                    className={`transition-all duration-1000 ${barColor}`}
                    opacity="0.8"
                />

                {/* Critical Threshold Line */}
                {critical > min && critical < max && (
                    <line
                        x1="25"
                        y1={100 - (80 * ((critical - min) / range))}
                        x2="75"
                        y2={100 - (80 * ((critical - min) / range))}
                        stroke="hsl(var(--destructive))"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                    />
                )}

                {/* Energy Flow Animation */}
                {percentage > 0 && (
                    <g className="opacity-50">
                        {[0, 1, 2].map((i) => (
                            <circle
                                key={i}
                                cx="50"
                                cy="100"
                                r="4"
                                className={`transition-all duration-1000 ${barColor}`}
                            >
                                <animate
                                    attributeName="cy"
                                    values={`100;${100 - (80 * percentage) / 100}`}
                                    dur={`${1.5 + i * 0.5}s`}
                                    begin={`${i * 0.5}s`}
                                    repeatCount="indefinite"
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0;1;0"
                                    dur={`${1.5 + i * 0.5}s`}
                                    begin={`${i * 0.5}s`}
                                    repeatCount="indefinite"
                                />
                            </circle>
                        ))}
                    </g>
                )}

                {/* Labels Map */}
                <text
                    x="28"
                    y="105"
                    fontSize="8"
                    fill="hsl(var(--muted-foreground))"
                    textAnchor="end"
                >
                    {min}
                </text>
                <text
                    x="28"
                    y="25"
                    fontSize="8"
                    fill="hsl(var(--muted-foreground))"
                    textAnchor="end"
                >
                    {max}
                </text>

                {/* Value Overlay */}
                <text
                    x="50"
                    y="65"
                    fontSize="12"
                    fill="hsl(var(--background))"
                    textAnchor="middle"
                    fontWeight="bold"
                    className="mix-blend-difference"
                >
                    {numValue.toFixed(1)}
                </text>
            </svg>
        </MetricCardBase>
    );
}
