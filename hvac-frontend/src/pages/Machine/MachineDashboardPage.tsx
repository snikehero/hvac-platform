import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import {
  Cpu,
  Wifi,
  WifiOff,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LayoutGrid,
  List,
  Maximize2,
} from "lucide-react";
import { STATUS_DOT } from "@/constants/status";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { useDeviceHealth } from "@/hooks/useDeviceHealth";
import { routes } from "@/router/routes";
import { useTranslation } from "@/i18n/useTranslation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstanceCardCompact } from "./components/InstanceCardCompact";
import { InstanceCardExpanded } from "./components/InstanceCardExpanded";
import { InstanceDrawer } from "@/components/InstanceDrawer";


type FilterStatus = "ALL" | "OK" | "WARNING" | "ALARM";
type ViewMode = "grid" | "compact" | "expanded";

function loadViewMode(): ViewMode {
  try {
    const v = localStorage.getItem("dashboard-view-mode");
    if (v === "compact" || v === "expanded") return v;
  } catch {}
  return "grid";
}

export default function MachineDashboardPage() {
  const { machineType: machineTypeSlug } = useParams<{
    machineType: string;
  }>();
  const navigate = useNavigate();
  const { machineTypes } = useMachineTypes();
  const { instances, connected, isMachineConnected, getInstanceHistory, deviceEvents } =
    useMachineTelemetry(machineTypeSlug);
  const getHealth = useDeviceHealth(machineTypeSlug);
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);
  const [drawerKey, setDrawerKey] = useState<{ plantId: string; stationId: string } | null>(null);

  // Derive live drawer instance from current telemetry so it always reflects latest data
  const drawerInstance = useMemo(
    () => drawerKey ? instances.find(i => i.plantId === drawerKey.plantId && i.stationId === drawerKey.stationId) ?? null : null,
    [drawerKey, instances],
  );

  const changeViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    try { localStorage.setItem("dashboard-view-mode", mode); } catch {}
  }, []);

  const machineType = useMemo(
    () => machineTypes.find((mt) => mt.slug === machineTypeSlug),
    [machineTypes, machineTypeSlug],
  );

  // Compute stats
  const stats = useMemo(() => {
    let ok = 0;
    let warning = 0;
    let alarm = 0;

    for (const inst of instances) {
      const isConn = isMachineConnected(
        `${inst.plantId}-${inst.stationId}`,
      );
      const h = getHealth(inst.points, isConn);
      if (h.status === "OK") ok++;
      else if (h.status === "WARNING") warning++;
      else if (h.status === "ALARM") alarm++;
    }

    return { ok, warning, alarm, total: instances.length };
  }, [instances, getHealth, isMachineConnected]);

  // Filter instances
  const filteredInstances = useMemo(() => {
    if (filter === "ALL") return instances;
    return instances.filter((inst) => {
      const isConn = isMachineConnected(
        `${inst.plantId}-${inst.stationId}`,
      );
      const h = getHealth(inst.points, isConn);
      return h.status === filter;
    });
  }, [instances, filter, getHealth, isMachineConnected]);

  // Group by plant
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filteredInstances>();
    for (const inst of filteredInstances) {
      const key = inst.plantId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inst);
    }
    return map;
  }, [filteredInstances]);

  const sortedVariables = useMemo(
    () =>
      machineType
        ? [...(machineType.variables ?? [])]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .slice(0, 3)
        : [],
    [machineType],
  );

  if (!machineType) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {t.machinePages?.machineTypeNotFound ?? "Machine type not found"}
        </p>
      </div>
    );
  }

  // Connected but no data yet — show skeleton while waiting for first snapshot
  if (instances.length === 0 && connected) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {machineType.name}{" "}
              {t.machineDashboard?.dashboard ?? "Dashboard"}
            </h1>
            {machineType.description && (
              <p className="text-sm text-muted-foreground">
                {machineType.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connected && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-mono text-primary uppercase tracking-wider">
                {t.machinePages?.liveMonitoring ?? "Live"}
              </span>
            </div>
          )}
          <Badge
            variant="outline"
            className={`gap-1 ${
              connected
                ? "text-green-500 border-green-500/30"
                : "text-destructive border-destructive/30"
            }`}
          >
            {connected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {connected
              ? t.machineDashboard?.connected ?? "Connected"
              : t.machineDashboard?.disconnected ?? "Disconnected"}
          </Badge>
        </div>
      </div>

      {/* Stat Badges / Filters + View Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-2">
          <StatBadge
            label={t.machinePages?.total ?? "Total"}
            count={stats.total}
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
            icon={<Activity className="w-3.5 h-3.5" />}
            className="border-primary/30 text-primary"
          />
          <StatBadge
            label={t.machinePages?.ok ?? "OK"}
            count={stats.ok}
            active={filter === "OK"}
            onClick={() => setFilter(filter === "OK" ? "ALL" : "OK")}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            className="border-green-500/30 text-green-500"
          />
          <StatBadge
            label={t.machinePages?.warning ?? "Warning"}
            count={stats.warning}
            active={filter === "WARNING"}
            onClick={() =>
              setFilter(filter === "WARNING" ? "ALL" : "WARNING")
            }
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            className="border-yellow-500/30 text-yellow-500"
          />
          <StatBadge
            label={t.machinePages?.alarm ?? "Alarm"}
            count={stats.alarm}
            active={filter === "ALARM"}
            onClick={() => setFilter(filter === "ALARM" ? "ALL" : "ALARM")}
            icon={<XCircle className="w-3.5 h-3.5" />}
            className="border-destructive/30 text-destructive"
          />
        </div>

        {/* View mode toggle */}
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(
            [
              { mode: "grid" as ViewMode, icon: <LayoutGrid className="h-3.5 w-3.5" />, title: "Grid" },
              { mode: "compact" as ViewMode, icon: <List className="h-3.5 w-3.5" />, title: "Compact" },
              { mode: "expanded" as ViewMode, icon: <Maximize2 className="h-3.5 w-3.5" />, title: "Expanded" },
            ] as const
          ).map(({ mode, icon, title }) => (
            <button
              key={mode}
              title={title}
              onClick={() => changeViewMode(mode)}
              className={`px-2.5 py-1.5 transition-colors ${
                viewMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {instances.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {t.machineDashboard?.noInstances ??
                `No ${machineType.name} instances connected`}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              {t.machineDashboard?.noInstancesDesc ??
                `Waiting for MQTT messages on topic "${machineType.mqttTopic}". Make sure your devices are sending data.`}
            </p>
          </CardContent>
        </Card>
      ) : filteredInstances.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {t.machinePages?.noInstancesMatch ?? "No instances match the selected filter."}
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setFilter("ALL")}
            >
              {t.machinePages?.showAll ?? "Show all"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([plantId, plantInstances]) => {
            const plantStats = getPlantStats(
              plantInstances,
              getHealth,
              isMachineConnected,
            );
            return (
              <div key={plantId} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-muted-foreground">
                    {t.machinePages?.plant ?? "Plant"}: {plantId}
                  </h2>
                  <div className="flex gap-1.5">
                    {plantStats.alarm > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {plantStats.alarm} {plantStats.alarm > 1 ? (t.machinePages?.alarmPlural ?? "alarms") : (t.machinePages?.alarmSingular ?? "alarm")}
                      </Badge>
                    )}
                    {plantStats.warning > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {plantStats.warning} {plantStats.warning > 1 ? (t.machinePages?.warningPlural ?? "warnings") : (t.machinePages?.warningSingular ?? "warning")}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Compact: dense table */}
                {viewMode === "compact" ? (
                  <div className="rounded-md border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="py-2 pl-3 pr-2 w-8" />
                          <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Station</th>
                          <th className="py-2 pr-4 text-left font-medium text-muted-foreground hidden sm:table-cell">Plant</th>
                          {sortedVariables.map((v) => (
                            <th key={v.key} className="py-2 pr-4 text-left font-medium text-muted-foreground">{v.label}</th>
                          ))}
                          <th className="py-2 pr-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Updated</th>
                          <th className="w-6" />
                        </tr>
                      </thead>
                      <tbody>
                        {plantInstances.map((inst) => {
                          const isConn = connected && isMachineConnected(`${inst.plantId}-${inst.stationId}`);
                          const health = getHealth(inst.points, isConn);
                          return (
                            <InstanceCardCompact
                              key={`${inst.plantId}-${inst.stationId}`}
                              instance={inst}
                              health={health}
                              isConnected={isConn}
                              sortedVariables={sortedVariables}
                              onClick={() => setDrawerKey({ plantId: inst.plantId, stationId: inst.stationId })}
                            />
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : viewMode === "expanded" ? (
                  /* Expanded: full-width cards with sparklines */
                  <div className="space-y-3">
                    {plantInstances.map((inst) => {
                      const isConn = connected && isMachineConnected(`${inst.plantId}-${inst.stationId}`);
                      const health = getHealth(inst.points, isConn);
                      const allVariables = machineType?.variables
                        ? [...machineType.variables].sort((a, b) => a.displayOrder - b.displayOrder)
                        : sortedVariables;
                      const historyData = getInstanceHistory(machineTypeSlug!, inst.plantId, inst.stationId);
                      return (
                        <InstanceCardExpanded
                          key={`${inst.plantId}-${inst.stationId}`}
                          instance={inst}
                          health={health}
                          isConnected={isConn}
                          sortedVariables={allVariables}
                          historyData={historyData}
                          onClick={() => setDrawerKey({ plantId: inst.plantId, stationId: inst.stationId })}
                        />
                      );
                    })}
                  </div>
                ) : (
                  /* Grid: default 4-col cards */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {plantInstances.map((inst) => {
                      const isConn =
                        connected &&
                        isMachineConnected(
                          `${inst.plantId}-${inst.stationId}`,
                        );
                      const health = getHealth(inst.points, isConn);
                      const dotColor = getDotColor(health.status);

                      return (
                        <Card
                          key={`${inst.plantId}-${inst.stationId}`}
                          className="hover:shadow-md transition-shadow cursor-pointer group transition-status"
                          onClick={() => setDrawerKey({ plantId: inst.plantId, stationId: inst.stationId })}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base flex items-center gap-2">
                                <span className={`relative flex h-2.5 w-2.5`}>
                                  {health.status === "ALARM" && (
                                    <span
                                      className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}
                                    />
                                  )}
                                  <span
                                    className={`relative inline-flex rounded-full h-2.5 w-2.5 transition-status ${dotColor}`}
                                  />
                                </span>
                                {inst.stationId}
                              </CardTitle>
                              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <CardDescription className="text-xs font-mono">
                              {inst.plantId}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {sortedVariables.map((varDef) => {
                              const point = inst.points[varDef.key];
                              return (
                                <div
                                  key={varDef.key}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {varDef.label}
                                  </span>
                                  <span className="font-semibold tabular-nums">
                                    {isConn && point
                                      ? typeof point.value === "boolean"
                                        ? point.value
                                          ? (t.machinePages?.on ?? "ON")
                                          : (t.machinePages?.off ?? "OFF")
                                        : String(point.value)
                                      : "--"}
                                    {point?.unit && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        {point.unit}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                            <div className="pt-2 border-t border-border">
                              <span className="text-xs text-muted-foreground">
                                {new Date(inst.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Instance quick-detail drawer */}
      {drawerInstance && (() => {
        const isConn = connected && isMachineConnected(`${drawerInstance.plantId}-${drawerInstance.stationId}`);
        const health = getHealth(drawerInstance.points, isConn);
        const allVars = machineType
          ? [...machineType.variables].sort((a, b) => a.displayOrder - b.displayOrder)
          : sortedVariables;
        const historyData = getInstanceHistory(machineTypeSlug!, drawerInstance.plantId, drawerInstance.stationId);
        const instanceKey = `${drawerInstance.plantId}-${drawerInstance.stationId}`;
        const recentEvents = deviceEvents
          .filter((e) => e.instanceId === instanceKey)
          .slice(-5)
          .reverse();
        return (
          <InstanceDrawer
            open
            onClose={() => setDrawerKey(null)}
            onNavigate={() => {
              setDrawerKey(null);
              navigate(routes.machine.detail(machineTypeSlug!, drawerInstance.plantId, drawerInstance.stationId));
            }}
            instance={drawerInstance}
            health={health}
            isConnected={isConn}
            displayVariables={allVars}
            historyData={historyData}
            recentEvents={recentEvents}
          />
        );
      })()}
    </div>
  );
}

/* ================= HELPERS ================= */

function StatBadge({
  label,
  count,
  active,
  onClick,
  icon,
  className,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium
        transition-all cursor-pointer
        ${className}
        ${active ? "bg-foreground/10 shadow-sm" : "bg-transparent opacity-70 hover:opacity-100"}
      `}
    >
      {icon}
      {label}: {count}
    </button>
  );
}

function getDotColor(
  status: "OK" | "WARNING" | "ALARM" | "DISCONNECTED",
): string {
  return STATUS_DOT[status] ?? STATUS_DOT.DISCONNECTED;
}

function getPlantStats(
  instances: { plantId: string; stationId: string; points: Record<string, { value: unknown; quality?: string; unit?: string }> }[],
  getHealth: (points: Record<string, { value: unknown; quality?: string; unit?: string }>, isConnected?: boolean) => { status: string },
  isMachineConnected: (key: string) => boolean,
) {
  let ok = 0;
  let warning = 0;
  let alarm = 0;
  for (const inst of instances) {
    const isConn = isMachineConnected(`${inst.plantId}-${inst.stationId}`);
    const h = getHealth(inst.points, isConn);
    if (h.status === "OK") ok++;
    else if (h.status === "WARNING") warning++;
    else if (h.status === "ALARM") alarm++;
  }
  return { ok, warning, alarm };
}
