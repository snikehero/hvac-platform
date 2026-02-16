import type { HvacTelemetry, HvacPoint } from "@/types/telemetry";
import { STALE_THRESHOLD_MS } from "./constants";

export type AhuHealthStatus = "OK" | "WARNING" | "ALARM" | "DISCONNECTED";

export interface AhuHealthThresholds {
  disconnectTimeoutMs?: number;
  temperatureWarning?: number;
  temperatureAlarm?: number;
  humidityWarning?: number;
  humidityAlarm?: number;
}

export function getAhuHealth(
  ahu: HvacTelemetry,
  thresholds?: AhuHealthThresholds,
): {
  status: AhuHealthStatus;
  badPoints: number;
  lastUpdate: Date;
} {
  const now = Date.now();
  const lastUpdate = new Date(ahu.timestamp);

  const disconnectMs =
    thresholds?.disconnectTimeoutMs ?? STALE_THRESHOLD_MS;

  /* ---------------- Conteo de puntos con calidad BAD ---------------- */
  const points = Object.values(ahu.points) as HvacPoint[];
  const badPoints = points.filter((p) => p?.quality === "BAD").length;

  /* ---------------- 1️⃣ DISCONNECTED ---------------- */
  if (now - lastUpdate.getTime() > disconnectMs) {
    return {
      status: "DISCONNECTED",
      badPoints: 0,
      lastUpdate,
    };
  }

  const rawStatus = ahu.points.status?.value;

  /* ---------------- 2️⃣ ALARM operacional ---------------- */
  if (rawStatus === "ALARM") {
    return { status: "ALARM", badPoints, lastUpdate };
  }

  /* ---------------- 3️⃣ Umbrales de temperatura/humedad → ALARM/WARNING --- */
  const temp = typeof ahu.points.temperature?.value === "number"
    ? ahu.points.temperature.value
    : undefined;
  const hum = typeof ahu.points.humidity?.value === "number"
    ? ahu.points.humidity.value
    : undefined;

  if (
    (thresholds?.temperatureAlarm != null && temp != null && temp >= thresholds.temperatureAlarm) ||
    (thresholds?.humidityAlarm != null && hum != null && hum >= thresholds.humidityAlarm)
  ) {
    return { status: "ALARM", badPoints, lastUpdate };
  }

  if (
    (thresholds?.temperatureWarning != null && temp != null && temp >= thresholds.temperatureWarning) ||
    (thresholds?.humidityWarning != null && hum != null && hum >= thresholds.humidityWarning)
  ) {
    return { status: "WARNING", badPoints, lastUpdate };
  }

  /* ---------------- 4️⃣ BAD quality → WARNING ---------------- */
  if (badPoints > 0) {
    return { status: "WARNING", badPoints, lastUpdate };
  }

  /* ---------------- 5️⃣ WARNING explícito ---------------- */
  if (rawStatus === "WARNING") {
    return { status: "WARNING", badPoints, lastUpdate };
  }

  /* ---------------- 6️⃣ OK ---------------- */
  return { status: "OK", badPoints: 0, lastUpdate };
}
