import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricCardBaseProps, MetricColor } from "../types";

export function MetricCardBase({
  icon: Icon,
  label,
  value,
  unit,
  quality,
  color,
  badge,
  children,
}: MetricCardBaseProps) {
  const colorClasses: Record<
    MetricColor,
    { icon: string; bg: string; border: string; value: string }
  > = {
    primary: {
      icon: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/30",
      value: "text-primary",
    },
    accent: {
      icon: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/30",
      value: "text-accent",
    },
    success: {
      icon: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      value: "text-green-500",
    },
    warning: {
      icon: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      value: "text-yellow-500",
    },
    destructive: {
      icon: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      value: "text-destructive",
    },
    chart: {
      icon: "text-chart-4",
      bg: "bg-chart-4/10",
      border: "border-chart-4/30",
      value: "text-chart-4",
    },
  };

  const colors = colorClasses[color];

  const qualityColor =
    quality === "BAD"
      ? "text-destructive"
      : quality === "GOOD"
        ? "text-green-500"
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

          {quality && (
            <div
              className={`w-2 h-2 rounded-full ${qualityColor.replace("text-", "bg-")}`}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* SVG Visualization */}
        <div className="flex items-center justify-center">{children}</div>

        {/* Value */}
        <div className="flex items-baseline justify-center gap-2">
          <span className={`text-3xl font-black tabular-nums ${colors.value}`}>
            {value ?? "--"}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
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
