import { useMemo } from "react";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import type { HistoryPoint } from "@/types/history";

export interface StationSeries {
  stationId: string;
  plantId: string;
  points: HistoryPoint[];
  currentValue: number | null;
}

export function linearRegression(points: HistoryPoint[]): { slope: number; intercept: number } | null {
  if (points.length < 2) return null;
  const n = points.length;
  const t0 = new Date(points[0].timestamp).getTime();
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of points) {
    const x = (new Date(p.timestamp).getTime() - t0) / 1000;
    const y = p.value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function useAnalyticsData(machineTypeSlug: string | undefined, variableKey: string | undefined) {
  const { instances, getInstanceHistory } = useMachineTelemetry(machineTypeSlug);

  const stationSeries = useMemo<StationSeries[]>(() => {
    if (!machineTypeSlug || !variableKey) return [];
    return instances.map((inst) => {
      const history = getInstanceHistory(machineTypeSlug, inst.plantId, inst.stationId);
      const points = history[variableKey] ?? [];
      const pointData = inst.points[variableKey];
      const currentValue =
        pointData && typeof pointData.value === "number" ? pointData.value : null;
      return { stationId: inst.stationId, plantId: inst.plantId, points, currentValue };
    });
  }, [instances, getInstanceHistory, machineTypeSlug, variableKey]);

  return { stationSeries, instances };
}
