import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Cpu, Clock } from "lucide-react";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { routes } from "@/router/routes";
import { useTranslation } from "@/i18n/useTranslation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { renderMetricCard } from "@/components/MetricCards/renderMetricCard";

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

              return (
                <div key={varDef.key} className="h-full">
                  {renderMetricCard({
                    cardType: varDef.cardType,
                    label: varDef.label,
                    value: point?.value ?? 0,
                    unit: point?.unit ?? "",
                    quality: point?.quality,
                    color: varDef.color as any,
                    cardConfig: varDef.cardConfig as Record<string, unknown>,
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
