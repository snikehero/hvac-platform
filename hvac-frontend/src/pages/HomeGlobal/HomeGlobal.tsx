/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AirVent,
  Activity,
  Server,
  AlertTriangle,
  ArrowRight,
  Zap,
  Eye,
} from "lucide-react";

import { routes } from "@/router/routes";
import { useTelemetry } from "@/hooks/useTelemetry";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomeGlobal() {
  const navigate = useNavigate();
  const { telemetry, ahuConnectionStatus, connected } = useTelemetry();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const metrics = useMemo(() => {
    const activeAhus = telemetry.filter((ahu) => {
      const key = `${ahu.plantId}-${ahu.stationId}`;
      return ahuConnectionStatus[key]?.isConnected;
    });

    const totalDevices = activeAhus.length;

    const activeAlarms = activeAhus.reduce((acc, ahu) => {
      const health = getAhuHealth(ahu);
      return acc + (health.status === "ALARM" ? 1 : 0);
    }, 0);

    const warnings = activeAhus.reduce((acc, ahu) => {
      const health = getAhuHealth(ahu);
      return acc + (health.status === "WARNING" ? 1 : 0);
    }, 0);

    const plants = new Set(activeAhus.map((t) => t.plantId)).size;

    const avgTemp =
      activeAhus.length > 0
        ? activeAhus.reduce((acc, ahu) => {
            const temp = ahu.points.temperature?.value;
            return acc + (typeof temp === "number" ? temp : 0);
          }, 0) / activeAhus.length
        : 0;

    return {
      totalDevices,
      activeAlarms,
      warnings,
      plants,
      avgTemp,
      healthy: totalDevices - activeAlarms - warnings,
    };
  }, [telemetry, ahuConnectionStatus]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Grid Background - usa bg del tema */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)] opacity-30" />

      {/* Ambient Glow Effects - usa primary */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse-slow" />

      {/* Scanline Effect - usa primary con muy baja opacidad */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_0%,hsl(var(--primary)/0.03)_50%,transparent_100%)] bg-[length:100%_4px] pointer-events-none animate-scan" />

      <div className="relative z-10 px-6 py-12 md:px-12 lg:px-20">
        {/* Connection Status Bar */}
        <div
          className={`
          fixed top-0 left-0 right-0 h-1 z-50 transition-all duration-500
          ${connected ? "bg-gradient-to-r from-green-500 to-primary" : "bg-gradient-to-r from-destructive to-orange-500"}
        `}
        >
          <div
            className={`h-full w-full ${connected ? "animate-pulse-slow" : "animate-pulse"}`}
          />
        </div>

        {/* Hero Section */}
        <section
          className={`
          max-w-7xl mx-auto space-y-12 pt-8
          transition-all duration-1000 delay-100
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
        >
          {/* Header */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary uppercase tracking-wider">
                Industrial IoT Platform
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                  Fire
                </span>
                <span className="text-primary">IIOT</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed font-light">
                Next-generation industrial monitoring platform delivering{" "}
                <span className="text-primary font-medium">
                  real-time telemetry
                </span>
                ,{" "}
                <span className="text-accent font-medium">
                  predictive insights
                </span>
                , and{" "}
                <span className="text-chart-4 font-medium">
                  modular scalability
                </span>{" "}
                across your entire operation.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate(routes.hvac.home)}
                className="group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 px-8 py-6 text-lg font-semibold transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
              >
                <AirVent className="w-5 h-5 mr-2" />
                Enter HVAC Module
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(routes.hvac.dashboard)}
                className="border-border hover:border-primary/50 bg-card/50 hover:bg-card backdrop-blur-sm px-8 py-6 text-lg transition-all group"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Live Systems
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </div>
          </div>

          {/* Real-time Metrics Grid */}
          <div
            className={`
            grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4
            transition-all duration-1000 delay-300
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
          >
            <MetricCard
              icon={Server}
              label="Connected"
              value={metrics.totalDevices}
              suffix="devices"
              variant="primary"
              pulse={connected}
            />

            <MetricCard
              icon={Activity}
              label="Active Plants"
              value={metrics.plants}
              suffix="sites"
              variant="accent"
            />

            <MetricCard
              icon={Zap}
              label="Healthy"
              value={metrics.healthy}
              suffix="units"
              variant="success"
            />

            <MetricCard
              icon={AlertTriangle}
              label="Warnings"
              value={metrics.warnings}
              suffix="active"
              variant="warning"
              alert={metrics.warnings > 0}
            />

            <MetricCard
              icon={AlertTriangle}
              label="Critical"
              value={metrics.activeAlarms}
              suffix="alarms"
              variant="destructive"
              alert={metrics.activeAlarms > 0}
            />

            <MetricCard
              label="Avg Temp"
              value={metrics.avgTemp}
              suffix="°C"
              variant="chart"
              decimal
            />
          </div>

          {/* System Status */}
          <div
            className={`
            transition-all duration-1000 delay-500
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
          >
            <SystemStatus connected={connected} metrics={metrics} />
          </div>

          {/* Modules Grid */}
          <div
            className={`
            space-y-6
            transition-all duration-1000 delay-700
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">
                <span className="text-muted-foreground">Available</span>{" "}
                <span className="text-foreground">Modules</span>
              </h2>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
                v1.0.0
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ModuleCard
                icon={AirVent}
                title="HVAC Control"
                description="Real-time air handling unit monitoring, diagnostics, and predictive maintenance."
                status="ACTIVE"
                metrics={{
                  devices: metrics.totalDevices,
                  uptime: "99.8%",
                }}
                onClick={() => navigate(routes.hvac.home)}
              />

              <ModuleCard
                title="Energy Management"
                description="Power consumption tracking, optimization algorithms, and cost analysis."
                status="COMING SOON"
                eta="Q2 2026"
              />

              <ModuleCard
                title="Process Control"
                description="Industrial automation, PLC integration, and real-time process optimization."
                status="COMING SOON"
                eta="Q3 2026"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono">FireIIOT Platform</span>
              <span>•</span>
              <span>Industrial Monitoring & Telemetry</span>
            </div>
            <div className="font-mono">© 2026 FireIIOT</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
  variant = "primary",
  alert,
  pulse,
  decimal,
}: {
  icon?: any;
  label: string;
  value: number;
  suffix?: string;
  variant?:
    | "primary"
    | "accent"
    | "success"
    | "warning"
    | "destructive"
    | "chart";
  alert?: boolean;
  pulse?: boolean;
  decimal?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
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
  }, [value]);

  const variantClasses = {
    primary: "from-primary/20 to-accent/20 border-primary/30 text-primary",
    accent: "from-accent/20 to-chart-2/20 border-accent/30 text-accent",
    success:
      "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
    warning:
      "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400",
    destructive:
      "from-destructive/20 to-red-600/20 border-destructive/30 text-destructive",
    chart: "from-chart-4/20 to-chart-5/20 border-chart-4/30 text-chart-4",
  };

  const glowClasses = {
    primary: "shadow-primary/50",
    accent: "shadow-accent/50",
    success: "shadow-green-500/50",
    warning: "shadow-yellow-500/50",
    destructive: "shadow-destructive/50",
    chart: "shadow-chart-4/50",
  };

  return (
    <Card
      className={`
      relative overflow-hidden border bg-gradient-to-br backdrop-blur-sm
      transition-all duration-300 hover:scale-105 group
      ${variantClasses[variant]}
      ${alert ? `${glowClasses[variant]} shadow-lg animate-pulse` : ""}
    `}
    >
      {pulse && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
        </div>
      )}

      <CardHeader className="p-4 space-y-2">
        {Icon && (
          <div className="flex items-center justify-between">
            <Icon className="w-4 h-4 opacity-60" />
          </div>
        )}

        <div className="space-y-1">
          <div className="text-3xl md:text-4xl font-black tabular-nums tracking-tight">
            {decimal ? displayValue.toFixed(1) : Math.floor(displayValue)}
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">
              {label}
            </div>
            {suffix && (
              <div className="text-xs font-mono opacity-50">{suffix}</div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Animated border */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 animate-shimmer" />
      </div>
    </Card>
  );
}

