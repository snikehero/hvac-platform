/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard-overview/page.tsx
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Thermometer, Droplet, AlertTriangle } from "lucide-react";
import { useTelemetry } from "@/hooks/useTelemetry";
import MiniLineChart from "@/components/Charts/MiniLineChart";
import { useAhuHistory } from "@/hooks/useAhuHistory";
import type { HvacTelemetry } from "@/types/telemetry";

export default function DashboardOverviewPage() {
  const { telemetry } = useTelemetry();

  // ------------------------------ Filtros ------------------------------
  const [plantFilter, setPlantFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "OK" | "WARNING" | "ALARM" | null
  >(null);

  // ------------------------------ AHUs filtrados ------------------------------
  const filteredAHUs = useMemo(() => {
    return telemetry.filter((ahu) => {
      const statusRaw = String(ahu.points.status?.value);
      const status: "OK" | "WARNING" | "ALARM" =
        statusRaw === "ALARM" || statusRaw === "WARNING" || statusRaw === "OK"
          ? (statusRaw as any)
          : "OK";

      const plantMatch = plantFilter ? ahu.plantId === plantFilter : true;
      const statusMatch = statusFilter ? status === statusFilter : true;

      return plantMatch && statusMatch;
    });
  }, [telemetry, plantFilter, statusFilter]);

  // ------------------------------ Contadores ------------------------------
  const { activeAlarms } = useMemo(() => {
    let alarms = 0;
    let warnings = 0;
    telemetry.forEach((ahu) => {
      const statusRaw = String(ahu.points.status?.value);
      if (statusRaw === "ALARM") alarms += 1;
      else if (statusRaw === "WARNING") warnings += 1;
    });
    return { activeAlarms: alarms, activeWarnings: warnings };
  }, [telemetry]);

  // ------------------------------ Widgets resumen ------------------------------
  const widgets = [
    {
      icon: Activity,
      title: "Estado del sistema",
      value: (
        <Badge variant={activeAlarms === 0 ? "secondary" : "destructive"}>
          {activeAlarms === 0 ? "OK" : "ALARM"}
        </Badge>
      ),
    },
    {
      icon: Thermometer,
      title: "Temperatura promedio",
      value: `${
        filteredAHUs.length > 0
          ? (
              filteredAHUs.reduce(
                (sum, a) => sum + Number(a.points.temperature?.value ?? 0),
                0,
              ) / filteredAHUs.length
            ).toFixed(1)
          : "--"
      } °C`,
    },
    {
      icon: Droplet,
      title: "Humedad promedio",
      value: `${
        filteredAHUs.length > 0
          ? (
              filteredAHUs.reduce(
                (sum, a) => sum + Number(a.points.humidity?.value ?? 0),
                0,
              ) / filteredAHUs.length
            ).toFixed(1)
          : "--"
      } %`,
    },
    {
      icon: AlertTriangle,
      title: "Alarmas activas",
      value: (
        <Badge variant="destructive" className="animate-pulse">
          {activeAlarms}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      <p className="text-muted-foreground">
        Resumen en tiempo real de todos los AHUs y alarmas
      </p>

      {/* ---------------- Widgets resumen ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {widgets.map(({ icon: Icon, title, value }) => (
          <Card key={title} className="bg-gray-900">
            <CardHeader className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-white" />
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------------- Filtros ---------------- */}
      <div className="flex gap-4 items-center">
        <select
          value={plantFilter ?? ""}
          onChange={(e) => setPlantFilter(e.target.value || null)}
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="">Todas las plantas</option>
          {[...new Set(telemetry.map((ahu) => ahu.plantId))].map((plant) => (
            <option key={plant} value={plant}>
              {plant}
            </option>
          ))}
        </select>

        <select
          value={statusFilter ?? ""}
          onChange={(e) =>
            setStatusFilter(
              e.target.value === "" ? null : (e.target.value as any),
            )
          }
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="">Todos los estados</option>
          <option value="OK">OK</option>
          <option value="WARNING">WARNING</option>
          <option value="ALARM">ALARM</option>
        </select>
      </div>

      {/* ---------------- AHUs ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {filteredAHUs.map((ahu) => (
          <AhuCard key={ahu.stationId} ahu={ahu} />
        ))}
      </div>
    </div>
  );
}

// ------------------------------ Componente AhuCard ------------------------------
function AhuCard({ ahu }: { ahu: HvacTelemetry }) {
  const history = useAhuHistory(ahu);

  const temperature = Number(ahu.points.temperature?.value ?? 0);
  const humidity = Number(ahu.points.humidity?.value ?? 0);
  const statusRaw = String(ahu.points.status?.value);
  const status: "OK" | "WARNING" | "ALARM" =
    statusRaw === "ALARM" || statusRaw === "WARNING" || statusRaw === "OK"
      ? (statusRaw as any)
      : "OK";
  const activeAlarms = status === "ALARM" ? 1 : 0;

  return (
    <Card className="bg-gray-800 hover:shadow-lg cursor-pointer transition">
      <CardHeader className="flex justify-between items-center">
        <span className="font-semibold">{ahu.stationId}</span>
        <Badge
          variant={
            status === "ALARM"
              ? "destructive"
              : status === "WARNING"
                ? "secondary"
                : "default"
          }
        >
          {status}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Temperatura */}
        <div className="flex flex-col">
          <div className="flex justify-between text-sm">
            <span>Temperatura:</span>
            <span>{temperature.toFixed(1)} °C</span>
          </div>
          {history?.temperature?.length && (
            <MiniLineChart
              data={history.temperature}
              color="#38bdf8"
              height={50}
            />
          )}
        </div>

        {/* Humedad */}
        <div className="flex flex-col">
          <div className="flex justify-between text-sm">
            <span>Humedad:</span>
            <span>{humidity.toFixed(1)} %</span>
          </div>
          {history?.humidity?.length && (
            <MiniLineChart
              data={history.humidity}
              color="#22c55e"
              height={50}
            />
          )}
        </div>

        {/* Alarmas */}
        {activeAlarms ? (
          <div className="flex justify-between items-center">
            <span>Alarmas:</span>
            <Badge variant="destructive">{activeAlarms}</Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
