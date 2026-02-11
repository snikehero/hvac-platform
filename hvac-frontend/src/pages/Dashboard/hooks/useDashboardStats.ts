import { useMemo } from "react";
import type { HvacTelemetry } from "@/types/telemetry";
import { getAhuStatus } from "../utils/hvacSelectors";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";

export function useDashboardStats(telemetry: HvacTelemetry[]) {
  return useMemo(() => {
    let alarms = 0;
    let warnings = 0;
    let tempSum = 0;
    let humSum = 0;
    let count = 0;
    let disconnected = 0;

    telemetry.forEach((ahu) => {
      const health = getAhuHealth(ahu, getAhuStatus(ahu));
      const status = getAhuStatus(ahu);
      if (status === "ALARM") alarms++;
      if (status === "WARNING") warnings++;
      if (health.status === "DISCONNECTED") {
        disconnected++;
      }
      const t = Number(ahu.points.temperature?.value);
      const h = Number(ahu.points.humidity?.value);
      if (!isNaN(t) && !isNaN(h)) {
        tempSum += t;
        humSum += h;
        count++;
      }
    });

    return {
      alarms,
      warnings,
      avgTemp: count ? tempSum / count : null,
      avgHumidity: count ? humSum / count : null,
      totalAhus: telemetry.length,
      disconnected,
    };
  }, [telemetry]);
}
