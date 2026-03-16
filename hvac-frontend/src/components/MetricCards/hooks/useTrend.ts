import type { HistoryPoint } from "@/types/history";
import type { TrendInfo } from "../types";

/**
 * Derive trend direction and delta from a history array.
 * Compares the oldest and newest points in the window.
 */
export function calcTrend(points: HistoryPoint[]): TrendInfo {
  if (points.length < 2) return { direction: "stable" };

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const delta = last - first;

  if (Math.abs(delta) < 0.05) return { direction: "stable" };

  return {
    direction: delta > 0 ? "up" : "down",
    delta: `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`,
  };
}
