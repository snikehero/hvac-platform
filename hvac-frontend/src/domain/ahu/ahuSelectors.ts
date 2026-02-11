import type { HvacTelemetry } from "@/types/telemetry"

import { getAhuHealth } from "./getAhuHealth"
import { getAhuStatus } from "@/pages/Dashboard/utils/hvacSelectors"
/**
 * Retorna el estado real operativo del AHU
 * (incluye lógica de desconexión)
 */
export function getAhuOperationalStatus(
  ahu: HvacTelemetry
) {
  const status = getAhuStatus(ahu)
  const health = getAhuHealth(ahu, status)
  return health.status
}

/**
 * Indica si el AHU está conectado
 */
export function isAhuConnected(
  ahu: HvacTelemetry
): boolean {
  return getAhuOperationalStatus(ahu) !== "DISCONNECTED"
}
