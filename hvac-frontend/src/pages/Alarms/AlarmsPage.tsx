/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAhuHistory } from "@/hooks/useAhuHistory";
import { AhuHistoryTemperatureChart } from "@/components/History/AhuHistoryTemperatureCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, AlertTriangle } from "lucide-react";
import type { HvacTelemetry } from "@/types/telemetry";

export default function AlarmsPage() {
  const { telemetry } = useTelemetry();
  const [selectedAhu, setSelectedAhu] = useState<HvacTelemetry | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "ALARM" | "WARNING">(
    "ALL",
  );
  const [searchAhu, setSearchAhu] = useState("");

  // Hook seguro para historial AHU
  const selectedAhuHistory = useAhuHistory(selectedAhu ?? undefined);

  // ------------------------------
  // Contadores de AHUs activos
  // ------------------------------
  const { activeAlarms, activeWarnings } = useMemo(() => {
    let alarms = 0;
    let warnings = 0;

    telemetry.forEach((ahu) => {
      const status = ahu.points.status?.value;
      if (status === "ALARM") alarms += 1;
      else if (status === "WARNING") warnings += 1;
    });

    return { activeAlarms: alarms, activeWarnings: warnings };
  }, [telemetry]);

  // ------------------------------
  // Filtrar AHUs activos para tabla
  // ------------------------------
  const filteredActiveAhu = useMemo(() => {
    return telemetry.filter((ahu) => {
      const status = ahu.points.status?.value;
      const matchesType =
        filterType === "ALL" || (status && status === filterType);
      const matchesSearch =
        searchAhu === "" ||
        ahu.stationId.toLowerCase().includes(searchAhu.toLowerCase());
      return (
        (status === "ALARM" || status === "WARNING") &&
        matchesType &&
        matchesSearch
      );
    });
  }, [telemetry, filterType, searchAhu]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Alarmas</h1>

      {/* Contadores activos */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex items-center gap-3 p-4 bg-red-600 text-white hover:scale-105 transition">
          <Bell className="w-6 h-6" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-200">Alarmas activas</span>
            <Badge variant="destructive" className="text-lg">
              {activeAlarms}
            </Badge>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4 bg-yellow-500 text-white hover:scale-105 transition">
          <AlertTriangle className="w-6 h-6" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-200">Warnings activos</span>
            <Badge variant="link" className="text-lg">
              {activeWarnings}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as any)}
        >
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder="Filtrar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ALARM">ALARM</SelectItem>
            <SelectItem value="WARNING">WARNING</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Buscar AHU"
          value={searchAhu}
          onChange={(e) => setSearchAhu(e.target.value)}
          className="w-50"
        />
      </div>

      {/* Tabla de AHUs activos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActiveAhu.map((ahu) => (
          <Card
            key={`${ahu.plantId}-${ahu.stationId}`}
            className={`cursor-pointer hover:shadow-lg border-2 hover:scale-102 transition ${
              ahu.points.status?.value === "ALARM"
                ? "border-red-600"
                : "border-yellow-500"
            }`}
            onClick={() => setSelectedAhu(ahu)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {ahu.stationId}
                <Badge
                  variant={
                    ahu.points.status?.value === "ALARM"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {ahu.points.status?.value}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Planta: {ahu.plantId}</p>
              <p>
                Última actualización: {new Date(ahu.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
        {filteredActiveAhu.length === 0 && (
          <p className="text-gray-400 col-span-full text-center mt-4">
            Sin AHUs activos
          </p>
        )}
      </div>

      {/* Modal de detalle AHU */}
      <Dialog open={!!selectedAhu} onOpenChange={() => setSelectedAhu(null)}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle AHU: {selectedAhu?.stationId}</DialogTitle>
          </DialogHeader>

          {selectedAhu && selectedAhuHistory && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <AhuHistoryTemperatureChart
                  data={selectedAhuHistory.temperature}
                  status={selectedAhu.points.status?.value as any}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
