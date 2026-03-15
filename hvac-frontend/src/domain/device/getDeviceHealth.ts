export type DeviceHealthStatus = "OK" | "WARNING" | "ALARM" | "DISCONNECTED";

export interface DeviceHealthThresholds {
  [pointKey: string]: {
    warning?: number;
    alarm?: number;
  };
}

export interface DeviceHealthResult {
  status: DeviceHealthStatus;
  badPoints: number;
}

/**
 * Evaluate the health status of any device based on its points.
 *
 * Priority:
 * 1. isConnected === false → DISCONNECTED
 * 2. Explicit "status" point with value "ALARM" → ALARM
 * 3. Any numeric value exceeds alarm threshold → ALARM
 * 4. Explicit "status" point with value "WARNING" → WARNING
 * 5. Any numeric value exceeds warning threshold → WARNING
 * 6. Any point with quality "BAD" → WARNING
 * 7. OK
 */
export function getDeviceHealth(
  points: Record<string, { value: unknown; quality?: string; unit?: string }>,
  options?: {
    isConnected?: boolean;
    thresholds?: DeviceHealthThresholds;
  },
): DeviceHealthResult {
  // 1. Disconnected
  if (options?.isConnected === false) {
    return { status: "DISCONNECTED", badPoints: 0 };
  }

  const entries = Object.entries(points);
  const statusPoint = points["status"];

  // 2. Explicit ALARM from status point
  if (statusPoint?.value === "ALARM") {
    const badPoints = entries.filter(([, p]) => p.quality === "BAD").length;
    return { status: "ALARM", badPoints };
  }

  // 3. Threshold-based ALARM
  if (options?.thresholds) {
    for (const [key, th] of Object.entries(options.thresholds)) {
      const point = points[key];
      if (point && typeof point.value === "number" && th.alarm != null) {
        if (point.value >= th.alarm) {
          const badPoints = entries.filter(([, p]) => p.quality === "BAD").length;
          return { status: "ALARM", badPoints };
        }
      }
    }
  }

  // 4. Explicit WARNING from status point
  if (statusPoint?.value === "WARNING") {
    const badPoints = entries.filter(([, p]) => p.quality === "BAD").length;
    return { status: "WARNING", badPoints };
  }

  // 5. Threshold-based WARNING
  if (options?.thresholds) {
    for (const [key, th] of Object.entries(options.thresholds)) {
      const point = points[key];
      if (point && typeof point.value === "number" && th.warning != null) {
        if (point.value >= th.warning) {
          const badPoints = entries.filter(([, p]) => p.quality === "BAD").length;
          return { status: "WARNING", badPoints };
        }
      }
    }
  }

  // 6. BAD quality → WARNING
  const badPoints = entries.filter(([, p]) => p.quality === "BAD").length;
  if (badPoints > 0) {
    return { status: "WARNING", badPoints };
  }

  // 7. OK
  return { status: "OK", badPoints: 0 };
}
