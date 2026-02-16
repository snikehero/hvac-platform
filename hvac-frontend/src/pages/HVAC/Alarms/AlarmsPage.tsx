/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAhuHistory } from "@/hooks/useAhuHistory";
import { AhuHistoryTemperatureChart } from "@/components/Graphs/AhuHistoryTemperatureCard";
import { AhuHistoryHumidityChart } from "@/components/Graphs/AhuHistoryHumidityChart";

import { useAhuHealth } from "@/hooks/useAhuHealth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  AlertTriangle,
  Search,
  Thermometer,
  Droplets,
  Clock,
} from "lucide-react";
import type { HvacTelemetry } from "@/types/telemetry";

export default function AlarmsPage() {
  const { telemetry, ahuConnectionStatus } = useTelemetry();
  const [selectedAhu, setSelectedAhu] = useState<HvacTelemetry | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "ALARM" | "WARNING">(
    "ALL",
  );
  const [searchAhu, setSearchAhu] = useState("");

  const getHealth = useAhuHealth();

  const selectedAhuHistory = useAhuHistory(selectedAhu ?? undefined);

  /* -------------------------------- */
  /* Contadores usando HEALTH */
  /* -------------------------------- */
  const { activeAlarms, activeWarnings } = useMemo(() => {
    const isAhuConnected = (ahu: { plantId: string; stationId: string }) => {
      const key = `${ahu.plantId}-${ahu.stationId}`;
      return ahuConnectionStatus[key]?.isConnected ?? false;
    };
    let alarms = 0;
    let warnings = 0;

    telemetry.forEach((ahu) => {
      // Skip disconnected AHUs
      if (!isAhuConnected(ahu)) return;

      const health = getHealth(ahu);

      if (health.status === "ALARM") alarms++;
      else if (health.status === "WARNING") warnings++;
    });

    return { activeAlarms: alarms, activeWarnings: warnings };
  }, [telemetry, ahuConnectionStatus]);

  /* -------------------------------- */
  /* Filtrar solo activos (no disconnected) */
  /* -------------------------------- */
  const filteredActiveAhu = useMemo(() => {
    return telemetry.filter((ahu) => {
      const health = getHealth(ahu);

      // 🚫 Ignorar desconectados completamente
      if (health.status === "DISCONNECTED") return false;

      const matchesType = filterType === "ALL" || health.status === filterType;

      const matchesSearch =
        searchAhu === "" ||
        ahu.stationId.toLowerCase().includes(searchAhu.toLowerCase()) ||
        ahu.plantId.toLowerCase().includes(searchAhu.toLowerCase());

      return (
        (health.status === "ALARM" || health.status === "WARNING") &&
        matchesType &&
        matchesSearch
      );
    });
  }, [telemetry, filterType, searchAhu]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">
          Sistema de Alarmas
        </h1>
        <p className="text-muted-foreground">
          Monitoreo en tiempo real de unidades HVAC con alarmas y advertencias
        </p>
      </div>

      {/* KPI Cards - Mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alarmas Activas */}
        <Card
          className={`
            group relative overflow-hidden backdrop-blur-sm
            transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
            border-destructive/50 bg-destructive/5
            ${activeAlarms > 0 ? "shadow-lg shadow-destructive/20 animate-pulse" : ""}
          `}
        >
          {/* Gradient Top Border */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-red-600" />

          {/* Hover Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-destructive/10 to-transparent pointer-events-none" />

          <CardContent className="relative z-10 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30">
                  <Bell className="w-5 h-5 text-destructive" />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    Alarmas Críticas
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Requieren atención inmediata
                  </div>
                </div>
              </div>
            </div>

            {/* Value */}
            <div className="inline-flex items-baseline px-4 py-2 rounded-lg bg-destructive/5">
              <span className="text-4xl font-black tabular-nums text-destructive">
                {activeAlarms}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Criticidad</span>
                <span className="font-bold">
                  {telemetry.length > 0
                    ? ((activeAlarms / telemetry.length) * 100).toFixed(0)
                    : 0}
                  %
                </span>
              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive transition-all duration-1000"
                  style={{
                    width: `${Math.min(telemetry.length > 0 ? (activeAlarms / telemetry.length) * 100 : 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>

          {/* Status Dot */}
          <div className="absolute top-4 right-4">
            <div
              className={`w-2 h-2 rounded-full bg-destructive ${activeAlarms > 0 ? "animate-ping" : ""}`}
            />
          </div>
        </Card>

        {/* Warnings Activos */}
        <Card
          className={`
            group relative overflow-hidden backdrop-blur-sm
            transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
            border-yellow-500/50 bg-yellow-500/5
            ${activeWarnings > 0 ? "shadow-md shadow-yellow-500/10" : ""}
          `}
        >
          {/* Gradient Top Border */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />

          {/* Hover Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none" />

          <CardContent className="relative z-10 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    Advertencias
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Monitoreo preventivo
                  </div>
                </div>
              </div>
            </div>

            {/* Value */}
            <div className="inline-flex items-baseline px-4 py-2 rounded-lg bg-yellow-500/5">
              <span className="text-4xl font-black tabular-nums text-yellow-500">
                {activeWarnings}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Impacto</span>
                <span className="font-bold">
                  {telemetry.length > 0
                    ? ((activeWarnings / telemetry.length) * 100).toFixed(0)
                    : 0}
                  %
                </span>
              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-1000"
                  style={{
                    width: `${Math.min(telemetry.length > 0 ? (activeWarnings / telemetry.length) * 100 : 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>

          {/* Status Dot */}
          <div className="absolute top-4 right-4">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Filtros Mejorados */}
      <Card className="border backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Tabs para filtro de tipo */}
            <Tabs
              value={filterType}
              onValueChange={(v) => setFilterType(v as any)}
            >
              <TabsList>
                <TabsTrigger value="ALL" className="gap-2">
                  Todos
                  <Badge variant="outline" className="ml-1">
                    {activeAlarms + activeWarnings}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="ALARM" className="gap-2">
                  <Bell className="w-3 h-3" />
                  Alarmas
                  <Badge variant="destructive" className="ml-1">
                    {activeAlarms}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="WARNING" className="gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  Warnings
                  <Badge variant="secondary" className="ml-1">
                    {activeWarnings}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Búsqueda */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar AHU o planta..."
                value={searchAhu}
                onChange={(e) => setSearchAhu(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de AHUs Afectados - Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActiveAhu.map((ahu) => {
          const health = getHealth(ahu);
          const temperature = Number(ahu.points.temperature?.value);
          const humidity = Number(ahu.points.humidity?.value);
          const timeSince = getTimeSince(ahu.timestamp);

          const config =
            health.status === "ALARM"
              ? {
                  border: "border-destructive/50",
                  bg: "bg-destructive/5",
                  glow: "shadow-lg shadow-destructive/20",
                  badge: "destructive" as const,
                  iconColor: "text-destructive",
                  pulse: true,
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
              key={`${ahu.plantId}-${ahu.stationId}`}
              onClick={() => setSelectedAhu(ahu)}
              className={`
                group relative overflow-hidden
                cursor-pointer backdrop-blur-sm
                transition-all duration-300
                hover:scale-[1.02] hover:shadow-xl
                ${config.border} ${config.bg} ${config.glow}
                ${config.pulse ? "animate-pulse" : ""}
              `}
            >
              {/* Gradient Top Border */}
              <div
                className={`absolute top-0 inset-x-0 h-1 ${
                  health.status === "ALARM"
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500"
                }`}
              />

              {/* Hover Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg tracking-tight">
                      {ahu.stationId}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">
                      {ahu.plantId}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={config.badge}
                      className={`font-mono text-xs ${config.pulse ? "animate-pulse" : ""}`}
                    >
                      {health.status}
                    </Badge>

                    {health.badPoints > 0 && (
                      <span className="text-xs text-destructive font-medium">
                        {health.badPoints} errores
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 space-y-3">
                {/* Métricas en línea */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Temperatura */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Temp
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black tabular-nums">
                        {!isNaN(temperature) ? temperature.toFixed(1) : "--"}
                      </span>
                      <span className="text-xs text-muted-foreground">°C</span>
                    </div>
                  </div>

                  {/* Humedad */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3 h-3 text-accent" />
                      <span className="text-xs text-muted-foreground">
                        Humedad
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black tabular-nums">
                        {!isNaN(humidity) ? humidity.toFixed(1) : "--"}
                      </span>
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>

                {/* Tiempo en estado */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Actualizado {timeSince}
                  </span>
                </div>

                {/* Click hint */}
                <div className="pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground font-medium">
                    Click para ver detalles →
                  </span>
                </div>
              </CardContent>

              {/* Status Dot */}
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

        {filteredActiveAhu.length === 0 && (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No hay alarmas activas
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchAhu
                    ? "No se encontraron AHUs que coincidan con tu búsqueda"
                    : "Todos los sistemas están operando normalmente"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal - Mejorado */}
      <Dialog open={!!selectedAhu} onOpenChange={() => setSelectedAhu(null)}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {selectedAhu?.stationId}
                  </div>
                  <div className="text-sm font-normal text-muted-foreground">
                    Análisis detallado de métricas
                  </div>
                </div>
              </div>
              {selectedAhu && (
                <Badge
                  variant={
                    getHealth(selectedAhu).status === "ALARM"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-base px-3 py-1"
                >
                  {getHealth(selectedAhu).status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedAhu && (
            <div className="space-y-6">
              {/* Info Card */}
              <Card className="border-muted bg-muted/20">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        Planta
                      </span>
                      <div className="font-bold">{selectedAhu.plantId}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        Última actualización
                      </span>
                      <div className="font-bold">
                        {new Date(selectedAhu.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        Puntos en error
                      </span>
                      <div className="font-bold text-destructive">
                        {getHealth(selectedAhu).badPoints}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        Estado de conexión
                      </span>
                      <div className="font-bold text-green-500">Conectado</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráficas lado a lado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AhuHistoryTemperatureChart
                  data={selectedAhuHistory.temperature}
                  status={getHealth(selectedAhu).status}
                />
                <AhuHistoryHumidityChart
                  data={selectedAhuHistory.humidity}
                  status={getHealth(selectedAhu).status}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Helpers =====

function getTimeSince(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return `hace ${diffSeconds}s`;
  if (diffSeconds < 3600) return `hace ${Math.floor(diffSeconds / 60)}m`;
  if (diffSeconds < 86400) return `hace ${Math.floor(diffSeconds / 3600)}h`;
  return `hace ${Math.floor(diffSeconds / 86400)}d`;
}
