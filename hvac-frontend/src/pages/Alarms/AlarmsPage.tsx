/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAhuHistory } from "@/hooks/useAhuHistory";
import { AhuHistoryTemperatureChart } from "@/components/History/AhuHistoryTemperatureCard";

import { getAhuHealth } from "@/domain/ahu/getAhuHealth";

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
    "ALL"
  );
  const [searchAhu, setSearchAhu] = useState("");

  const selectedAhuHistory = useAhuHistory(selectedAhu ?? undefined);

  /* -------------------------------- */
  /* Contadores usando HEALTH */
  /* -------------------------------- */
  const { activeAlarms, activeWarnings } = useMemo(() => {
    let alarms = 0;
    let warnings = 0;

    telemetry.forEach((ahu) => {
      const health = getAhuHealth(ahu);

      if (health.status === "ALARM") alarms++;
      if (health.status === "WARNING") warnings++;
    });

    return { activeAlarms: alarms, activeWarnings: warnings };
  }, [telemetry]);

  /* -------------------------------- */
  /* Filtrar solo activos (no disconnected) */
  /* -------------------------------- */
  const filteredActiveAhu = useMemo(() => {
    return telemetry.filter((ahu) => {
      const health = getAhuHealth(ahu);

      // 🚫 Ignorar desconectados completamente
      if (health.status === "DISCONNECTED") return false;

      const matchesType =
        filterType === "ALL" || health.status === filterType;

      const matchesSearch =
        searchAhu === "" ||
        ahu.stationId.toLowerCase().includes(searchAhu.toLowerCase());

      return (
        (health.status === "ALARM" || health.status === "WARNING") &&
        matchesType &&
        matchesSearch
      );
    });
  }, [telemetry, filterType, searchAhu]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Alarmas</h1>

      {/* Contadores */}
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
            <Badge variant="secondary" className="text-lg">
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
          <SelectTrigger className="w-40">
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

      {/* Tabla */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActiveAhu.map((ahu) => {
          const health = getAhuHealth(ahu);

          return (
            <Card
              key={`${ahu.plantId}-${ahu.stationId}`}
              className={`cursor-pointer hover:shadow-lg border-2 transition ${
                health.status === "ALARM"
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
                      health.status === "ALARM"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {health.status}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p>Planta: {ahu.plantId}</p>
                <p>
                  Última actualización:{" "}
                  {new Date(ahu.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          );
        })}

        {filteredActiveAhu.length === 0 && (
          <p className="text-gray-400 col-span-full text-center mt-4">
            Sin AHUs activos
          </p>
        )}
      </div>

      {/* Modal */}
      <Dialog open={!!selectedAhu} onOpenChange={() => setSelectedAhu(null)}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalle AHU: {selectedAhu?.stationId}
            </DialogTitle>
          </DialogHeader>

          {selectedAhu && (
            <AhuHistoryTemperatureChart
              data={selectedAhuHistory.temperature}
              status={
                getAhuHealth(
                  selectedAhu,
                ).status
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
