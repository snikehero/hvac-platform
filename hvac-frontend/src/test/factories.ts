import type { MachineTelemetry } from "@/types/machine-type";

/**
 * Creates a minimal valid MachineTelemetry object for HVAC.
 * Timestamp defaults to NOW so health evaluation never returns DISCONNECTED by default.
 */
export function makeMachineInstance(overrides: Partial<MachineTelemetry> = {}): MachineTelemetry {
  return {
    machineType: "hvac",
    plantId: "PLANT-A",
    stationId: "AHU-01",
    timestamp: new Date().toISOString(),
    points: {
      temperature: { value: 22, unit: "°C", quality: "GOOD" },
      humidity: { value: 50, unit: "%", quality: "GOOD" },
      fan_status: { value: true },
      airflow: { value: 500, unit: "m³/h", quality: "GOOD" },
      damper_position: { value: 75, unit: "%", quality: "GOOD" },
      power_status: { value: true },
      filter_dp: { value: 100, unit: "Pa", quality: "GOOD" },
      status: { value: "OK" },
    },
    ...overrides,
  };
}

/**
 * Creates a machine instance with status point set to ALARM.
 */
export function makeAlarmInstance(overrides: Partial<MachineTelemetry> = {}): MachineTelemetry {
  return makeMachineInstance({
    ...overrides,
    points: {
      ...makeMachineInstance().points,
      status: { value: "ALARM" },
      ...(overrides.points ?? {}),
    },
  });
}

/**
 * Creates a machine instance with status point set to WARNING.
 */
export function makeWarningInstance(overrides: Partial<MachineTelemetry> = {}): MachineTelemetry {
  return makeMachineInstance({
    ...overrides,
    points: {
      ...makeMachineInstance().points,
      status: { value: "WARNING" },
      ...(overrides.points ?? {}),
    },
  });
}
