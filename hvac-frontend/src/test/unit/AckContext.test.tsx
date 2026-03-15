import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAcks, AckProvider } from "@/context/AckContext";
import type { AckRecord } from "@/context/AckContext";
import type { ReactNode } from "react";

// Wrapper that provides AckProvider to renderHook
const wrapper = ({ children }: { children: ReactNode }) => (
  <AckProvider>{children}</AckProvider>
);

// =====================================================================
// addAck
// =====================================================================
describe("AckProvider - addAck", () => {
  it("adds a new ack record to state", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Operator1");
    });

    expect(result.current.acks).toHaveLength(1);
    expect(result.current.acks[0]).toMatchObject({
      plantId: "PLANT-A",
      instanceId: "AHU-01",
      machineType: "hvac",
      forStatus: "ALARM",
      acknowledgedBy: "Operator1",
    });
  });

  it("persists the ack to localStorage under key 'device-acks'", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Operator1");
    });

    const stored = JSON.parse(localStorage.getItem("device-acks") ?? "[]") as AckRecord[];
    expect(stored).toHaveLength(1);
    expect(stored[0].instanceId).toBe("AHU-01");
  });

  it("replaces existing ack for the same plantId+instanceId+machineType+forStatus (deduplication)", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Operator1");
    });
    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Operator2");
    });

    expect(result.current.acks).toHaveLength(1);
    expect(result.current.acks[0].acknowledgedBy).toBe("Operator2");
  });

  it("keeps acks for different instanceIds when adding a new one", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Op1");
    });
    act(() => {
      result.current.addAck("PLANT-A", "AHU-02", "ALARM", "Op2");
    });

    expect(result.current.acks).toHaveLength(2);
  });

  it("supports different machine types", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "MOTOR-01", "ALARM", "Op1", "motor-electrico");
    });

    expect(result.current.acks).toHaveLength(1);
    expect(result.current.acks[0].machineType).toBe("motor-electrico");
  });
});

// =====================================================================
// isAcknowledged
// =====================================================================
describe("AckProvider - isAcknowledged", () => {
  it("returns the ack record when one exists for matching plantId+instanceId+forStatus", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Operator1");
    });

    const record = result.current.isAcknowledged("PLANT-A", "AHU-01", "ALARM");
    expect(record).toBeDefined();
    expect(record?.acknowledgedBy).toBe("Operator1");
  });

  it("returns undefined when no matching ack exists", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    const record = result.current.isAcknowledged("PLANT-A", "AHU-01", "ALARM");
    expect(record).toBeUndefined();
  });

  it("returns undefined when forStatus does not match (ALARM vs WARNING)", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Op1");
    });

    const record = result.current.isAcknowledged("PLANT-A", "AHU-01", "WARNING");
    expect(record).toBeUndefined();
  });

  it("distinguishes between machine types", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "MOTOR-01", "ALARM", "Op1", "motor-electrico");
    });

    // Default machineType is "hvac", so this should not find it
    const hvacRecord = result.current.isAcknowledged("PLANT-A", "MOTOR-01", "ALARM");
    expect(hvacRecord).toBeUndefined();

    // But with correct machineType it should
    const motorRecord = result.current.isAcknowledged("PLANT-A", "MOTOR-01", "ALARM", "motor-electrico");
    expect(motorRecord).toBeDefined();
  });
});

// =====================================================================
// clearAck
// =====================================================================
describe("AckProvider - clearAck", () => {
  it("removes ALL acks for a given plantId+instanceId regardless of forStatus", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Op1");
      result.current.addAck("PLANT-A", "AHU-01", "WARNING", "Op1");
    });
    act(() => {
      result.current.clearAck("PLANT-A", "AHU-01");
    });

    expect(result.current.acks).toHaveLength(0);
  });

  it("leaves acks for other devices untouched", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Op1");
      result.current.addAck("PLANT-A", "AHU-02", "ALARM", "Op2");
    });
    act(() => {
      result.current.clearAck("PLANT-A", "AHU-01");
    });

    expect(result.current.acks).toHaveLength(1);
    expect(result.current.acks[0].instanceId).toBe("AHU-02");
  });

  it("updates localStorage after clearing", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Op1");
    });
    act(() => {
      result.current.clearAck("PLANT-A", "AHU-01");
    });

    const stored = JSON.parse(localStorage.getItem("device-acks") ?? "[]") as AckRecord[];
    expect(stored).toHaveLength(0);
  });
});

// =====================================================================
// pruneStaleAcks
// =====================================================================
describe("AckProvider - pruneStaleAcks", () => {
  it("removes acks where current status no longer matches forStatus", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Op1");
    });
    // AHU-01 is now OK, so the ALARM ack is stale
    act(() => {
      result.current.pruneStaleAcks({ "hvac-PLANT-A-AHU-01": "OK" });
    });

    expect(result.current.acks).toHaveLength(0);
  });

  it("keeps acks where current status still matches forStatus", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Op1");
    });
    // AHU-01 is still ALARM
    act(() => {
      result.current.pruneStaleAcks({ "hvac-PLANT-A-AHU-01": "ALARM" });
    });

    expect(result.current.acks).toHaveLength(1);
  });

  it("updates localStorage only when records are actually removed", () => {
    const { result } = renderHook(() => useAcks(), { wrapper });

    act(() => {
      result.current.addAck("PLANT-A", "AHU-01", "ALARM", "Op1");
    });

    const storedBefore = localStorage.getItem("device-acks");

    // Prune with matching status — nothing should be removed
    act(() => {
      result.current.pruneStaleAcks({ "hvac-PLANT-A-AHU-01": "ALARM" });
    });

    const storedAfter = localStorage.getItem("device-acks");
    // Content should be unchanged since nothing was pruned
    expect(storedAfter).toBe(storedBefore);
  });
});

// =====================================================================
// localStorage persistence & migration
// =====================================================================
describe("AckProvider - localStorage persistence", () => {
  it("loads existing acks from localStorage on mount", () => {
    const existingAck: AckRecord = {
      id: "hvac-PLANT-A-AHU-01-123",
      plantId: "PLANT-A",
      instanceId: "AHU-01",
      machineType: "hvac",
      forStatus: "ALARM",
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: "PreviousOperator",
    };
    localStorage.setItem("device-acks", JSON.stringify([existingAck]));

    const { result } = renderHook(() => useAcks(), { wrapper });

    expect(result.current.acks).toHaveLength(1);
    expect(result.current.acks[0].acknowledgedBy).toBe("PreviousOperator");
  });

  it("migrates from legacy hvac-acks key to device-acks", () => {
    const legacyAck = {
      id: "PLANT-A-AHU-01-123",
      plantId: "PLANT-A",
      ahuId: "AHU-01",
      forStatus: "ALARM",
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: "LegacyOperator",
    };
    localStorage.removeItem("device-acks");
    localStorage.setItem("hvac-acks", JSON.stringify([legacyAck]));

    const { result } = renderHook(() => useAcks(), { wrapper });

    expect(result.current.acks).toHaveLength(1);
    expect(result.current.acks[0].instanceId).toBe("AHU-01");
    expect(result.current.acks[0].machineType).toBe("hvac");
    // Legacy key should be removed
    expect(localStorage.getItem("hvac-acks")).toBeNull();
    // New key should exist
    expect(localStorage.getItem("device-acks")).not.toBeNull();
  });

  it("handles corrupted localStorage gracefully (returns empty array)", () => {
    localStorage.setItem("device-acks", "not-valid-json{{");

    const { result } = renderHook(() => useAcks(), { wrapper });

    expect(result.current.acks).toHaveLength(0);
  });
});
