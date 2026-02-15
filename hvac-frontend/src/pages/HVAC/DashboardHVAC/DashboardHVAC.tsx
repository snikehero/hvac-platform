import { useState, useEffect, useMemo } from "react";
import TelemetryCard from "@/components/TelemetryCard/TelemetryCard";
import { useTelemetry } from "@/hooks/useTelemetry";
import type { HvacTelemetry } from "@/types/telemetry";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";
import { Badge } from "@/components/ui/badge";
import {
  Factory,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type FilterStatus = "ALL" | "OK" | "WARNING" | "ALARM";

export default function DashboardHVAC() {
  const { telemetry } = useTelemetry();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 Solo AHUs conectados
  const connectedAhus = useMemo(
    () =>
      telemetry.filter((ahu) => getAhuHealth(ahu).status !== "DISCONNECTED"),
    [telemetry],
  );

  // Filtrado por estado
  const filteredAhus = useMemo(() => {
    if (filter === "ALL") return connectedAhus;
    return connectedAhus.filter((ahu) => getAhuHealth(ahu).status === filter);
  }, [connectedAhus, filter]);

  const groupedByPlant = useMemo(
    () => groupByPlant(filteredAhus),
    [filteredAhus],
  );

  // Estadísticas globales
  const stats = useMemo(() => {
    let ok = 0;
    let warning = 0;
    let alarm = 0;

    connectedAhus.forEach((ahu) => {
      const status = getAhuHealth(ahu).status;
      if (status === "OK") ok++;
      else if (status === "WARNING") warning++;
      else if (status === "ALARM") alarm++;
    });

    return { ok, warning, alarm, total: connectedAhus.length };
  }, [connectedAhus]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)] opacity-20" />

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse-slow" />

      <div className="relative z-10 p-6 md:p-12 space-y-8 max-w-[2000px] mx-auto">
        {/* Header */}
        <section
          className={`
          space-y-6
          transition-all duration-1000 delay-100
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-mono text-primary uppercase tracking-wider">
                  Live Monitoring
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                HVAC
              </span>{" "}
              <span className="text-primary">Dashboard</span>
            </h1>

            <p className="text-lg text-muted-foreground">
              Real-time status of air handling units across all facilities
            </p>
          </div>

          {/* Stats Bar */}
          <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBadge
                  label="Total Units"
                  value={stats.total}
                  icon={Factory}
                  color="primary"
                  active={filter === "ALL"}
                  onClick={() => setFilter("ALL")}
                />
                <StatBadge
                  label="Operational"
                  value={stats.ok}
                  icon={CheckCircle2}
                  color="success"
                  active={filter === "OK"}
                  onClick={() => setFilter("OK")}
                />
                <StatBadge
                  label="Warnings"
                  value={stats.warning}
                  icon={AlertTriangle}
                  color="warning"
                  active={filter === "WARNING"}
                  onClick={() => setFilter("WARNING")}
                />
                <StatBadge
                  label="Critical"
                  value={stats.alarm}
                  icon={AlertTriangle}
                  color="destructive"
                  active={filter === "ALARM"}
                  onClick={() => setFilter("ALARM")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Filter */}
          {filter !== "ALL" && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Filtering by:{" "}
                <span className="font-semibold text-foreground">{filter}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter("ALL")}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </section>

        {/* Plants */}
        {Object.entries(groupedByPlant).length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                {filter === "ALL"
                  ? "No connected AHUs found"
                  : `No AHUs with status "${filter}"`}
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedByPlant).map(([plantId, ahus], index) => {
            const hasAlarm = ahus.some(
              (ahu) => getAhuHealth(ahu).status === "ALARM",
            );
            const plantStats = getPlantStats(ahus);

            return (
              <section
                key={plantId}
                className={`
                  space-y-4
                  transition-all duration-1000
                  ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
                `}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                {/* Plant Header */}
                <Card
                  className={`
                  border backdrop-blur-sm overflow-hidden
                  ${
                    hasAlarm
                      ? "border-destructive/50 bg-destructive/5 shadow-lg shadow-destructive/20 animate-pulse"
                      : "border-border bg-card/50"
                  }
                `}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          p-2 rounded-lg
                          ${hasAlarm ? "bg-destructive/20" : "bg-primary/10"}
                        `}
                        >
                          <Factory
                            className={`
                            w-5 h-5
                            ${hasAlarm ? "text-destructive" : "text-primary"}
                          `}
                          />
                        </div>

                        <div>
                          <h2 className="text-xl font-bold">Plant {plantId}</h2>
                          <p className="text-sm text-muted-foreground font-mono">
                            {ahus.length} unit{ahus.length !== 1 ? "s" : ""}{" "}
                            active
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {plantStats.ok > 0 && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-mono">
                            {plantStats.ok} OK
                          </Badge>
                        )}
                        {plantStats.warning > 0 && (
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-mono">
                            {plantStats.warning} WARN
                          </Badge>
                        )}
                        {plantStats.alarm > 0 && (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-mono animate-pulse">
                            {plantStats.alarm} ALARM
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AHUs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {ahus.map((ahu) => (
                    <TelemetryCard
                      key={`${ahu.plantId}-${ahu.stationId}`}
                      ahu={ahu}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

interface StatBadgeProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "success" | "warning" | "destructive";
  active: boolean;
  onClick: () => void;
}

function StatBadge({
  label,
  value,
  icon: Icon,
  color,
  active,
  onClick,
}: StatBadgeProps) {
  const colorClasses = {
    primary: {
      text: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/30",
      active: "bg-primary/20 border-primary/50",
    },
    success: {
      text: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      active: "bg-green-500/20 border-green-500/50",
    },
    warning: {
      text: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      active: "bg-yellow-500/20 border-yellow-500/50",
    },
    destructive: {
      text: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      active: "bg-destructive/20 border-destructive/50",
    },
  };

  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`
        p-4 rounded-lg border transition-all duration-200
        hover:scale-105 cursor-pointer
        ${active ? colors.active : `${colors.bg} ${colors.border}`}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-4 h-4 ${colors.text}`} />
        {active && (
          <div
            className={`w-2 h-2 rounded-full ${colors.text.replace("text-", "bg-")} animate-pulse`}
          />
        )}
      </div>

      <div className={`text-2xl font-black tabular-nums ${colors.text}`}>
        {value}
      </div>

      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
        {label}
      </div>
    </button>
  );
}

/* ================= HELPERS ================= */

function groupByPlant(telemetry: HvacTelemetry[]) {
  return telemetry.reduce<Record<string, HvacTelemetry[]>>((acc, ahu) => {
    if (!acc[ahu.plantId]) {
      acc[ahu.plantId] = [];
    }
    acc[ahu.plantId].push(ahu);
    return acc;
  }, {});
}

function getPlantStats(ahus: HvacTelemetry[]) {
  let ok = 0;
  let warning = 0;
  let alarm = 0;

  ahus.forEach((ahu) => {
    const status = getAhuHealth(ahu).status;
    if (status === "OK") ok++;
    else if (status === "WARNING") warning++;
    else if (status === "ALARM") alarm++;
  });

  return { ok, warning, alarm };
}
