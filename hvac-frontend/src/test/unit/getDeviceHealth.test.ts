import { describe, it, expect } from "vitest";
import { getDeviceHealth } from "@/domain/device/getDeviceHealth";

describe("getDeviceHealth", () => {
  // 1. Disconnected
  it("returns DISCONNECTED when isConnected is false", () => {
    const result = getDeviceHealth(
      { temperature: { value: 22, quality: "GOOD" } },
      { isConnected: false },
    );
    expect(result.status).toBe("DISCONNECTED");
    expect(result.badPoints).toBe(0);
  });

  // 2. Explicit ALARM from status point
  it("returns ALARM when status point is ALARM", () => {
    const result = getDeviceHealth({
      temperature: { value: 22, quality: "GOOD" },
      status: { value: "ALARM" },
    });
    expect(result.status).toBe("ALARM");
  });

  // 3. Threshold-based ALARM
  it("returns ALARM when a value exceeds alarm threshold", () => {
    const result = getDeviceHealth(
      { temperature: { value: 50, quality: "GOOD" } },
      { thresholds: { temperature: { warning: 30, alarm: 45 } } },
    );
    expect(result.status).toBe("ALARM");
  });

  // 4. Explicit WARNING from status point
  it("returns WARNING when status point is WARNING", () => {
    const result = getDeviceHealth({
      temperature: { value: 22, quality: "GOOD" },
      status: { value: "WARNING" },
    });
    expect(result.status).toBe("WARNING");
  });

  // 5. Threshold-based WARNING
  it("returns WARNING when a value exceeds warning but not alarm threshold", () => {
    const result = getDeviceHealth(
      { temperature: { value: 35, quality: "GOOD" } },
      { thresholds: { temperature: { warning: 30, alarm: 45 } } },
    );
    expect(result.status).toBe("WARNING");
  });

  // 6. BAD quality → WARNING
  it("returns WARNING when any point has BAD quality", () => {
    const result = getDeviceHealth({
      temperature: { value: 22, quality: "BAD" },
      humidity: { value: 50, quality: "GOOD" },
    });
    expect(result.status).toBe("WARNING");
    expect(result.badPoints).toBe(1);
  });

  // 7. OK
  it("returns OK when all points are normal", () => {
    const result = getDeviceHealth({
      temperature: { value: 22, quality: "GOOD" },
      humidity: { value: 50, quality: "GOOD" },
      status: { value: "OK" },
    });
    expect(result.status).toBe("OK");
    expect(result.badPoints).toBe(0);
  });

  // Multiple BAD quality points counted
  it("counts multiple BAD quality points", () => {
    const result = getDeviceHealth({
      temperature: { value: 22, quality: "BAD" },
      humidity: { value: 50, quality: "BAD" },
      airflow: { value: 100, quality: "GOOD" },
    });
    expect(result.status).toBe("WARNING");
    expect(result.badPoints).toBe(2);
  });

  // Threshold ALARM takes precedence over WARNING
  it("ALARM threshold takes precedence over WARNING threshold", () => {
    const result = getDeviceHealth(
      { temperature: { value: 50, quality: "GOOD" } },
      { thresholds: { temperature: { warning: 30, alarm: 45 } } },
    );
    expect(result.status).toBe("ALARM");
  });

  // No thresholds, no status point
  it("returns OK when no thresholds and no status point", () => {
    const result = getDeviceHealth({
      temperature: { value: 22, quality: "GOOD" },
    });
    expect(result.status).toBe("OK");
    expect(result.badPoints).toBe(0);
  });

  // Disconnected takes top priority
  it("DISCONNECTED takes priority over ALARM status", () => {
    const result = getDeviceHealth(
      { status: { value: "ALARM" } },
      { isConnected: false },
    );
    expect(result.status).toBe("DISCONNECTED");
  });
});
