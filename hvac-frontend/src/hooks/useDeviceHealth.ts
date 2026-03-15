import { useMemo } from "react";
import { useMachineTypes } from "@/context/MachineTypeContext";
import {
  getDeviceHealth,
  type DeviceHealthThresholds,
  type DeviceHealthResult,
} from "@/domain/device/getDeviceHealth";

/**
 * Hook that provides a health evaluation function for any machine type.
 * Extracts threshold configuration from the machine type's variable cardConfig.
 *
 * For HVAC, use useAhuHealth instead (it reads from SettingsContext).
 */
export function useDeviceHealth(machineType?: string) {
  const { machineTypes } = useMachineTypes();

  const thresholds = useMemo<DeviceHealthThresholds>(() => {
    if (!machineType) return {};

    const mt = machineTypes.find((m) => m.slug === machineType);
    if (!mt) return {};

    const th: DeviceHealthThresholds = {};
    for (const v of mt.variables) {
      const config = v.cardConfig as Record<string, unknown> | null;
      if (!config) continue;

      const warning =
        typeof config.warning === "number" ? config.warning : undefined;
      const alarm =
        typeof config.alarm === "number" ? config.alarm : undefined;

      if (warning != null || alarm != null) {
        th[v.key] = { warning, alarm };
      }
    }
    return th;
  }, [machineTypes, machineType]);

  const getHealth = useMemo(
    () =>
      (
        points: Record<
          string,
          { value: unknown; quality?: string; unit?: string }
        >,
        isConnected?: boolean,
      ): DeviceHealthResult =>
        getDeviceHealth(points, { isConnected, thresholds }),
    [thresholds],
  );

  return getHealth;
}
