import { useMemo } from "react";
import type { HvacTelemetry } from "@/types/telemetry";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";

export type SystemStatus =
  | "OK"
  | "WARNING"
  | "ALARM"
  | "DISCONNECTED"
  | "NO_DATA";

export function useDashboardStats(telemetry: HvacTelemetry[]) {
  return useMemo(() => {
    let alarms = 0;
    let warnings = 0;
    let disconnected = 0;
    let tempSum = 0;
    let humSum = 0;
    let count = 0;

    telemetry.forEach((ahu) => {
      const health = getAhuHealth(ahu);

      // 🔥 SOLO usar health.status
      if (health.status === "ALARM") alarms++;
      else if (health.status === "WARNING") warnings++;
      else if (health.status === "DISCONNECTED") disconnected++;

      // Solo promediar si NO está desconectado
      if (health.status !== "DISCONNECTED") {
        const t = Number(ahu.points.temperature?.value);
        const h = Number(ahu.points.humidity?.value);

        if (!isNaN(t) && !isNaN(h)) {
          tempSum += t;
          humSum += h;
          count++;
        }
      }
    });

    const systemStatus =
      telemetry.length === 0
        ? "NO_DATA"
        : alarms > 0
          ? "ALARM"
          : disconnected > 0
            ? "DISCONNECTED"
            : warnings > 0
              ? "WARNING"
              : "OK";

    return {
      alarms,
      warnings,
      disconnected,
      avgTemp: count ? tempSum / count : null,
      avgHumidity: count ? humSum / count : null,
      totalAhus: telemetry.length,
      systemStatus,
    };
  }, [telemetry]);
}

