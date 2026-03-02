import { describe, it, expect } from "vitest";
import {
  calculateCost,
  calculateDeltaPercent,
  buildRankingRows,
  buildEnergySummary,
  toEnergyDataPoints,
  buildComparisonData,
} from "@/domain/energy/calculateEnergy";
import type { EnergyDataPoint } from "@/types/energy";
import type { AggregatedPoint } from "@/types/history-api";

// ─── toEnergyDataPoints ───────────────────────────────────────────────────────

describe("toEnergyDataPoints", () => {
  it("converts power aggregated points to kWh using intervalHours", () => {
    const raw: AggregatedPoint[] = [
      { bucket: "2024-01-01T00:00:00Z", plantId: "p1", stationId: "ahu-1", pointName: "power", avg: 5, min: 4, max: 6, sum: 5, count: 1 },
    ];
    const result = toEnergyDataPoints(raw, 1);
    expect(result).toHaveLength(1);
    expect(result[0].kwh).toBeCloseTo(5, 1); // 5 kW × 1 h = 5 kWh
  });

  it("multiplies avg by intervalHours for daily buckets", () => {
    const raw: AggregatedPoint[] = [
      { bucket: "2024-01-01T00:00:00Z", plantId: "p1", stationId: "ahu-1", pointName: "power", avg: 10, min: 8, max: 12, sum: 10, count: 1 },
    ];
    const result = toEnergyDataPoints(raw, 24);
    expect(result[0].kwh).toBeCloseTo(240, 0); // 10 kW × 24 h = 240 kWh
  });

  it("filters out non-power points", () => {
    const raw: AggregatedPoint[] = [
      { bucket: "2024-01-01T00:00:00Z", plantId: "p1", stationId: "ahu-1", pointName: "temperature", avg: 22, min: 20, max: 24, sum: 22, count: 1 },
    ];
    expect(toEnergyDataPoints(raw, 1)).toHaveLength(0);
  });
});

// ─── calculateCost ────────────────────────────────────────────────────────────

describe("calculateCost", () => {
  it("multiplies kwh by rate and rounds to 2 decimals", () => {
    expect(calculateCost(100, 0.12)).toBe(12.0);
    expect(calculateCost(33.333, 0.15)).toBe(5.0);
  });

  it("returns 0 for 0 kWh", () => {
    expect(calculateCost(0, 0.12)).toBe(0);
  });
});

// ─── calculateDeltaPercent ────────────────────────────────────────────────────

describe("calculateDeltaPercent", () => {
  it("returns null when previous is 0", () => {
    expect(calculateDeltaPercent(100, 0)).toBeNull();
  });

  it("returns positive percent when current > previous", () => {
    expect(calculateDeltaPercent(110, 100)).toBe(10);
  });

  it("returns negative percent when current < previous", () => {
    expect(calculateDeltaPercent(90, 100)).toBe(-10);
  });

  it("returns 0 when equal", () => {
    expect(calculateDeltaPercent(100, 100)).toBe(0);
  });
});

// ─── buildRankingRows ─────────────────────────────────────────────────────────

describe("buildRankingRows", () => {
  const points: EnergyDataPoint[] = [
    { timestamp: "t1", ahuId: "ahu-1", plantId: "p1", kwh: 30 },
    { timestamp: "t2", ahuId: "ahu-1", plantId: "p1", kwh: 20 },
    { timestamp: "t1", ahuId: "ahu-2", plantId: "p1", kwh: 60 },
  ];

  it("aggregates kwh per AHU", () => {
    const rows = buildRankingRows(points, 0.1);
    const ahu1 = rows.find((r) => r.stationId === "ahu-1");
    expect(ahu1?.totalKwh).toBe(50);
  });

  it("sorts descending by consumption", () => {
    const rows = buildRankingRows(points, 0.1);
    expect(rows[0].stationId).toBe("ahu-2"); // 60 kWh first
  });

  it("calculates cost correctly", () => {
    const rows = buildRankingRows(points, 0.12);
    const ahu2 = rows.find((r) => r.stationId === "ahu-2");
    expect(ahu2?.cost).toBeCloseTo(7.2, 1);
  });
});

// ─── buildEnergySummary ───────────────────────────────────────────────────────

describe("buildEnergySummary", () => {
  const current: EnergyDataPoint[] = [
    { timestamp: "t1", ahuId: "ahu-1", plantId: "p1", kwh: 100 },
    { timestamp: "t2", ahuId: "ahu-2", plantId: "p1", kwh: 200 },
  ];
  const previous: EnergyDataPoint[] = [
    { timestamp: "t0", ahuId: "ahu-1", plantId: "p1", kwh: 150 },
  ];

  it("sums total kWh", () => {
    const s = buildEnergySummary(current, previous, 0.10);
    expect(s.totalKwh).toBe(300);
  });

  it("calculates total cost", () => {
    const s = buildEnergySummary(current, previous, 0.10);
    expect(s.totalCost).toBe(30.0);
  });

  it("calculates avg per AHU from unique AHUs", () => {
    const s = buildEnergySummary(current, previous, 0.10);
    // 2 unique AHUs → 300 / 2 = 150
    expect(s.avgKwhPerAhu).toBe(150);
  });

  it("computes negative delta when current < previous total", () => {
    const s = buildEnergySummary(current, previous, 0.10); // 300 vs 150 → +100%
    expect(s.deltaPercent).toBe(100);
  });
});

// ─── buildComparisonData ──────────────────────────────────────────────────────

describe("buildComparisonData", () => {
  it("returns comparison points of equal length", () => {
    const current: EnergyDataPoint[] = [
      { timestamp: "2024-01-01T00:00:00Z", ahuId: "ahu-1", plantId: "p1", kwh: 10 },
    ];
    const previous: EnergyDataPoint[] = [
      { timestamp: "2024-01-01T00:00:00Z", ahuId: "ahu-1", plantId: "p1", kwh: 8 },
    ];
    const data = buildComparisonData(current, previous);
    expect(data).toHaveLength(1);
    expect(data[0].current).toBe(10);
    expect(data[0].previous).toBe(8);
  });

  it("handles empty inputs", () => {
    expect(buildComparisonData([], [])).toHaveLength(0);
  });
});
