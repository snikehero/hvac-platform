import { useState, useCallback } from "react";
import { fetchAggregated } from "@/api/historyApi";
import { toEnergyDataPoints, buildEnergySummary } from "@/domain/energy/calculateEnergy";
import type { EnergyDataPoint, EnergySummary, EnergyPeriod, AggregationType } from "@/types/energy";

interface UseEnergyDataState {
  currentPoints: EnergyDataPoint[];
  previousPoints: EnergyDataPoint[];
  summary: EnergySummary | null;
  loading: boolean;
  error: string | null;
}

interface UseEnergyDataReturn extends UseEnergyDataState {
  fetch: (params: {
    period: EnergyPeriod;
    aggregation: AggregationType;
    costPerKwh: number;
    plantId?: string;
    customStart?: string;
    customEnd?: string;
  }) => Promise<void>;
}

function periodToDates(period: EnergyPeriod, customStart?: string, customEnd?: string) {
  const now = new Date();
  const end = now.toISOString();

  if (period === "custom" && customStart && customEnd) {
    const prevMs = new Date(customEnd).getTime() - new Date(customStart).getTime();
    const prevStart = new Date(new Date(customStart).getTime() - prevMs).toISOString();
    return { currentStart: customStart, currentEnd: customEnd, prevStart, prevEnd: customStart };
  }

  const msMap: Record<Exclude<EnergyPeriod, "custom">, number> = {
    last24h: 24 * 60 * 60 * 1000,
    last7d: 7 * 24 * 60 * 60 * 1000,
    last30d: 30 * 24 * 60 * 60 * 1000,
  };

  const ms = msMap[period as Exclude<EnergyPeriod, "custom">] ?? msMap.last7d;
  const currentStart = new Date(now.getTime() - ms).toISOString();
  const prevStart = new Date(now.getTime() - 2 * ms).toISOString();

  return { currentStart, currentEnd: end, prevStart, prevEnd: currentStart };
}

function intervalHoursForAggregation(agg: AggregationType): number {
  return agg === "daily" ? 24 : 1;
}

export function useEnergyData(): UseEnergyDataReturn {
  const [state, setState] = useState<UseEnergyDataState>({
    currentPoints: [],
    previousPoints: [],
    summary: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(
    async ({
      period,
      aggregation,
      costPerKwh,
      plantId,
      customStart,
      customEnd,
    }: {
      period: EnergyPeriod;
      aggregation: AggregationType;
      costPerKwh: number;
      plantId?: string;
      customStart?: string;
      customEnd?: string;
    }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const { currentStart, currentEnd, prevStart, prevEnd } = periodToDates(
          period,
          customStart,
          customEnd,
        );
        const intervalHours = intervalHoursForAggregation(aggregation);

        const [currentRaw, previousRaw] = await Promise.all([
          fetchAggregated({
            startDate: currentStart,
            endDate: currentEnd,
            aggregation,
            pointName: "power",
            ...(plantId ? { plantId } : {}),
          }),
          fetchAggregated({
            startDate: prevStart,
            endDate: prevEnd,
            aggregation,
            pointName: "power",
            ...(plantId ? { plantId } : {}),
          }),
        ]);

        const currentPoints = toEnergyDataPoints(currentRaw, intervalHours);
        const previousPoints = toEnergyDataPoints(previousRaw, intervalHours);
        const summary = buildEnergySummary(currentPoints, previousPoints, costPerKwh);

        setState({ currentPoints, previousPoints, summary, loading: false, error: null });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load energy data",
        }));
      }
    },
    [],
  );

  return { ...state, fetch };
}
