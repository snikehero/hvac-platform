import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Cpu, Clock } from "lucide-react";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { routes } from "@/router/routes";
import { useTranslation } from "@/i18n/useTranslation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MachineDetailPage() {
  const { machineType: machineTypeSlug, plantId, stationId } = useParams<{
    machineType: string;
    plantId: string;
    stationId: string;
  }>();
  const navigate = useNavigate();
  const { machineTypes } = useMachineTypes();
  const { instances } = useMachineTelemetry(machineTypeSlug);
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

  if (!machineType) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Machine type not found.</p>
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    primary: "border-primary/30 bg-primary/5",
    accent: "border-accent/30 bg-accent/5",
    success: "border-green-500/30 bg-green-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    destructive: "border-destructive/30 bg-destructive/5",
    "chart-1": "border-chart-1/30 bg-chart-1/5",
    "chart-2": "border-chart-2/30 bg-chart-2/5",
    "chart-3": "border-chart-3/30 bg-chart-3/5",
    "chart-4": "border-chart-4/30 bg-chart-4/5",
    "chart-5": "border-chart-5/30 bg-chart-5/5",
  };

  const textColorMap: Record<string, string> = {
    primary: "text-primary",
    accent: "text-accent",
    success: "text-green-500",
    warning: "text-yellow-500",
    destructive: "text-destructive",
    "chart-1": "text-chart-1",
    "chart-2": "text-chart-2",
    "chart-3": "text-chart-3",
    "chart-4": "text-chart-4",
    "chart-5": "text-chart-5",
  };

  return (
    <div className="space-y-6">
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
            <h1 className="text-xl font-bold">
              {stationId}
            </h1>
            <p className="text-sm text-muted-foreground">
              {machineType.name} &middot; {plantId}
            </p>
          </div>
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
        <>
          {/* Connection Info */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {t.machineDashboard?.lastUpdate ?? "Last update"}:{" "}
              {new Date(instance.timestamp).toLocaleString()}
            </Badge>
          </div>

          {/* Variables Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedVariables.map((varDef) => {
              const point = instance.points[varDef.key];
              const cardColor = colorMap[varDef.color] ?? colorMap.primary;
              const labelColor =
                textColorMap[varDef.color] ?? textColorMap.primary;

              return (
                <Card key={varDef.key} className={`border ${cardColor}`}>
                  <CardHeader className="pb-2">
                    <CardTitle
                      className={`text-sm font-medium uppercase tracking-wider ${labelColor}`}
                    >
                      {varDef.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tabular-nums">
                      {point
                        ? typeof point.value === "boolean"
                          ? point.value
                            ? "ON"
                            : "OFF"
                          : typeof point.value === "number"
                            ? Number.isInteger(point.value)
                              ? point.value
                              : point.value.toFixed(2)
                            : String(point.value)
                        : "--"}
                      {point?.unit && (
                        <span className="text-lg text-muted-foreground ml-1">
                          {point.unit}
                        </span>
                      )}
                    </div>
                    {point?.quality && (
                      <Badge
                        variant="outline"
                        className={`mt-2 text-xs ${
                          point.quality === "GOOD"
                            ? "text-green-500 border-green-500/30"
                            : point.quality === "BAD"
                              ? "text-destructive border-destructive/30"
                              : "text-yellow-500 border-yellow-500/30"
                        }`}
                      >
                        {point.quality}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
