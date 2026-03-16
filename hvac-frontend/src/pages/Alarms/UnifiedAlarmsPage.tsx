/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { getDeviceHealth, type DeviceHealthThresholds } from "@/domain/device/getDeviceHealth";
import { useTranslation } from "@/i18n/useTranslation";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import { useAcks } from "@/context/AckContext";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { renderMetricCard } from "@/components/MetricCards/renderMetricCard";
import type { MetricColor, MetricQuality } from "@/components/MetricCards/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  AlertTriangle,
  Search,
  Clock,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";

type FilterType = "ALL" | "ALARM" | "WARNING" | "ACKNOWLEDGED";

/** Unified alarm item — works for both HVAC and generic machines */
interface AlarmItem {
  machineType: string;
  machineTypeName: string;
  plantId: string;
  instanceId: string;
  status: "ALARM" | "WARNING";
  badPoints: number;
  timestamp: string;
  /** Raw points for detail modal */
  points: Record<string, { value: unknown; quality?: string; unit?: string }>;
  isConnected: boolean;
}

export default function UnifiedAlarmsPage() {
  const { allMachineTelemetry, machineConnectionStatus } = useMachineTelemetry();
  const { machineTypes } = useMachineTypes();
  const { t, tf } = useTranslation();
  const { settings } = useGlobalSettings();
  const { acks, addAck, isAcknowledged } = useAcks();

  const [selectedItem, setSelectedItem] = useState<AlarmItem | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [machineTypeFilter, setMachineTypeFilter] = useState<string>("all");

  const operatorName = settings.operatorName || "Operator";

  const ut = (t as any).unifiedAlarms as Record<string, string> ?? {};

  // Build thresholds map per machine type from cardConfig
  const thresholdsMap = useMemo(() => {
    const map: Record<string, DeviceHealthThresholds> = {};
    for (const mt of machineTypes) {
      const th: DeviceHealthThresholds = {};
      for (const v of mt.variables) {
        const config = v.cardConfig as Record<string, unknown> | null;
        if (!config) continue;
        const warning = typeof config.warning === "number" ? config.warning : undefined;
        const alarm = typeof config.alarm === "number" ? config.alarm : undefined;
        if (warning != null || alarm != null) {
          th[v.key] = { warning, alarm };
        }
      }
      map[mt.slug] = th;
    }
    return map;
  }, [machineTypes]);

  /* -------------------------------- */
  /* Build unified alarm items        */
  /* -------------------------------- */
  const allAlarmItems = useMemo<AlarmItem[]>(() => {
    const items: AlarmItem[] = [];

    // Machine types
    for (const [slug, instances] of Object.entries(allMachineTelemetry)) {
      const mt = machineTypes.find((m) => m.slug === slug);
      if (!mt) continue;

      instances.forEach((instance) => {
        const deviceKey = `${instance.plantId}-${instance.stationId}`;
        const connected = machineConnectionStatus[deviceKey]?.isConnected ?? false;
        if (!connected) return;

        // Evaluate health using getDeviceHealth with per-type thresholds
        const pointsForHealth: Record<string, { value: unknown; quality?: string; unit?: string }> = {};
        for (const [pKey, pVal] of Object.entries(instance.points)) {
          pointsForHealth[pKey] = {
            value: pVal.value,
            quality: pVal.quality,
            unit: pVal.unit,
          };
        }

        const health = getDeviceHealth(pointsForHealth, {
          isConnected: connected,
          thresholds: thresholdsMap[slug],
        });
        if (health.status !== "ALARM" && health.status !== "WARNING") return;

        items.push({
          machineType: slug,
          machineTypeName: mt.name,
          plantId: instance.plantId,
          instanceId: instance.stationId,
          status: health.status as "ALARM" | "WARNING",
          badPoints: health.badPoints,
          timestamp: instance.timestamp,
          points: pointsForHealth,
          isConnected: connected,
        });
      });
    }

    return items;
  }, [allMachineTelemetry, machineConnectionStatus, machineTypes, thresholdsMap]);

  /* -------------------------------- */
  /* Counters                         */
  /* -------------------------------- */
  const activeAlarms = useMemo(
    () => allAlarmItems.filter((i) => i.status === "ALARM" && !isAcknowledged(i.plantId, i.instanceId, i.status, i.machineType)).length,
    [allAlarmItems, acks],
  );
  const activeWarnings = useMemo(
    () => allAlarmItems.filter((i) => i.status === "WARNING" && !isAcknowledged(i.plantId, i.instanceId, i.status, i.machineType)).length,
    [allAlarmItems, acks],
  );
  const acknowledgedCount = useMemo(
    () => allAlarmItems.filter((i) => !!isAcknowledged(i.plantId, i.instanceId, i.status, i.machineType)).length,
    [allAlarmItems, acks],
  );

  /* -------------------------------- */
  /* Filtering                        */
  /* -------------------------------- */
  const displayedItems = useMemo(() => {
    return allAlarmItems.filter((item) => {
      // Machine type filter
      if (machineTypeFilter !== "all" && item.machineType !== machineTypeFilter) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !item.instanceId.toLowerCase().includes(q) &&
          !item.plantId.toLowerCase().includes(q) &&
          !item.machineTypeName.toLowerCase().includes(q)
        )
          return false;
      }

      const isAcked = !!isAcknowledged(item.plantId, item.instanceId, item.status, item.machineType);

      if (filterType === "ACKNOWLEDGED") return isAcked;
      if (isAcked) return false; // Don't show acked in active tabs

      if (filterType === "ALL") return true;
      return item.status === filterType;
    });
  }, [allAlarmItems, filterType, searchQuery, machineTypeFilter, acks]);

  /* -------------------------------- */
  /* Unique machine types for filter  */
  /* -------------------------------- */
  const availableMachineTypes = useMemo(() => {
    const types = new Set<string>();
    allAlarmItems.forEach((i) => types.add(i.machineType));
    return Array.from(types).map((slug) => ({
      slug,
      name: machineTypes.find((m) => m.slug === slug)?.name ?? slug,
    }));
  }, [allAlarmItems, machineTypes]);

  /* -------------------------------- */
  /* Handlers                         */
  /* -------------------------------- */
  function handleAcknowledge(item: AlarmItem) {
    addAck(item.plantId, item.instanceId, item.status, operatorName, item.machineType);
    toast.success(tf(t.alarmsPage.ackToast, { name: operatorName }));
  }

  /* -------------------------------- */
  /* Get variables for machine type   */
  /* -------------------------------- */
  function getVariablesForType(machineType: string) {
    const mt = machineTypes.find((m) => m.slug === machineType);
    return [...(mt?.variables ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /* -------------------------------- */
  /* Total devices for percentage     */
  /* -------------------------------- */
  const totalDevices = useMemo(() => {
    let count = 0;
    for (const instances of Object.values(allMachineTelemetry)) {
      count += instances.length;
    }
    return count;
  }, [allMachineTelemetry]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">
          {ut.title ?? "Unified Alarm System"}
        </h1>
        <p className="text-muted-foreground">
          {ut.subtitle ?? "Real-time monitoring of all devices with alarms and warnings"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Alarms */}
        <Card
          className={`
            group relative overflow-hidden backdrop-blur-sm
            transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
            border-destructive/50 bg-destructive/5
            ${activeAlarms > 0 ? "shadow-lg shadow-destructive/20 animate-pulse" : ""}
          `}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-red-500 to-red-600" />
          <CardContent className="relative z-10 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30">
                  <Bell className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    {t.alarmsPage.criticalAlarms}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.alarmsPage.requiresImmediate}
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex items-baseline px-4 py-2 rounded-lg bg-destructive/5">
              <span className="text-4xl font-black tabular-nums text-destructive">
                {activeAlarms}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t.alarmsPage.criticality}</span>
                <span className="font-bold">
                  {totalDevices > 0 ? ((activeAlarms / totalDevices) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive transition-all duration-1000"
                  style={{
                    width: `${Math.min(totalDevices > 0 ? (activeAlarms / totalDevices) * 100 : 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
          <div className="absolute top-4 right-4">
            <div className={`w-2 h-2 rounded-full bg-destructive ${activeAlarms > 0 ? "animate-ping" : ""}`} />
          </div>
        </Card>

        {/* Active Warnings */}
        <Card
          className={`
            group relative overflow-hidden backdrop-blur-sm
            transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
            border-yellow-500/50 bg-yellow-500/5
            ${activeWarnings > 0 ? "shadow-md shadow-yellow-500/10" : ""}
          `}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-yellow-500 to-orange-500" />
          <CardContent className="relative z-10 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    {t.alarmsPage.warnings}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.alarmsPage.preventiveMonitoring}
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex items-baseline px-4 py-2 rounded-lg bg-yellow-500/5">
              <span className="text-4xl font-black tabular-nums text-yellow-500">
                {activeWarnings}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t.alarmsPage.impact}</span>
                <span className="font-bold">
                  {totalDevices > 0 ? ((activeWarnings / totalDevices) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-1000"
                  style={{
                    width: `${Math.min(totalDevices > 0 ? (activeWarnings / totalDevices) * 100 : 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
          <div className="absolute top-4 right-4">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Tabs
              value={filterType}
              onValueChange={(v) => setFilterType(v as FilterType)}
            >
              <TabsList>
                <TabsTrigger value="ALL" className="gap-2">
                  {t.alarmsPage.all}
                  <Badge variant="outline" className="ml-1">
                    {activeAlarms + activeWarnings}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="ALARM" className="gap-2">
                  <Bell className="w-3 h-3" />
                  {t.alarmsPage.alarms}
                  <Badge variant="destructive" className="ml-1">
                    {activeAlarms}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="WARNING" className="gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  {t.alarmsPage.warningsLabel}
                  <Badge variant="secondary" className="ml-1">
                    {activeWarnings}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="ACKNOWLEDGED" className="gap-2">
                  <CheckCheck className="w-3 h-3" />
                  {t.alarmsPage.acknowledged}
                  <Badge variant="outline" className="ml-1">
                    {acknowledgedCount}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2 w-full md:w-auto">
              {/* Machine type filter */}
              <Select value={machineTypeFilter} onValueChange={setMachineTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={ut.filterByType ?? "All Types"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ut.allTypes ?? "All Types"}</SelectItem>
                  {availableMachineTypes.map((mt) => (
                    <SelectItem key={mt.slug} value={mt.slug}>
                      {mt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={ut.searchPlaceholder ?? "Search device or plant..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alarm Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedItems.map((item) => {
          const timeSince = getTimeSince(item.timestamp, t, tf);
          const ackRecord =
            filterType === "ACKNOWLEDGED"
              ? isAcknowledged(item.plantId, item.instanceId, item.status, item.machineType)
              : undefined;

          const config =
            item.status === "ALARM"
              ? {
                  border: "border-destructive/50",
                  bg: "bg-destructive/5",
                  glow: "shadow-lg shadow-destructive/20",
                  badge: "destructive" as const,
                  iconColor: "text-destructive",
                  pulse: filterType !== "ACKNOWLEDGED",
                }
              : {
                  border: "border-yellow-500/50",
                  bg: "bg-yellow-500/5",
                  glow: "shadow-md shadow-yellow-500/10",
                  badge: "secondary" as const,
                  iconColor: "text-yellow-500",
                  pulse: false,
                };

          return (
            <Card
              key={`${item.machineType}-${item.plantId}-${item.instanceId}`}
              onClick={() => setSelectedItem(item)}
              className={`
                group relative overflow-hidden
                cursor-pointer backdrop-blur-sm
                transition-all duration-300
                hover:scale-[1.02] hover:shadow-xl
                ${config.border} ${config.bg} ${config.glow}
                ${config.pulse ? "animate-pulse" : ""}
              `}
            >
              <div
                className={`absolute top-0 inset-x-0 h-1 ${
                  item.status === "ALARM"
                    ? "bg-linear-to-r from-red-500 to-red-600"
                    : "bg-linear-to-r from-yellow-500 to-orange-500"
                }`}
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />

              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg tracking-tight">
                      {item.instanceId}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.plantId}
                      </p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {item.machineTypeName}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={config.badge}
                      className={`font-mono text-xs ${config.pulse ? "animate-pulse" : ""}`}
                    >
                      {item.status}
                    </Badge>
                    {item.badPoints > 0 && (
                      <span className="text-xs text-destructive font-medium">
                        {item.badPoints} {item.badPoints === 1 ? t.common.errorSingular : t.common.errorPlural}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 space-y-3">
                {/* Show top 2 variables */}
                {(() => {
                  const vars = getVariablesForType(item.machineType);
                  if (!vars || vars.length === 0) return null;
                  const topVars = vars.slice(0, 2);
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      {topVars.map((v) => {
                        const point = item.points[v.key];
                        return (
                          <div key={v.key} className="space-y-1">
                            <span className="text-xs text-muted-foreground">{v.label}</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black tabular-nums">
                                {formatPointValue(point?.value)}
                              </span>
                              {v.unit && (
                                <span className="text-xs text-muted-foreground">{v.unit}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {t.alarmsPage.updated} {timeSince}
                  </span>
                </div>

                {/* Ack stamp or Ack button */}
                {ackRecord ? (
                  <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
                    <CheckCheck className="w-3 h-3 text-green-500 shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {tf(t.alarmsPage.ackStamp, {
                        name: ackRecord.acknowledgedBy,
                        time: new Date(ackRecord.acknowledgedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      })}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="text-xs text-muted-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.alarmsPage.clickDetails}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(item);
                      }}
                    >
                      <CheckCheck className="w-3 h-3" />
                      {t.alarmsPage.ackButton}
                    </Button>
                  </div>
                )}
              </CardContent>

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
        })}

        {displayedItems.length === 0 && (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                {filterType === "ACKNOWLEDGED" ? (
                  <>
                    <CheckCheck className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t.alarmsPage.noAcknowledged}
                    </h3>
                  </>
                ) : (
                  <>
                    <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t.alarmsPage.noActiveAlarms}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {searchQuery
                        ? (ut.noDevicesFound ?? "No devices match your search")
                        : t.alarmsPage.allSystemsNormal}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {selectedItem?.instanceId}
                  </div>
                  <div className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                    {t.alarmsPage.detailedAnalysis}
                    <Badge variant="outline" className="text-xs">
                      {selectedItem?.machineTypeName}
                    </Badge>
                  </div>
                </div>
              </div>
              {selectedItem && (
                <Badge
                  variant={selectedItem.status === "ALARM" ? "destructive" : "secondary"}
                  className="text-base px-3 py-1"
                >
                  {selectedItem.status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              <Card className="border-muted bg-muted/20">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t.alarmsPage.plant}
                      </span>
                      <div className="font-bold">{selectedItem.plantId}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {ut.machineType ?? "Machine Type"}
                      </span>
                      <div className="font-bold">{selectedItem.machineTypeName}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t.alarmsPage.errorPoints}
                      </span>
                      <div className="font-bold text-destructive">
                        {selectedItem.badPoints}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t.alarmsPage.lastUpdate}
                      </span>
                      <div className="font-bold">
                        {new Date(selectedItem.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metric cards for the device */}
              <DetailMetrics item={selectedItem} machineTypes={machineTypes} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===== Detail Metrics Component ===== */

function DetailMetrics({
  item,
  machineTypes,
}: {
  item: AlarmItem;
  machineTypes: import("@/types/machine-type").MachineType[];
}) {
  // Use renderMetricCard with variables from MachineType
  const mt = machineTypes.find((m) => m.slug === item.machineType);
  if (!mt) return null;

  const sortedVars = [...mt.variables].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedVars.map((v) => {
        const point = item.points[v.key];
        if (!point) return null;

        return (
          <div key={v.key}>
            {renderMetricCard({
              cardType: v.cardType,
              label: v.label,
              value: point.value,
              unit: v.unit ?? point.unit ?? "",
              quality: point.quality as MetricQuality | undefined,
              color: (v.color || "primary") as MetricColor,
              cardConfig: v.cardConfig,
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ===== Helpers ===== */

function formatPointValue(value: unknown): string {
  if (value == null) return "--";
  if (typeof value === "number") return isNaN(value) ? "--" : value.toFixed(1);
  if (typeof value === "boolean") return value ? "ON" : "OFF";
  return String(value);
}

function getTimeSince(
  timestamp: string,
  t: any,
  tf: (text: string, values: Record<string, string | number>) => string,
): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return tf(t.activity.secondsAgo, { seconds: diffSeconds });
  if (diffSeconds < 3600) return tf(t.activity.minutesAgoShort, { minutes: Math.floor(diffSeconds / 60) });
  if (diffSeconds < 86400) return tf(t.activity.hoursAgoShort, { hours: Math.floor(diffSeconds / 3600) });
  return tf(t.activity.daysAgoShort, { days: Math.floor(diffSeconds / 86400) });
}
