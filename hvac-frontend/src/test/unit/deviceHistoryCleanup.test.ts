import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeviceHistoryManagement } from "@/hooks/useDeviceHistoryManagement";
import type { MachineTelemetry } from "@/types/machine-type";

function makeInstance(plantId: string, stationId: string, tempValue: number): MachineTelemetry {
  return {
    machineType: "hvac",
    plantId,
    stationId,
    timestamp: new Date().toISOString(),
    points: {
      temperature: { value: tempValue, quality: "GOOD" },
    },
  };
}

describe("useDeviceHistoryManagement — getInstanceHistory", () => {
  it("returns empty object for unknown instance", () => {
    const { result } = renderHook(() => useDeviceHistoryManagement());
    expect(result.current.getInstanceHistory("hvac", "P1", "AHU1")).toEqual({});
  });

  it("stores history after updateHistory call", () => {
    const { result } = renderHook(() => useDeviceHistoryManagement());

    act(() => {
      result.current.updateHistory("hvac", makeInstance("P1", "AHU1", 22), ["temperature"]);
    });

    const hist = result.current.getInstanceHistory("hvac", "P1", "AHU1");
    expect(hist.temperature).toHaveLength(1);
    expect(hist.temperature[0].value).toBe(22);
  });
});

describe("useDeviceHistoryManagement — MAX_POINTS rolling window (30)", () => {
  it("keeps at most 30 points per variable", () => {
    const { result } = renderHook(() => useDeviceHistoryManagement());

    act(() => {
      for (let i = 0; i < 35; i++) {
        result.current.updateHistory("hvac", makeInstance("P1", "AHU1", i), ["temperature"]);
      }
    });

    const hist = result.current.getInstanceHistory("hvac", "P1", "AHU1");
    expect(hist.temperature.length).toBeLessThanOrEqual(30);
  });

  it("keeps the most recent 30 values", () => {
    const { result } = renderHook(() => useDeviceHistoryManagement());

    act(() => {
      for (let i = 0; i < 35; i++) {
        result.current.updateHistory("hvac", makeInstance("P1", "AHU1", i), ["temperature"]);
      }
    });

    const hist = result.current.getInstanceHistory("hvac", "P1", "AHU1");
    // The last value recorded should be 34 (the 35th update)
    const lastValue = hist.temperature[hist.temperature.length - 1].value;
    expect(lastValue).toBe(34);
  });
});

describe("useDeviceHistoryManagement — initializeFromSnapshot", () => {
  it("initializes history from snapshot with one point per instance", () => {
    const { result } = renderHook(() => useDeviceHistoryManagement());

    act(() => {
      result.current.initializeFromSnapshot(
        "hvac",
        [makeInstance("P1", "AHU1", 20), makeInstance("P1", "AHU2", 25)],
        ["temperature"],
      );
    });

    const ahu1 = result.current.getInstanceHistory("hvac", "P1", "AHU1");
    const ahu2 = result.current.getInstanceHistory("hvac", "P1", "AHU2");
    expect(ahu1.temperature).toHaveLength(1);
    expect(ahu1.temperature[0].value).toBe(20);
    expect(ahu2.temperature[0].value).toBe(25);
  });

  it("ignores variables not listed in trackedVarKeys", () => {
    const { result } = renderHook(() => useDeviceHistoryManagement());

    act(() => {
      result.current.initializeFromSnapshot("hvac", [makeInstance("P1", "AHU1", 20)], ["humidity"]);
    });

    const hist = result.current.getInstanceHistory("hvac", "P1", "AHU1");
    expect(hist.temperature).toBeUndefined();
    expect(hist.humidity).toBeUndefined(); // no humidity point in the instance
  });
});

describe("useDeviceHistoryManagement — LRU eviction (MAX_TRACKED_INSTANCES = 500)", () => {
  it("evicts oldest instances when exceeding 500", () => {
    const { result } = renderHook(() => useDeviceHistoryManagement());

    // Add 502 distinct instances
    act(() => {
      for (let i = 0; i < 502; i++) {
        const instance = makeInstance("P1", `AHU${i}`, i);
        result.current.updateHistory("hvac", instance, ["temperature"]);
      }
    });

    // History should have at most 500 entries
    const historyKeys = Object.keys(result.current.history);
    expect(historyKeys.length).toBeLessThanOrEqual(500);
  });

  it("keeps the most recently updated instances", () => {
    const { result } = renderHook(() => useDeviceHistoryManagement());

    // Fill up to 501 instances to trigger eviction
    act(() => {
      for (let i = 0; i < 501; i++) {
        result.current.updateHistory("hvac", makeInstance("P1", `AHU${i}`, i), ["temperature"]);
      }
    });

    // The first instance (AHU0) should have been evicted
    const firstHist = result.current.getInstanceHistory("hvac", "P1", "AHU0");
    const lastHist = result.current.getInstanceHistory("hvac", "P1", "AHU500");

    expect(firstHist).toEqual({});
    expect(lastHist.temperature).toBeDefined();
  });
});
