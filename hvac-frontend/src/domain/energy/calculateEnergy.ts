import type { AggregatedPoint } from "@/types/history-api";
import type {
  EnergyDataPoint,
  EnergySummary,
  EnergyRankingRow,
  EnergyComparisonPoint,
} from "@/types/energy";

/**
 * Convert aggregated telemetry points (power in kW) to kWh energy data points.
 * Assumes each point represents the average power over its aggregation interval.
 */
export function toEnergyDataPoints(
  points: AggregatedPoint[],
  intervalHours: number,
): EnergyDataPoint[] {
  return points
    .filter((p) => p.pointName === "power" || p.pointName.includes("power"))
    .map((p) => ({
      timestamp: p.bucket,
      ahuId: p.stationId ?? "unknown",
      plantId: p.plantId ?? "unknown",
      kwh: (p.avg ?? 0) * intervalHours,
    }));
}

/**
 * Calculate cost from total kWh and rate.
 */
export function calculateCost(kwh: number, costPerKwh: number): number {
  return Math.round(kwh * costPerKwh * 100) / 100;
}

/**
 * Calculate period-over-period delta as a percentage.
 * Returns null if previousTotal is 0 (no baseline).
 */
export function calculateDeltaPercent(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * Aggregate energy data points into a per-AHU ranking.
 */
export function buildRankingRows(
  points: EnergyDataPoint[],
  costPerKwh: number,
): EnergyRankingRow[] {
  const map = new Map<string, EnergyRankingRow>();

  for (const p of points) {
    const key = `${p.plantId}::${p.ahuId}`;
    const existing = map.get(key);
    if (existing) {
      existing.totalKwh += p.kwh;
    } else {
      map.set(key, {
        plantId: p.plantId,
        stationId: p.ahuId,
        totalKwh: p.kwh,
        cost: 0,
      });
    }
  }

  const rows = Array.from(map.values()).map((r) => ({
    ...r,
    totalKwh: Math.round(r.totalKwh * 100) / 100,
    cost: calculateCost(r.totalKwh, costPerKwh),
  }));

  return rows.sort((a, b) => b.totalKwh - a.totalKwh);
}

/**
 * Build a complete energy summary from current and previous period data.
 */
export function buildEnergySummary(
  currentPoints: EnergyDataPoint[],
  previousPoints: EnergyDataPoint[],
  costPerKwh: number,
): EnergySummary {
  const totalKwh = currentPoints.reduce((sum, p) => sum + p.kwh, 0);
  const previousKwh = previousPoints.reduce((sum, p) => sum + p.kwh, 0);

  const uniqueAhus = new Set(currentPoints.map((p) => `${p.plantId}::${p.ahuId}`)).size;
  const avgKwhPerAhu = uniqueAhus > 0 ? totalKwh / uniqueAhus : 0;

  return {
    totalKwh: Math.round(totalKwh * 100) / 100,
    totalCost: calculateCost(totalKwh, costPerKwh),
    avgKwhPerAhu: Math.round(avgKwhPerAhu * 100) / 100,
    deltaPercent: calculateDeltaPercent(totalKwh, previousKwh),
    rankingRows: buildRankingRows(currentPoints, costPerKwh),
  };
}

/**
 * Merge current and previous points into a comparison dataset bucketed by label.
 */
export function buildComparisonData(
  current: EnergyDataPoint[],
  previous: EnergyDataPoint[],
): EnergyComparisonPoint[] {
  // Group by bucket index (oldest-first)
  const currentBuckets = groupByBucket(current);
  const previousBuckets = groupByBucket(previous);

  const maxLen = Math.max(currentBuckets.length, previousBuckets.length);
  return Array.from({ length: maxLen }, (_, i) => ({
    label: String(i + 1),
    current: currentBuckets[i] ?? 0,
    previous: previousBuckets[i] ?? 0,
  }));
}

function groupByBucket(points: EnergyDataPoint[]): number[] {
  const map = new Map<string, number>();
  for (const p of points) {
    map.set(p.timestamp, (map.get(p.timestamp) ?? 0) + p.kwh);
  }
  return Array.from(map.values());
}
