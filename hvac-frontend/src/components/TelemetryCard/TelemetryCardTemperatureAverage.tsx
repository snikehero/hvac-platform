/* eslint-disable react-hooks/purity */
// src/components/Telemetry/TelemetryCardTemperatureAverage.tsx
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useAhuHistory } from "@/hooks/useAhuHistory";
import type { HvacTelemetry } from "@/types/telemetry";

interface TelemetryCardTemperatureAverageProps {
  ahu: HvacTelemetry;
  intervalSeconds?: number; // Por defecto 60s
}

export default function TelemetryCardTemperatureAverage({
  ahu,
  intervalSeconds = 60,
}: TelemetryCardTemperatureAverageProps) {
  // Usamos el hook para obtener historial del AHU
  const ahuHistory = useAhuHistory(ahu);

  // Calculamos la temperatura promedio en los últimos intervalSeconds
  const avgTemperature = useMemo(() => {
    if (!ahuHistory?.temperature || ahuHistory.temperature.length === 0)
      return null;

    const now = Date.now();
    const cutoff = now - intervalSeconds * 1000;

    const recentPoints = ahuHistory.temperature.filter(
      (p) => new Date(p.timestamp).getTime() >= cutoff,
    );

    if (recentPoints.length === 0) return null;

    const sum = recentPoints.reduce((acc, p) => acc + p.value, 0);
    return sum / recentPoints.length;
  }, [ahuHistory, intervalSeconds]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white/80">
        Promedio últimos {intervalSeconds}s:
      </span>
      {avgTemperature !== null ? (
        <Badge variant="secondary">
          {avgTemperature.toFixed(1)} {ahu.points.temperature?.unit ?? "°C"}
        </Badge>
      ) : (
        <span className="text-xs text-white/50">
          Sin Lectura en los ultimos {intervalSeconds}s
        </span>
      )}
    </div>
  );
}
