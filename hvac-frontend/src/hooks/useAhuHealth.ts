import { useSettings } from "@/context/SettingsContext";
import { getAhuHealth, type AhuHealthThresholds } from "@/domain/ahu/getAhuHealth";
import type { HvacTelemetry } from "@/types/telemetry";
import { useMemo } from "react";

/**
 * Hook que proporciona la función getAhuHealth configurada con los umbrales
 * del usuario. Esto asegura que todos los componentes usen la misma configuración
 * de umbrales de temperatura, humedad y tiempo de desconexión.
 */
export function useAhuHealth() {
  const { settings } = useSettings();

  // Memoizar los thresholds para evitar recrear el objeto en cada render
  const thresholds: AhuHealthThresholds = useMemo(
    () => ({
      disconnectTimeoutMs: settings.thresholds.disconnectTimeoutSeconds * 1000,
      temperatureWarning: settings.thresholds.temperatureWarning,
      temperatureAlarm: settings.thresholds.temperatureAlarm,
      humidityWarning: settings.thresholds.humidityWarning,
      humidityAlarm: settings.thresholds.humidityAlarm,
    }),
    [
      settings.thresholds.disconnectTimeoutSeconds,
      settings.thresholds.temperatureWarning,
      settings.thresholds.temperatureAlarm,
      settings.thresholds.humidityWarning,
      settings.thresholds.humidityAlarm,
    ],
  );

  // Retornar una función que use los thresholds configurados
  const getHealth = useMemo(
    () => (ahu: HvacTelemetry) => getAhuHealth(ahu, thresholds),
    [thresholds],
  );

  return getHealth;
}
