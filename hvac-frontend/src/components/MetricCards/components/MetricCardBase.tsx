import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricCardBaseProps, MetricColor } from "../types";
import type { HistoryPoint } from "@/types/history";

/* ── Inline sparkline ─────────────────────────────────── */

function Sparkline({
  points,
  color,
}: {
  points: HistoryPoint[];
  color: string;
}) {
  const last10 = points.slice(-10);
  if (last10.length < 2) return null;

  const W = 64;
  const H = 24;
  const values = last10.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = last10.map((p, i) => {
    const x = (i / (last10.length - 1)) * W;
    const y = H - ((p.value - min) / range) * H;
    return `${x},${y}`;
  });

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible opacity-60"
    >
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Trend icon ───────────────────────────────────────── */

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

/* ── MetricCardBase ───────────────────────────────────── */

export function MetricCardBase({
  icon: Icon,
  label,
  value,
  unit,
  quality,
  color,
  badge,
  children,
  trend,
  historyData,
}: MetricCardBaseProps) {
  const colorClasses: Record<
    MetricColor,
    { icon: string; bg: string; border: string; value: string; stroke: string }
  > = {
    primary: {
      icon: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/30",
      value: "text-primary",
      stroke: "oklch(var(--primary))",
    },
    accent: {
      icon: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/30",
      value: "text-accent",
      stroke: "currentColor",
    },
    success: {
      icon: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      value: "text-green-500",
      stroke: "#22c55e",
    },
    warning: {
      icon: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      value: "text-yellow-500",
      stroke: "#eab308",
    },
    destructive: {
      icon: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      value: "text-destructive",
      stroke: "#ef4444",
    },
    chart: {
      icon: "text-chart-4",
      bg: "bg-chart-4/10",
      border: "border-chart-4/30",
      value: "text-chart-4",
      stroke: "oklch(var(--chart-4))",
    },
  };

  const colors = colorClasses[color] ?? colorClasses.primary;

  const qualityColor =
    quality === "BAD"
      ? "text-destructive"
      : quality === "GOOD"
        ? "text-green-500"
        : "text-muted-foreground";

  const TrendIcon = trend ? TREND_ICON[trend.direction] : null;
  const trendColor =
    trend?.direction === "up"
      ? "text-red-400"
      : trend?.direction === "down"
        ? "text-green-400"
        : "text-muted-foreground";

  return (
    <Card
      className={`
        border backdrop-blur-sm transition-all duration-300 hover:scale-105
        ${colors.border} ${colors.bg}
        ${quality === "BAD" ? "shadow-lg shadow-destructive/20 animate-pulse" : ""}
      `}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${colors.icon}`} />
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sparkline — shown when historyData is available */}
            {historyData && historyData.length >= 2 && (
              <Sparkline points={historyData} color={colors.stroke} />
            )}
            {quality && (
              <div
                className={`w-2 h-2 rounded-full ${qualityColor.replace("text-", "bg-")}`}
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* SVG Visualization */}
        <div className="flex items-center justify-center">{children}</div>

        {/* Value + Trend arrow */}
        <div className="flex items-baseline justify-center gap-2">
          <span className={`text-3xl font-black tabular-nums ${colors.value}`}>
            {value ?? "--"}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
          {TrendIcon && trend && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              {trend.delta}
            </span>
          )}
        </div>

        {/* Badge or Quality */}
        <div className="flex items-center justify-center">
          {badge ||
            (quality && (
              <p className={`text-xs ${qualityColor}`}>Quality: {quality}</p>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
