/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  ArrowRight,
} from "lucide-react";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";
import type { HvacTelemetry } from "@/types/telemetry";

type PlantStatus = "OK" | "WARNING" | "ALARM" | "DISCONNECTED";

interface Props {
  telemetry: HvacTelemetry[];
  onSelectPlant?: (plantId: string) => void;
}

export function HeroPlantPanel({ telemetry, onSelectPlant }: Props) {
  const grouped = useMemo(() => {
    return telemetry.reduce<Record<string, HvacTelemetry[]>>((acc, ahu) => {
      if (!acc[ahu.plantId]) acc[ahu.plantId] = [];
      acc[ahu.plantId].push(ahu);
      return acc;
    }, {});
  }, [telemetry]);

  const SEVERITY_ORDER: Record<PlantStatus, number> = {
    ALARM: 0,
    DISCONNECTED: 1,
    WARNING: 2,
    OK: 3,
  };

  const plantSummaries = useMemo(() => {
    const summaries = Object.entries(grouped).map(([plantId, ahus]) => {
      let alarms = 0;
      let warnings = 0;
      let disconnected = 0;

      ahus.forEach((ahu) => {
        const health = getAhuHealth(ahu);

        if (health.status === "ALARM") alarms++;
        else if (health.status === "WARNING") warnings++;
        else if (health.status === "DISCONNECTED") disconnected++;
      });

      let status: PlantStatus = "OK";

      if (alarms > 0) status = "ALARM";
      else if (disconnected > 0) status = "DISCONNECTED";
      else if (warnings > 0) status = "WARNING";

      const operationalPercentage = Math.round(
        ((ahus.length - alarms - disconnected) / ahus.length) * 100,
      );

      return {
        plantId,
        total: ahus.length,
        alarms,
        warnings,
        disconnected,
        status,
        operationalPercentage,
      };
    });

    return summaries.sort(
      (a, b) => SEVERITY_ORDER[a.status] - SEVERITY_ORDER[b.status],
    );
  }, [grouped, SEVERITY_ORDER]);

  const statusConfig = {
    ALARM: {
      gradient: "from-red-600 to-red-500",
      border: "border-red-500/50",
      bg: "bg-red-600/10",
      icon: AlertTriangle,
      iconColor: "text-red-400",
      badge: "destructive" as const,
    },
    DISCONNECTED: {
      gradient: "from-orange-600 to-orange-500",
      border: "border-orange-500/50",
      bg: "bg-orange-600/10",
      icon: WifiOff,
      iconColor: "text-orange-400",
      badge: "secondary" as const,
    },
    WARNING: {
      gradient: "from-yellow-600 to-yellow-500",
      border: "border-yellow-500/50",
      bg: "bg-yellow-600/10",
      icon: AlertTriangle,
      iconColor: "text-yellow-400",
      badge: "secondary" as const,
    },
    OK: {
      gradient: "from-green-600 to-green-500",
      border: "border-green-500/30",
      bg: "bg-green-600/10",
      icon: CheckCircle2,
      iconColor: "text-green-400",
      badge: "default" as const,
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Plants Overview</h3>
        <Badge variant="outline" className="font-mono">
          {plantSummaries.length} Plants
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plantSummaries.map((plant) => {
          const config = statusConfig[plant.status];
          const StatusIcon = config.icon;

          return (
            <Card
              key={plant.plantId}
              onClick={() => onSelectPlant?.(plant.plantId)}
              className={`
                group relative overflow-hidden
                cursor-pointer backdrop-blur-sm
                transition-all duration-300
                hover:scale-[1.02] hover:shadow-xl
                ${config.border} ${config.bg}
              `}
            >
              {/* Gradient Top Border */}
              <div
                className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${config.gradient}`}
              />

              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

              <div className="relative z-10 p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${config.bg} border ${config.border}`}
                    >
                      <Building2 className={`w-5 h-5 ${config.iconColor}`} />
                    </div>

                    <div>
                      <h4 className="font-bold text-lg">
                        Plant {plant.plantId}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {plant.total} AHU{plant.total !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <Badge variant={config.badge} className="font-mono">
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {plant.status}
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {plant.alarms > 0 && (
                    <StatPill
                      label="Alarms"
                      value={plant.alarms}
                      color="destructive"
                    />
                  )}

                  {plant.warnings > 0 && (
                    <StatPill
                      label="Warnings"
                      value={plant.warnings}
                      color="warning"
                    />
                  )}

                  {plant.disconnected > 0 && (
                    <StatPill
                      label="Offline"
                      value={plant.disconnected}
                      color="muted"
                    />
                  )}
                </div>

                {/* Operational Percentage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Operational</span>
                    <span className="font-bold">
                      {plant.operationalPercentage}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-1000`}
                      style={{ width: `${plant.operationalPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Action Hint */}
                <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-medium">View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Status Indicator Dot */}
              <div className="absolute top-4 right-4">
                <div
                  className={`w-2 h-2 rounded-full ${config.iconColor.replace("text-", "bg-")}`}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ===== Subcomponents =====

interface StatPillProps {
  label: string;
  value: number;
  color: "destructive" | "warning" | "muted";
}

function StatPill({ label, value, color }: StatPillProps) {
  const colorClasses = {
    destructive: "bg-destructive/10 border-destructive/30 text-destructive",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
    muted: "bg-muted border-border text-muted-foreground",
  };

  return (
    <div
      className={`px-2 py-1.5 rounded border ${colorClasses[color]} text-center`}
    >
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="text-sm font-black">{value}</div>
    </div>
  );
}
