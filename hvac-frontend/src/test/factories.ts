import type { HvacTelemetry } from "@/types/telemetry";

/**
 * Creates a minimal valid HvacTelemetry object.
 * Timestamp defaults to NOW so getAhuHealth never returns DISCONNECTED by default.
 * Override timestamp explicitly to test disconnection scenarios.
 */
export function makeAhu(overrides: Partial<HvacTelemetry> = {}): HvacTelemetry {
  return {
    plantId: "PLANT-A",
    stationId: "AHU-01",
    timestamp: new Date().toISOString(),
    points: {
      temperature: { value: 22, unit: "°C", quality: "GOOD" },
      humidity: { value: 50, unit: "%", quality: "GOOD" },
      fan_status: { value: "ON" },
      airflow: { value: 500, unit: "m³/h", quality: "GOOD" },
      damper_position: { value: 75, unit: "%", quality: "GOOD" },
      power_status: { value: "ON" },
      filter_dp: { value: 100, unit: "Pa", quality: "GOOD" },
      status: { value: "OK" },
    },
    ...overrides,
  };
}

/**
 * Creates an AHU with status point set to ALARM.
 */
export function makeAlarmAhu(overrides: Partial<HvacTelemetry> = {}): HvacTelemetry {
  return makeAhu({
    ...overrides,
    points: {
      ...makeAhu().points,
      status: { value: "ALARM" },
      ...(overrides.points ?? {}),
    },
  });
}

/**
 * Creates an AHU with status point set to WARNING.
 */
export function makeWarningAhu(overrides: Partial<HvacTelemetry> = {}): HvacTelemetry {
  return makeAhu({
    ...overrides,
    points: {
      ...makeAhu().points,
      status: { value: "WARNING" },
      ...(overrides.points ?? {}),
    },
  });
}

/**
 * Creates an AHU that is DISCONNECTED (stale timestamp, 10 minutes in the past).
 */
export function makeDisconnectedAhu(overrides: Partial<HvacTelemetry> = {}): HvacTelemetry {
  return makeAhu({
    ...overrides,
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  });
}

/**
 * Creates an AHU with a BAD quality point (triggers WARNING via badPoints).
 */
export function makeBadQualityAhu(overrides: Partial<HvacTelemetry> = {}): HvacTelemetry {
  return makeAhu({
    ...overrides,
    points: {
      ...makeAhu().points,
      temperature: { value: 22, unit: "°C", quality: "BAD" },
      ...(overrides.points ?? {}),
    },
  });
}
