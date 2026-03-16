import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeviceConnectivity } from "@/hooks/useDeviceConnectivity";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDeviceConnectivity — initial state", () => {
  it("starts with empty connectionStatus", () => {
    const { result } = renderHook(() => useDeviceConnectivity(true));
    expect(result.current.connectionStatus).toEqual({});
  });

  it("isConnected returns false for unknown device", () => {
    const { result } = renderHook(() => useDeviceConnectivity(true));
    expect(result.current.isConnected("hvac-Plant1-AHU1")).toBe(false);
  });
});

describe("useDeviceConnectivity — updateLastSeen", () => {
  it("marks device as connected after updateLastSeen", () => {
    const { result } = renderHook(() => useDeviceConnectivity(true));

    act(() => {
      result.current.updateLastSeen("hvac-Plant1-AHU1");
    });

    expect(result.current.isConnected("hvac-Plant1-AHU1")).toBe(true);
    expect(result.current.connectionStatus["hvac-Plant1-AHU1"].isConnected).toBe(true);
  });

  it("records a lastSeen timestamp", () => {
    const before = Date.now();
    const { result } = renderHook(() => useDeviceConnectivity(true));

    act(() => {
      result.current.updateLastSeen("hvac-Plant1-AHU1");
    });

    const after = Date.now();
    const { lastSeen } = result.current.connectionStatus["hvac-Plant1-AHU1"];
    expect(lastSeen).toBeGreaterThanOrEqual(before);
    expect(lastSeen).toBeLessThanOrEqual(after);
  });

  it("tracks multiple devices independently", () => {
    const { result } = renderHook(() => useDeviceConnectivity(true));

    act(() => {
      result.current.updateLastSeen("hvac-Plant1-AHU1");
      result.current.updateLastSeen("hvac-Plant1-AHU2");
    });

    expect(result.current.isConnected("hvac-Plant1-AHU1")).toBe(true);
    expect(result.current.isConnected("hvac-Plant1-AHU2")).toBe(true);
  });
});

describe("useDeviceConnectivity — markAllAsDisconnected", () => {
  it("marks all tracked devices as disconnected", () => {
    const { result } = renderHook(() => useDeviceConnectivity(true));

    act(() => {
      result.current.updateLastSeen("hvac-Plant1-AHU1");
      result.current.updateLastSeen("hvac-Plant1-AHU2");
    });

    act(() => {
      result.current.markAllAsDisconnected();
    });

    expect(result.current.isConnected("hvac-Plant1-AHU1")).toBe(false);
    expect(result.current.isConnected("hvac-Plant1-AHU2")).toBe(false);
  });
});

describe("useDeviceConnectivity — stale device timeout", () => {
  it("marks device disconnected after timeout elapses", () => {
    const TIMEOUT = 10_000;
    const INTERVAL = 2_000;

    const { result } = renderHook(() =>
      useDeviceConnectivity(true, undefined, TIMEOUT, INTERVAL),
    );

    act(() => {
      result.current.updateLastSeen("hvac-Plant1-AHU1");
    });

    // Advance time beyond the disconnect timeout
    act(() => {
      vi.advanceTimersByTime(TIMEOUT + INTERVAL + 100);
    });

    expect(result.current.isConnected("hvac-Plant1-AHU1")).toBe(false);
  });

  it("calls onDisconnected callback when device goes stale", () => {
    const TIMEOUT = 10_000;
    const INTERVAL = 2_000;
    const onDisconnected = vi.fn();

    const { result } = renderHook(() =>
      useDeviceConnectivity(true, onDisconnected, TIMEOUT, INTERVAL),
    );

    act(() => {
      result.current.updateLastSeen("hvac-Plant1-AHU1");
    });

    act(() => {
      vi.advanceTimersByTime(TIMEOUT + INTERVAL + 100);
    });

    // onDisconnected is called via setTimeout(0) — advance by 1ms to flush it
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(onDisconnected).toHaveBeenCalledWith("hvac-Plant1-AHU1");
  });

  it("does NOT run connectivity check when WebSocket is disconnected", () => {
    const TIMEOUT = 10_000;
    const INTERVAL = 2_000;

    const { result } = renderHook(() =>
      useDeviceConnectivity(false, undefined, TIMEOUT, INTERVAL),
    );

    act(() => {
      result.current.updateLastSeen("hvac-Plant1-AHU1");
    });

    act(() => {
      vi.advanceTimersByTime(TIMEOUT + INTERVAL + 100);
    });

    // Should still be connected since the check doesn't run without WebSocket
    expect(result.current.isConnected("hvac-Plant1-AHU1")).toBe(true);
  });
});
