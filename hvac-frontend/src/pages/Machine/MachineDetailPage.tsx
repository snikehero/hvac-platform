import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Cpu,
  Clock,
  Activity,
  AlertTriangle,
  Send,
  CheckCircle2,
  XCircle,
  WifiOff,
} from "lucide-react";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { useDeviceHealth } from "@/hooks/useDeviceHealth";
import { routes } from "@/router/routes";
import { useTranslation } from "@/i18n/useTranslation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { renderMetricCard } from "@/components/MetricCards/renderMetricCard";
import { DeviceHistoryChart } from "@/components/Graphs/DeviceHistoryChart";
import { DeviceEventTimeline } from "@/components/DeviceEventTimeline/DeviceEventTimeline";
import { GenericCommandsPanel } from "@/components/GenericCommandsPanel/GenericCommandsPanel";

const statusConfig = {
  OK: {
    icon: CheckCircle2,
    color: "text-green-500",
    dot: "bg-green-500",
    badgeVariant: "default" as const,
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    dot: "bg-yellow-500",
    badgeVariant: "secondary" as const,
  },
  ALARM: {
    icon: XCircle,
    color: "text-destructive",
    dot: "bg-destructive",
    badgeVariant: "destructive" as const,
  },
  DISCONNECTED: {
    icon: WifiOff,
    color: "text-muted-foreground",
    dot: "bg-muted-foreground",
    badgeVariant: "outline" as const,
  },
};

export default function MachineDetailPage() {
  const { machineType: machineTypeSlug, plantId, stationId } = useParams<{
    machineType: string;
    plantId: string;
    stationId: string;
  }>();
  const navigate = useNavigate();
  const { machineTypes } = useMachineTypes();
  const {
    instances,
    deviceEvents,
    isMachineConnected,
    getInstanceHistory,
  } = useMachineTelemetry(machineTypeSlug);
  const getHealth = useDeviceHealth(machineTypeSlug);
  const { t } = useTranslation();

  const machineType = useMemo(
    () => machineTypes.find((mt) => mt.slug === machineTypeSlug),
    [machineTypes, machineTypeSlug],
  );

  const instance = useMemo(
    () =>
      instances.find(
        (inst) => inst.plantId === plantId && inst.stationId === stationId,
      ),
    [instances, plantId, stationId],
  );

  const sortedVariables = useMemo(
    () =>
      machineType
        ? [...machineType.variables].sort(
            (a, b) => a.displayOrder - b.displayOrder,
          )
        : [],
    [machineType],
  );

  const trackedVariables = useMemo(
    () =>
      sortedVariables.filter(
        (v) => (v.cardConfig as Record<string, unknown> | null)?.trackHistory === true,
      ),
    [sortedVariables],
  );

  const sortedCommands = useMemo(
    () =>
      machineType
        ? [...machineType.commands].sort(
            (a, b) => a.displayOrder - b.displayOrder,
          )
        : [],
    [machineType],
  );

  const instanceHistory = useMemo(
    () =>
      machineTypeSlug && plantId && stationId
        ? getInstanceHistory(machineTypeSlug, plantId, stationId)
        : {},
    [getInstanceHistory, machineTypeSlug, plantId, stationId],
  );

  const filteredEvents = useMemo(
    () =>
      deviceEvents.filter(
        (e) =>
          e.machineType === machineTypeSlug &&
          e.instanceId === stationId &&
          e.plantId === plantId,
      ),
    [deviceEvents, machineTypeSlug, stationId, plantId],
  );

  const isConnected = useMemo(
    () =>
      plantId && stationId
        ? isMachineConnected(`${plantId}-${stationId}`)
        : false,
    [isMachineConnected, plantId, stationId],
  );

  const health = useMemo(
    () =>
      instance ? getHealth(instance.points, isConnected) : undefined,
    [instance, getHealth, isConnected],
  );

  const hasCommands = sortedCommands.length > 0;
  const tabCount = 2 + (hasCommands ? 1 : 0);

  if (!machineType) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Machine type not found.</p>
      </div>
    );
  }

  const healthStatus = health?.status ?? "DISCONNECTED";
  const cfg = statusConfig[healthStatus];
  const StatusIcon = cfg.icon;

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate(routes.machine.dashboard(machineTypeSlug!))
          }
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t.common?.back ?? "Back"}
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{stationId}</h1>
              <span
                className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${
                  healthStatus === "ALARM" ? "animate-pulse" : ""
                }`}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {machineType.name} &middot; {plantId}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={cfg.badgeVariant}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {healthStatus}
          </Badge>
          {instance && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {new Date(instance.timestamp).toLocaleString()}
            </Badge>
          )}
        </div>
      </div>

      {!instance ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">
              {t.machineDashboard?.waitingForData ??
                "Waiting for data from this instance..."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className={`grid w-full max-w-lg grid-cols-${tabCount}`}>
            <TabsTrigger value="overview">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="events" className="relative">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Events
              {filteredEvents.length > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  variant="destructive"
                >
                  {filteredEvents.length > 99 ? "99+" : filteredEvents.length}
                </Badge>
              )}
            </TabsTrigger>
            {hasCommands && (
              <TabsTrigger value="commands">
                <Send className="w-4 h-4 mr-2" />
                Commands
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Variables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedVariables.map((varDef) => {
                const point = instance.points[varDef.key];
                return (
                  <div key={varDef.key} className="h-full">
                    {renderMetricCard({
                      cardType: varDef.cardType,
                      label: varDef.label,
                      value: point?.value ?? 0,
                      unit: point?.unit ?? "",
                      quality: point?.quality,
                      color: varDef.color as "primary" | "accent" | "chart" | "destructive" | "warning" | "success",
                      cardConfig: varDef.cardConfig as Record<string, unknown>,
                    })}
                  </div>
                );
              })}
            </div>

            {/* History Charts */}
            {trackedVariables.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {trackedVariables.map((varDef) => (
                  <DeviceHistoryChart
                    key={varDef.key}
                    title={varDef.label}
                    data={instanceHistory[varDef.key] ?? []}
                    color={varDef.color || "#3b82f6"}
                    unit={varDef.unit}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <DeviceEventTimeline events={filteredEvents} />
          </TabsContent>

          {/* Commands Tab */}
          {hasCommands && (
            <TabsContent value="commands">
              <div className="max-w-md">
                <GenericCommandsPanel
                  machineType={machineTypeSlug!}
                  plantId={plantId!}
                  stationId={stationId!}
                  commands={sortedCommands}
                  currentPoints={instance.points as Record<string, { value: unknown }>}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
