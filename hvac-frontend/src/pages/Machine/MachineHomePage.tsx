import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Gauge,
  Heart,
  LayoutDashboard,
  Bell,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { useDeviceHealth } from "@/hooks/useDeviceHealth";
import { routes } from "@/router/routes";
import { useTranslation } from "@/i18n/useTranslation";

type SystemHealth = "CRITICAL" | "DEGRADED" | "HEALTHY" | "NO_DATA";

export default function MachineHomePage() {
  const { machineType: slug } = useParams<{ machineType: string }>();
  const navigate = useNavigate();
  const { machineTypes } = useMachineTypes();
  const {
    instances,
    connected,
    isMachineConnected,
    deviceActiveCounts,
  } = useMachineTelemetry(slug);
  const getHealth = useDeviceHealth(slug);
  const { t } = useTranslation();

  const machineType = useMemo(
    () => machineTypes.find((mt) => mt.slug === slug),
    [machineTypes, slug],
  );

  // Compute per-instance health
  const healthResults = useMemo(() => {
    return instances.map((inst) => {
      const key = `${inst.plantId}-${inst.stationId}`;
      const isConn = isMachineConnected(key);
      return { inst, health: getHealth(inst.points, isConn), isConn };
    });
  }, [instances, getHealth, isMachineConnected]);

  const stats = useMemo(() => {
    let ok = 0;
    let warning = 0;
    let alarm = 0;
    let disconnected = 0;
    let connectedCount = 0;

    for (const { health, isConn } of healthResults) {
      if (!isConn) {
        disconnected++;
        continue;
      }
      connectedCount++;
      if (health.status === "OK") ok++;
      else if (health.status === "WARNING") warning++;
      else if (health.status === "ALARM") alarm++;
    }

    return { ok, warning, alarm, disconnected, connectedCount, total: instances.length };
  }, [healthResults, instances.length]);

  const systemHealth = useMemo<SystemHealth>(() => {
    if (instances.length === 0) return "NO_DATA";
    if (stats.alarm > 0) return "CRITICAL";
    if (stats.warning > 0 || stats.disconnected > 0) return "DEGRADED";
    return "HEALTHY";
  }, [instances.length, stats]);

  // Type alarm counts
  const typeAlarmCount = useMemo(() => {
    let alarms = 0;
    let warnings = 0;
    for (const [key, counts] of Object.entries(deviceActiveCounts)) {
      if (key.startsWith(`${slug}-`)) {
        alarms += counts.alarms;
        warnings += counts.warnings;
      }
    }
    return { alarms, warnings };
  }, [deviceActiveCounts, slug]);

  // Average of first numeric tracked variable
  const avgMetric = useMemo(() => {
    if (!machineType || instances.length === 0) return null;
    const firstNumVar = machineType.variables.find(
      (v) => v.dataType === "number",
    );
    if (!firstNumVar) return null;

    let sum = 0;
    let count = 0;
    for (const inst of instances) {
      const val = inst.points[firstNumVar.key]?.value;
      if (typeof val === "number") {
        sum += val;
        count++;
      }
    }
    if (count === 0) return null;
    return {
      label: firstNumVar.label,
      value: sum / count,
      unit: firstNumVar.unit ?? "",
    };
  }, [machineType, instances]);

  if (!machineType) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Machine type not found.</p>
      </div>
    );
  }

  const healthConfig: Record<SystemHealth, { color: string; bg: string; border: string; label: string }> = {
    CRITICAL: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Critical" },
    DEGRADED: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "Degraded" },
    HEALTHY: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30", label: "Healthy" },
    NO_DATA: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-muted/30", label: "No Data" },
  };

  const hc = healthConfig[systemHealth];

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1200px] mx-auto">
      {/* Hero Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Cpu className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              {machineType.name}
            </h1>
            {machineType.description && (
              <p className="text-muted-foreground">
                {machineType.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`gap-1.5 ${
            connected
              ? "text-green-500 border-green-500/30"
              : "text-destructive border-destructive/30"
          }`}
        >
          {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {connected ? "Server Online" : "Server Offline"}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Health */}
        <Card className={`${hc.border} ${hc.bg} border`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="w-4 h-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-black ${hc.color}`}>{hc.label}</p>
          </CardContent>
        </Card>

        {/* Average Metric */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              {avgMetric ? `Avg ${avgMetric.label}` : "Avg Metric"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black tabular-nums text-primary">
              {avgMetric ? `${avgMetric.value.toFixed(1)} ${avgMetric.unit}` : "--"}
            </p>
          </CardContent>
        </Card>

        {/* Connected */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black tabular-nums text-primary">
              {stats.connectedCount}
              <span className="text-base font-normal text-muted-foreground">
                {" "}/ {stats.total}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card
          className={`border ${
            typeAlarmCount.alarms > 0
              ? "border-destructive/30 bg-destructive/5"
              : typeAlarmCount.warnings > 0
                ? "border-yellow-500/30 bg-yellow-500/5"
                : "border-border bg-card/50"
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black tabular-nums text-destructive">
                {typeAlarmCount.alarms}
              </p>
              {typeAlarmCount.warnings > 0 && (
                <p className="text-lg font-bold tabular-nums text-yellow-500">
                  +{typeAlarmCount.warnings}w
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatusBox label="Operational" count={stats.ok} color="text-green-500" bg="bg-green-500/10" />
            <StatusBox label="Warnings" count={stats.warning} color="text-yellow-500" bg="bg-yellow-500/10" />
            <StatusBox label="Critical" count={stats.alarm} color="text-destructive" bg="bg-destructive/10" />
            <StatusBox label="Offline" count={stats.disconnected} color="text-muted-foreground" bg="bg-muted/10" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickActionCard
          title={t.machineDashboard?.dashboard ?? "Dashboard"}
          description="View all instances and their status"
          icon={LayoutDashboard}
          onClick={() => navigate(routes.machine.dashboard(slug!))}
        />
        <QuickActionCard
          title={t.nav?.alarms ?? "Alarms"}
          description="View active alarms and warnings"
          icon={Bell}
          onClick={() => navigate(routes.machine.alarms(slug!))}
          badge={typeAlarmCount.alarms > 0 ? typeAlarmCount.alarms : undefined}
        />
        <QuickActionCard
          title={t.nav?.settings ?? "Settings"}
          description="Configure thresholds and notifications"
          icon={Settings}
          onClick={() => navigate(routes.machine.settings(slug!))}
        />
      </div>
    </div>
  );
}

function StatusBox({
  label,
  count,
  color,
  bg,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-lg p-4 ${bg} text-center`}>
      <p className={`text-2xl font-black tabular-nums ${color}`}>{count}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  badge,
}: {
  title: string;
  description: string;
  icon: typeof Cpu;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{title}</p>
            {badge !== undefined && (
              <Badge variant="destructive" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardContent>
    </Card>
  );
}
