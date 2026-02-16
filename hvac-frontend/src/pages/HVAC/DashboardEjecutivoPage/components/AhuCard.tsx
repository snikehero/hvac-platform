import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

import { useAhuHistory } from "@/hooks/useAhuHistory";
import { useAhuHealth } from "@/hooks/useAhuHealth";
import type { HvacTelemetry } from "@/types/telemetry";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  ahu: HvacTelemetry;
  onClick?: () => void;
}

export function AhuCard({ ahu, onClick }: Props) {
  const history = useAhuHistory(ahu);
  const getHealth = useAhuHealth();
  const health = getHealth(ahu);
  const { t } = useTranslation();

  const temperature = Number(ahu.points.temperature?.value);
  const humidity = Number(ahu.points.humidity?.value);

  // Calcular tendencias
  const tempTrend = getTrend(history.temperature);
  const humidityTrend = getTrend(history.humidity);

  // Configuración por estado
  const statusConfig = {
    ALARM: {
      border: "border-destructive/50",
      bg: "bg-destructive/5",
      glow: "shadow-lg shadow-destructive/20",
      badge: "destructive" as const,
      icon: AlertTriangle,
      iconColor: "text-destructive",
      pulse: true,
    },
    WARNING: {
      border: "border-yellow-500/50",
      bg: "bg-yellow-500/5",
      glow: "shadow-md shadow-yellow-500/10",
      badge: "secondary" as const,
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      pulse: false,
    },
    OK: {
      border: "border-green-500/30",
      bg: "bg-green-500/5",
      glow: "",
      badge: "default" as const,
      icon: CheckCircle2,
      iconColor: "text-green-500",
      pulse: false,
    },
    DISCONNECTED: {
      border: "border-muted",
      bg: "bg-muted/5",
      glow: "",
      badge: "outline" as const,
      icon: WifiOff,
      iconColor: "text-muted-foreground",
      pulse: false,
    },
  };

  const config = statusConfig[health.status];
  const StatusIcon = config.icon;

  return (
    <Card
      onClick={onClick}
      className={`
        group relative overflow-hidden
        cursor-pointer backdrop-blur-sm
        transition-all duration-300
        hover:scale-[1.02] hover:shadow-xl
        ${config.border} ${config.bg} ${config.glow}
        ${config.pulse ? "animate-pulse" : ""}
      `}
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />

      {/* Header */}
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <h3 className="font-bold text-lg tracking-tight">
              {ahu.stationId}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {ahu.plantId}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={config.badge}
              className={`font-mono text-xs ${config.pulse ? "animate-pulse" : ""}`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {health.status}
            </Badge>

            {health.badPoints > 0 && (
              <span className="text-xs text-destructive font-medium">
                {health.badPoints} {health.badPoints === 1 ? t.ahuCard.error : t.ahuCard.errors}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="relative z-10 space-y-5 pb-6">
        {/* Temperatura */}
        <MetricRow
          icon={<Thermometer className="w-5 h-5 text-primary" />}
          label={t.ahuCard.temperature}
          value={!isNaN(temperature) ? temperature.toFixed(1) : "--"}
          unit="°C"
          trend={tempTrend}
          sparklineData={history.temperature.slice(-10)}
          sparklineColor="#3b82f6"
        />

        {/* Humedad */}
        <MetricRow
          icon={<Droplets className="w-5 h-5 text-accent" />}
          label={t.ahuCard.humidity}
          value={!isNaN(humidity) ? humidity.toFixed(1) : "--"}
          unit="%"
          trend={humidityTrend}
          sparklineData={history.humidity.slice(-10)}
          sparklineColor="#06b6d4"
        />
      </CardContent>

      {/* Status Indicator Dot */}
      <div className="absolute top-3 right-3">
        <div
          className={`
            w-2 h-2 rounded-full
            ${config.iconColor.replace("text-", "bg-")}
            ${config.pulse ? "animate-ping" : ""}
          `}
        />
      </div>
    </Card>
  );
}

// ===== Subcomponents =====

interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  trend?: "up" | "down" | "stable";
  sparklineData?: Array<{ timestamp: string; value: number }>;
  sparklineColor?: string;
}

function MetricRow({
  icon,
  label,
  value,
  unit,
  trend,
  sparklineData,
  sparklineColor = "#3b82f6",
}: MetricRowProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-destructive"
      : trend === "down"
        ? "text-accent"
        : "text-muted-foreground";

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          {trend && <TrendIcon className={`w-4 h-4 ${trendColor}`} />}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black tabular-nums">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <MiniSparkline data={sparklineData} color={sparklineColor} />
      )}
    </div>
  );
}

// Simple inline sparkline (sin Recharts para mejor performance)
function MiniSparkline({
  data,
  color,
}: {
  data: Array<{ value: number }>;
  color: string;
}) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Add padding to prevent clipping
  const paddingX = 5;
  const paddingY = 10;
  const width = 100 - paddingX * 2;
  const height = 100 - paddingY * 2;

  const points = values
    .map((value, i) => {
      const x = paddingX + (i / (values.length - 1)) * width;
      const y = paddingY + (1 - (value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-16"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

// Helper para calcular tendencia
function getTrend(data: Array<{ value: number }>): "up" | "down" | "stable" {
  if (data.length < 2) return "stable";

  const recent = data.slice(-5);
  const avg = recent.reduce((acc, p) => acc + p.value, 0) / recent.length;
  const last = data[data.length - 1].value;

  const diff = last - avg;

  if (diff > 1) return "up";
  if (diff < -1) return "down";
  return "stable";
}
