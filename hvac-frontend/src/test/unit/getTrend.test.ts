import { describe, it, expect } from "vitest";
import { getTrend } from "@/components/Graphs/DeviceHistoryChart";
import type { HistoryPoint } from "@/types/history";

function makePoints(values: number[]): HistoryPoint[] {
  return values.map((value, i) => ({
    timestamp: new Date(Date.now() - (values.length - i) * 1000).toISOString(),
    value,
  }));
}

describe("getTrend", () => {
  it("returns 'stable' for empty array", () => {
    expect(getTrend([])).toBe("stable");
  });

  it("returns 'stable' for a single point", () => {
    expect(getTrend(makePoints([5]))).toBe("stable");
  });

  it("returns 'stable' for two points (below minimum window)", () => {
    expect(getTrend(makePoints([5, 6]))).toBe("stable");
  });

  it("returns 'up' for clearly ascending values", () => {
    expect(getTrend(makePoints([1, 2, 3, 4, 5]))).toBe("up");
  });

  it("returns 'down' for clearly descending values", () => {
    expect(getTrend(makePoints([10, 9, 8, 7, 6]))).toBe("down");
  });

  it("returns 'stable' for flat values", () => {
    expect(getTrend(makePoints([5, 5, 5, 5, 5]))).toBe("stable");
  });

  it("returns 'stable' for small oscillations around a mean", () => {
    expect(getTrend(makePoints([5, 5.01, 4.99, 5, 5.01]))).toBe("stable");
  });

  it("uses only the last 5 points from a larger dataset", () => {
    // First 5 are ascending, last 5 are descending
    const points = makePoints([1, 2, 3, 4, 5, 10, 9, 8, 7, 6]);
    expect(getTrend(points)).toBe("down");
  });

  it("returns 'down' consistently for continuous descent (no flickering)", () => {
    // Simulate incremental descending data arriving
    const series = [10, 9, 8, 7, 6, 5, 4, 3];
    for (let i = 3; i <= series.length; i++) {
      const slice = makePoints(series.slice(0, i));
      const trend = getTrend(slice);
      expect(trend).toBe("down");
    }
  });

  it("returns 'up' consistently for continuous ascent", () => {
    const series = [1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = 3; i <= series.length; i++) {
      const slice = makePoints(series.slice(0, i));
      const trend = getTrend(slice);
      expect(trend).toBe("up");
    }
  });

  it("handles values near zero correctly", () => {
    expect(getTrend(makePoints([0, 0, 0, 0, 0]))).toBe("stable");
    expect(getTrend(makePoints([0, 0.5, 1, 1.5, 2]))).toBe("up");
  });
});
