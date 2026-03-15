import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Cpu, Wifi, WifiOff, ArrowRight } from "lucide-react";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
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

export default function MachineDashboardPage() {
  const { machineType: machineTypeSlug } = useParams<{
    machineType: string;
  }>();
  const navigate = useNavigate();
  const { machineTypes } = useMachineTypes();
  const { instances, connected } = useMachineTelemetry(machineTypeSlug);
  const { t } = useTranslation();

  const machineType = useMemo(
    () => machineTypes.find((mt) => mt.slug === machineTypeSlug),
    [machineTypes, machineTypeSlug],
  );

  if (!machineType) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Machine type &quot;{machineTypeSlug}&quot; not found.
        </p>
      </div>
    );
  }

  // Group instances by plantId
  const grouped = useMemo(() => {
    const map = new Map<string, typeof instances>();
    for (const inst of instances) {
      const key = inst.plantId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inst);
    }
    return map;
  }, [instances]);

  const sortedVariables = useMemo(
    () => [...machineType.variables].sort((a, b) => a.displayOrder - b.displayOrder),
    [machineType.variables],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
          <Badge
            variant="outline"
            className={`gap-1 ${connected ? "text-green-500 border-green-500/30" : "text-destructive border-destructive/30"}`}
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
          <Badge variant="secondary" className="font-mono">
            {instances.length}{" "}
            {t.machineDashboard?.instances ?? "instances"}
          </Badge>
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
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([plantId, plantInstances]) => (
            <div key={plantId} className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">
                {t.machineDashboard?.plant ?? "Plant"}: {plantId}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {plantInstances.map((inst) => (
                  <Card
                    key={`${inst.plantId}-${inst.stationId}`}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() =>
                      navigate(
                        routes.machine.detail(
                          machineTypeSlug!,
                          inst.plantId,
                          inst.stationId,
                        ),
                      )
                    }
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
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
                              {point
                                ? typeof point.value === "boolean"
                                  ? point.value
                                    ? "ON"
                                    : "OFF"
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
