import type { HvacTelemetry, HvacPoint } from "@/types/telemetry";
import { STALE_THRESHOLD_MS } from "./constants";

export type AhuHealthStatus = "OK" | "WARNING" | "ALARM" | "DISCONNECTED";

export function getAhuHealth(ahu: HvacTelemetry): {
  status: AhuHealthStatus;
  badPoints: number;
  lastUpdate: Date;
} {
  const now = Date.now();
  const lastUpdate = new Date(ahu.timestamp);

  /* ---------------- Conteo de puntos con calidad BAD ---------------- */
  const points = Object.values(ahu.points) as HvacPoint[];
  const badPoints = points.filter((p) => p?.quality === "BAD").length;

  /* ---------------- 1️⃣ DISCONNECTED ---------------- */
  if (now - lastUpdate.getTime() > STALE_THRESHOLD_MS) {
    return {
      status: "DISCONNECTED",
      badPoints: 0, // No contamos puntos cuando está desconectado
      lastUpdate,
    };
  }

  const rawStatus = ahu.points.status?.value;

  /* ---------------- 2️⃣ ALARM operacional ---------------- */
  if (rawStatus === "ALARM") {
    return {
      status: "ALARM",
      badPoints, // ✅ Ahora contabiliza correctamente
      lastUpdate,
    };
  }

  /* ---------------- 3️⃣ BAD quality → WARNING ---------------- */
  if (badPoints > 0) {
    return {
      status: "WARNING",
      badPoints,
      lastUpdate,
    };
  }

  /* ---------------- 4️⃣ WARNING explícito ---------------- */
  if (rawStatus === "WARNING") {
    return {
      status: "WARNING",
      badPoints, // ✅ Ahora contabiliza correctamente
      lastUpdate,
    };
  }

  /* ---------------- 5️⃣ OK ---------------- */
  return {
    status: "OK",
    badPoints: 0, // ✅ Correcto: si está OK, no hay bad points
    lastUpdate,
  };
}
