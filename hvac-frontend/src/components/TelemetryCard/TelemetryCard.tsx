/* eslint-disable react-hooks/purity */
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import type { HvacTelemetry } from "@/types/telemetry";
import { routes } from "@/router/routes";
import { useAhuHealth } from "@/hooks/useAhuHealth";
import { Badge } from "@/components/ui/badge";
import {
  Thermometer,
  Droplets,
  Fan,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
} from "lucide-react";
import { useAhuHistory } from "@/hooks/useAhuHistory";
import { useMemo } from "react";
import { useTranslation } from "@/i18n/useTranslation";

interface TelemetryCardProps {
  ahu: HvacTelemetry;
}

export default function TelemetryCard({ ahu }: TelemetryCardProps) {
  const navigate = useNavigate();
  const { stationId, points, timestamp, plantId } = ahu;
  const getHealth = useAhuHealth();
  const health = getHealth(ahu);
  const ahuHistory = useAhuHistory(ahu);
  const { t,} = useTranslation();

  // Temperatura promedio últimos 60s
  const avgTemperature = useMemo(() => {
    if (!ahuHistory?.temperature || ahuHistory.temperature.length === 0)
      return null;

    const cutoff = Date.now() - 60 * 1000;

    const recentPoints = ahuHistory.temperature.filter(
      (p) => new Date(p.timestamp).getTime() >= cutoff,
    );

    if (recentPoints.length === 0) return null;

    const sum = recentPoints.reduce((acc, p) => acc + p.value, 0);
    return sum / recentPoints.length;
  }, [ahuHistory]);

  // Config de colores por estado
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

  // Datos extra (excluyendo los core)
  const CORE_KEYS = ["temperature", "humidity", "fan_status", "status"];
  const extraPoints = Object.entries(points).filter(
    ([key]) => !CORE_KEYS.includes(key),
  );

  return (
    <Card
      onClick={() => navigate(routes.hvac.ahuDetail(plantId, stationId))}
      className={`
        group relative overflow-hidden border backdrop-blur-sm
        transition-all duration-300 cursor-pointer
        hover:scale-[1.02] hover:shadow-xl
        ${config.border} ${config.bg} ${config.glow}
        ${config.pulse ? "animate-pulse" : ""}
      `}
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              {stationId}
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              {t.ahuCard.plant} {plantId}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={config.badge}
              className={`font-mono ${config.pulse ? "animate-pulse" : ""}`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {health.status}
            </Badge>
          </div>
        </div>

        {/* Core Metrics */}
        <div className="space-y-3">
          {/* Temperature */}
          <MetricRow
            icon={<Thermometer className="w-4 h-4 text-primary" />}
            label={t.ahuCard.temperature}
            value={`${points.temperature?.value ?? "--"}`}
            unit={points.temperature?.unit ?? "°C"}
          />

          {/* Humidity */}
          <MetricRow
            icon={<Droplets className="w-4 h-4 text-accent" />}
            label={t.ahuCard.humidity}
            value={`${points.humidity?.value ?? "--"}`}
            unit={points.humidity?.unit ?? "%"}
          />

          {/* Fan Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Fan
                className={`w-4 h-4 ${
                  points.fan_status?.value === "ON"
                    ? "text-green-500 animate-spin"
                    : "text-muted-foreground"
                }`}
              />
              <span className="font-medium">{t.ahuCard.fan}</span>
            </div>
            <Badge
              className={
                points.fan_status?.value === "ON"
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {points.fan_status?.value ?? "--"}
            </Badge>
          </div>
        </div>

        {/* Average Temperature */}
        {avgTemperature !== null && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.ahuCard.avg60s}</span>
              <span className="font-semibold tabular-nums text-primary">
                {avgTemperature.toFixed(1)} {points.temperature?.unit ?? "°C"}
              </span>
            </div>
          </div>
        )}

        {/* Extra Points */}
        {extraPoints.length > 0 && (
          <div className="pt-3 border-t border-border/50 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t.ahuCard.additionalData}
            </div>
            {extraPoints.slice(0, 4).map(([key, point]) => (
              <div
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="font-mono">
                  {point.value ?? "--"} {point.unit ?? ""}
                </span>
              </div>
            ))}
            {extraPoints.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{extraPoints.length - 3} {t.ahuCard.moreData}...
              </p>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="font-mono">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Status indicator dot */}
      <div className="absolute top-4 right-4">
        <div
          className={`
          w-2 h-2 rounded-full
          ${config.iconColor.replace("text-", "bg-")}
          ${config.pulse ? "animate-pulse" : ""}
        `}
        />
      </div>
    </Card>
  );
}

/* ================= COMPONENTS ================= */

interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}

function MetricRow({ icon, label, value, unit }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="font-semibold tabular-nums">
        {value}{" "}
        <span className="text-xs text-muted-foreground font-normal">
          {unit}
        </span>
      </div>
    </div>
  );
}
