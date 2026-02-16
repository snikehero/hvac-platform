/* eslint-disable react-hooks/exhaustive-deps */
// src/app/page.tsx
import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Thermometer,
  AlertTriangle,
  AirVent,
  Bell,
  ShieldCheck,
  ArrowRight,
  Gauge,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAhuHealth } from "@/hooks/useAhuHealth";
import { routes } from "@/router/routes";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export default function HomePageHVAC() {
  const { telemetry, ahuConnectionStatus } = useTelemetry();
  const connected = useWebSocket();
  const [mounted, setMounted] = useState(false);
  const { t, tf } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getHealth = useAhuHealth();

  /* -------------------------------- */
  /* Contadores usando HEALTH */
  /* -------------------------------- */

  const { activeAlarms, activeWarnings } = useMemo(() => {
    let alarms = 0;
    let warnings = 0;

    const isAhuConnected = (ahu: { plantId: string; stationId: string }) => {
      const key = `${ahu.plantId}-${ahu.stationId}`;
      return ahuConnectionStatus[key]?.isConnected ?? false;
    };

    telemetry.forEach((ahu) => {
      if (!isAhuConnected(ahu)) return;

      const health = getHealth(ahu);

      if (health.status === "ALARM") alarms++;
      else if (health.status === "WARNING") warnings++;
    });

    return { activeAlarms: alarms, activeWarnings: warnings };
  }, [telemetry, ahuConnectionStatus, getHealth]);

  /* -------------------------------- */
  /* Salud Operacional Global */
  /* -------------------------------- */

  const systemHealth = useMemo(() => {
    if (telemetry.length === 0) return "NO_DATA";

    let hasAlarm = false;
    let hasWarning = false;
    let hasDisconnected = false;

    const isAhuConnected = (ahu: { plantId: string; stationId: string }) => {
      const key = `${ahu.plantId}-${ahu.stationId}`;
      return ahuConnectionStatus[key]?.isConnected ?? false;
    };

    telemetry.forEach((ahu) => {
      const ahuConnected = isAhuConnected(ahu);

      if (!ahuConnected) {
        hasDisconnected = true;
        return;
      }

      const health = getHealth(ahu);

      if (health.status === "ALARM") hasAlarm = true;
      else if (health.status === "WARNING") hasWarning = true;
    });

    if (hasAlarm) return "CRITICAL";
    if (hasWarning || hasDisconnected) return "DEGRADED";

    return "HEALTHY";
  }, [telemetry, ahuConnectionStatus, getHealth]);

  const healthConfig = {
    CRITICAL: {
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
      label: t.homePageHvac.critical,
    },
    DEGRADED: {
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      label: t.homePageHvac.degraded,
    },
    HEALTHY: {
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      label: t.homePageHvac.healthy,
    },
    NO_DATA: {
      color: "text-muted-foreground",
      bgColor: "bg-muted/10",
      borderColor: "border-muted/30",
      label: t.homePageHvac.noData,
    },
  };

  const currentHealth = healthConfig[systemHealth];

  /* -------------------------------- */
  /* Temperatura promedio (solo conectados) */
  /* -------------------------------- */

  const avgTemperature = useMemo(() => {
    const isAhuConnected = (ahu: { plantId: string; stationId: string }) => {
      const key = `${ahu.plantId}-${ahu.stationId}`;
      return ahuConnectionStatus[key]?.isConnected ?? false;
    };

    const temps: number[] = [];

    telemetry.forEach((ahu) => {
      if (!isAhuConnected(ahu)) return;

      const t = ahu.points.temperature?.value;
      if (typeof t === "number") temps.push(t);
    });

    return temps.length
      ? temps.reduce((a, b) => a + b, 0) / temps.length
      : null;
  }, [telemetry, ahuConnectionStatus, getHealth]);

  /* -------------------------------- */
  /* AHUs Conectados */
  /* -------------------------------- */

  const connectedAhus = useMemo(() => {
    return telemetry.filter((ahu) => {
      const key = `${ahu.plantId}-${ahu.stationId}`;
      return ahuConnectionStatus[key]?.isConnected ?? false;
    }).length;
  }, [telemetry, ahuConnectionStatus, getHealth]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects - Similar a HomePage principal */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)] opacity-20" />

      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse-slow" />
      <div
        className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[128px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 p-6 md:p-12 space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <section
          className={`
          space-y-4
          transition-all duration-1000 delay-100
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
        >
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <AirVent className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-primary uppercase tracking-wider">
                {t.homePageHvac.hvacModule}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              <span className="bg-linear-to-r from-foreground to-primary bg-clip-text text-transparent">
                {t.homePageHvac.airHandling}
              </span>{" "}
              <span className="text-primary">{t.homePageHvac.control}</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl">
              {t.homePageHvac.subtitle}
            </p>
          </div>
        </section>

        {/* Connection Status Bar */}
        <section
          className={`
          transition-all duration-1000 delay-200
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
        >
          <Card
            className={`
            border overflow-hidden backdrop-blur-sm
            ${connected ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}
          `}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    w-3 h-3 rounded-full
                    ${connected ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-destructive shadow-lg shadow-destructive/50"}
                    animate-pulse
                  `}
                  />
                  <div>
                    <p
                      className={`font-bold ${connected ? "text-green-500" : "text-destructive"}`}
                    >
                      {connected ? t.homePageHvac.serverOnline : t.homePageHvac.serverOffline}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {connected
                        ? t.homePageHvac.telemetryActive
                        : t.homePageHvac.reconnecting}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={connected ? "default" : "destructive"}
                  className="font-mono"
                >
                  {connected ? t.homePageHvac.connected : t.homePageHvac.disconnected}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Metrics Grid */}
        <section
          className={`
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
          transition-all duration-1000 delay-300
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
        >
          {/* System Health */}
          <MetricCard
            icon={ShieldCheck}
            label={t.homePageHvac.systemHealth}
            value={currentHealth.label}
            className={`${currentHealth.bgColor} ${currentHealth.borderColor} ${currentHealth.color}`}
            pulse={systemHealth === "CRITICAL"}
          />

          {/* Connected AHUs */}
          <MetricCard
            icon={Activity}
            label={t.homePageHvac.connectedAhus}
            value={connectedAhus}
            suffix={t.homePageHvac.units}
            className="bg-primary/10 border-primary/30 text-primary"
            pulse={connected}
          />

          {/* Avg Temperature */}
          <MetricCard
            icon={Thermometer}
            label={t.homePageHvac.avgTemperature}
            value={avgTemperature?.toFixed(1) ?? "--"}
            suffix={avgTemperature !== null ? "°C" : ""}
            className="bg-accent/10 border-accent/30 text-accent"
          />

          {/* Active Alarms */}
          <MetricCard
            icon={AlertTriangle}
            label={t.homePageHvac.criticalAlarms}
            value={activeAlarms}
            suffix={t.homePageHvac.active}
            className="bg-destructive/10 border-destructive/30 text-destructive"
            pulse={activeAlarms > 0}
            alert={activeAlarms > 0}
          />
        </section>

        {/* Status Overview */}
        <section
          className={`
          transition-all duration-1000 delay-400
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
        >
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                {t.homePageHvac.systemOverview}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Healthy */}
                <StatusBox
                  label={t.homePageHvac.operational}
                  value={connectedAhus - activeAlarms - activeWarnings}
                  total={connectedAhus}
                  color="green"
                  icon={TrendingUp}
                  t={t}
                  tf={tf}
                />

                {/* Warnings */}
                <StatusBox
                  label={t.homePageHvac.warnings}
                  value={activeWarnings}
                  total={connectedAhus}
                  color="yellow"
                  icon={AlertTriangle}
                  t={t}
                  tf={tf}
                />

                {/* Critical */}
                <StatusBox
                  label={t.homePageHvac.criticalLabel}
                  value={activeAlarms}
                  total={connectedAhus}
                  color="red"
                  icon={AlertTriangle}
                  t={t}
                  tf={tf}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section
          className={`
          space-y-4
          transition-all duration-1000 delay-500
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
        >
          <h2 className="text-2xl font-bold tracking-tight">
            <span className="text-muted-foreground">{t.homePageHvac.quick}</span>{" "}
            <span className="text-foreground">{t.homePageHvac.actions}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              to={routes.hvac.dashboard}
              icon={AirVent}
              label={t.homePageHvac.dashboard}
              description={t.homePageHvac.viewAllAhus}
              color="primary"
              t={t}
            />

            <QuickActionCard
              to={routes.hvac.alarms}
              icon={Bell}
              label={t.homePageHvac.alarms}
              description={t.homePageHvac.activeAlerts}
              color="destructive"
              badge={activeAlarms > 0 ? activeAlarms : undefined}
              t={t}
            />

            <QuickActionCard
              to={routes.hvac.dashboard}
              icon={Thermometer}
              label={t.homePageHvac.temperature}
              description={t.homePageHvac.thermalMonitoring}
              color="accent"
              t={t}
            />

            <QuickActionCard
              to={routes.hvac.dashboard}
              icon={Activity}
              label={t.homePageHvac.analytics}
              description={t.homePageHvac.systemInsights}
              color="chart"
              t={t}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  className?: string;
  pulse?: boolean;
  alert?: boolean;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
  className = "",
  pulse = false,
  alert = false,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value === "number") {
      const duration = 1000;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(current + increment, value);
        setDisplayValue(current);

        if (step >= steps) {
          clearInterval(timer);
          setDisplayValue(value);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value]);

  return (
    <Card
      className={`
      relative overflow-hidden border backdrop-blur-sm
      transition-all duration-300 hover:scale-105 group
      ${className}
      ${alert ? "shadow-lg animate-pulse" : ""}
    `}
    >
      {pulse && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 opacity-70">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="text-3xl font-black tabular-nums tracking-tight">
          {typeof value === "number" ? Math.floor(displayValue) : value}
        </div>
        {suffix && <div className="text-xs font-mono opacity-60">{suffix}</div>}
      </CardContent>

      {/* Animated border effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-current to-transparent opacity-10 animate-shimmer" />
      </div>
    </Card>
  );
}

interface StatusBoxProps {
  label: string;
  value: number;
  total: number;
  color: "green" | "yellow" | "red";
  icon: LucideIcon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  tf: (text: string, values: Record<string, string | number>) => string;
}

function StatusBox({ label, value, total, color, icon: Icon, t, tf }: StatusBoxProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colorClasses = {
    green: {
      text: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
    },
    yellow: {
      text: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
    },
    red: {
      text: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`p-4 rounded-lg border ${colors.bg} ${colors.border} space-y-3`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <Icon className={`w-4 h-4 ${colors.text}`} />
      </div>

      <div className="space-y-2">
        <div className={`text-3xl font-black tabular-nums ${colors.text}`}>
          {value}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bg} border-r-2 ${colors.border} transition-all duration-1000`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground tabular-nums">
            {percentage.toFixed(0)}%
          </span>
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          {tf(t.homePageHvac.ofUnits, { value, total })}
        </p>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  to: string;
  icon: LucideIcon;
  label: string;
  description: string;
  color: "primary" | "destructive" | "accent" | "chart";
  badge?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

function QuickActionCard({
  to,
  icon: Icon,
  label,
  description,
  color,
  badge,
  t,
}: QuickActionCardProps) {
  const colorClasses = {
    primary: {
      icon: "text-primary",
      bg: "bg-primary/10",
      hover: "hover:border-primary/50 hover:shadow-primary/20",
    },
    destructive: {
      icon: "text-destructive",
      bg: "bg-destructive/10",
      hover: "hover:border-destructive/50 hover:shadow-destructive/20",
    },
    accent: {
      icon: "text-accent",
      bg: "bg-accent/10",
      hover: "hover:border-accent/50 hover:shadow-accent/20",
    },
    chart: {
      icon: "text-chart-4",
      bg: "bg-chart-4/10",
      hover: "hover:border-chart-4/50 hover:shadow-chart-4/20",
    },
  };

  const colors = colorClasses[color];

  return (
    <Link to={to}>
      <Card
        className={`
        group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm
        transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl
        ${colors.hover}
      `}
      >
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-lg ${colors.bg}`}>
              <Icon className={`w-6 h-6 ${colors.icon}`} />
            </div>

            {badge !== undefined && badge > 0 && (
              <Badge variant="destructive" className="animate-pulse font-mono">
                {badge}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <h3
              className={`font-bold text-lg group-hover:${colors.icon} transition-colors`}
            >
              {label}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div
            className={`flex items-center gap-2 text-sm font-medium ${colors.icon}`}
          >
            <span>{t.homePageHvac.open}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>

        {/* Hover gradient */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-br from-current/5 to-transparent pointer-events-none" />
      </Card>
    </Link>
  );
}