function SystemStatus({
  connected,
  metrics,
}: {
  connected: boolean;
  metrics: any;
}) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className={`
                w-3 h-3 rounded-full
                ${connected ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-destructive shadow-lg shadow-destructive/50"}
                animate-pulse
              `}
              />
              <h3 className="text-xl font-bold">
                System Status:{" "}
                <span
                  className={connected ? "text-green-400" : "text-destructive"}
                >
                  {connected ? "ONLINE" : "OFFLINE"}
                </span>
              </h3>
            </div>

            <p className="text-sm text-muted-foreground font-mono">
              {connected
                ? `Monitoring ${metrics.totalDevices} devices across ${metrics.plants} plant${metrics.plants !== 1 ? "s" : ""}`
                : "Attempting to reconnect to telemetry server..."}
            </p>
          </div>

          <div className="flex gap-4">
            <StatusIndicator
              label="Operational"
              value={metrics.healthy}
              total={metrics.totalDevices}
              color="success"
            />
            <StatusIndicator
              label="Warnings"
              value={metrics.warnings}
              total={metrics.totalDevices}
              color="warning"
            />
            <StatusIndicator
              label="Critical"
              value={metrics.activeAlarms}
              total={metrics.totalDevices}
              color="destructive"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusIndicator({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: "success" | "warning" | "destructive";
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colorClasses = {
    success: "text-green-400",
    warning: "text-yellow-400",
    destructive: "text-destructive",
  };

  return (
    <div className="text-center">
      <div
        className={`text-2xl font-black tabular-nums ${colorClasses[color]}`}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground font-mono">{label}</div>
      <div className="text-xs text-muted font-mono">
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  description,
  status,
  metrics,
  eta,
  onClick,
}: {
  icon?: any;
  title: string;
  description: string;
  status: "ACTIVE" | "COMING SOON";
  metrics?: { devices: number; uptime: string };
  eta?: string;
  onClick?: () => void;
}) {
  const isActive = status === "ACTIVE";

  return (
    <Card
      onClick={isActive ? onClick : undefined}
      className={`
        group relative overflow-hidden border transition-all duration-300
        ${
          isActive
            ? "border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 cursor-pointer hover:scale-[1.02]"
            : "border-border bg-card/50 opacity-60"
        }
      `}
    >
      {/* Hover Gradient Effect */}
      {isActive && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-accent/5" />
      )}

      <CardHeader className="relative z-10 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={`
                p-3 rounded-lg
                ${isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}
              `}
              >
                <Icon className="w-6 h-6" />
              </div>
            )}
            <div>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              {eta && (
                <Badge
                  variant="outline"
                  className="mt-1 border-border text-muted-foreground font-mono text-xs"
                >
                  ETA: {eta}
                </Badge>
              )}
            </div>
          </div>

          <Badge
            variant={isActive ? "default" : "secondary"}
            className={
              isActive
                ? "bg-primary/20 text-primary border-primary/30 font-mono font-bold"
                : "bg-muted text-muted-foreground font-mono"
            }
          >
            {status}
          </Badge>
        </div>

        <CardDescription className="text-muted-foreground leading-relaxed">
          {description}
        </CardDescription>

        {metrics && (
          <div className="flex gap-4 pt-2 border-t border-border">
            <div>
              <div className="text-2xl font-bold text-primary tabular-nums">
                {metrics.devices}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Devices
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400 tabular-nums">
                {metrics.uptime}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Uptime
              </div>
            </div>
          </div>
        )}

        {isActive && (
          <div className="flex items-center gap-2 text-sm text-primary font-medium pt-2">
            <span>Enter Module</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
