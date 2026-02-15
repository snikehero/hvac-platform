import { useCallback, useState } from "react";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HistoryPoint } from "@/types/history";
import { getAhuKey } from "./useAhuConnectivity";

const MAX_POINTS = 30;

type HistoryData = Record<
  string,
  {
    temperature: HistoryPoint[];
    humidity: HistoryPoint[];
  }
>;

interface UseHistoryManagementReturn {
  history: HistoryData;
  updateHistory: (ahu: HvacTelemetry) => void;
  initializeFromSnapshot: (data: HvacTelemetry[]) => HistoryData;
}

/**
 * Hook responsible for managing telemetry history
 */
export function useHistoryManagement(): UseHistoryManagementReturn {
  const [history, setHistory] = useState<HistoryData>({});

  const updateHistory = useCallback((ahu: HvacTelemetry) => {
    const key = getAhuKey(ahu.plantId, ahu.stationId);

    setHistory((prev) => {
      const prevHist = prev[key] ?? { temperature: [], humidity: [] };

      const newTemp =
        typeof ahu.points.temperature?.value === "number"
          ? [
              ...prevHist.temperature,
              {
                timestamp: ahu.timestamp,
                value: ahu.points.temperature.value,
              },
            ].slice(-MAX_POINTS)
          : prevHist.temperature;

      const newHum =
        typeof ahu.points.humidity?.value === "number"
          ? [
              ...prevHist.humidity,
              {
                timestamp: ahu.timestamp,
                value: ahu.points.humidity.value,
              },
            ].slice(-MAX_POINTS)
          : prevHist.humidity;

      return { ...prev, [key]: { temperature: newTemp, humidity: newHum } };
    });
  }, []);

  const initializeFromSnapshot = useCallback((data: HvacTelemetry[]) => {
    const newHistory: HistoryData = {};

    data.forEach((ahu) => {
      const key = getAhuKey(ahu.plantId, ahu.stationId);

      const temp =
        typeof ahu.points.temperature?.value === "number"
          ? [
              {
                timestamp: ahu.timestamp,
                value: ahu.points.temperature.value,
              },
            ]
          : [];

      const hum =
        typeof ahu.points.humidity?.value === "number"
          ? [
              {
                timestamp: ahu.timestamp,
                value: ahu.points.humidity.value,
              },
            ]
          : [];

      newHistory[key] = { temperature: temp, humidity: hum };
    });

    setHistory(newHistory);
    return newHistory;
  }, []);

  return {
    history,
    updateHistory,
    initializeFromSnapshot,
  };
}
