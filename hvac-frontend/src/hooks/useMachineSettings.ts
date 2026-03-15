import { useCallback, useMemo, useState, useEffect } from "react";
import { useMachineTypes } from "@/context/MachineTypeContext";

interface ThresholdConfig {
  warning?: number;
  alarm?: number;
}

interface NotificationConfig {
  soundEnabled: boolean;
  soundVolume: number;
}

export interface MachineTypeSettings {
  thresholds: Record<string, ThresholdConfig>;
  notifications: NotificationConfig;
}

function getStorageKey(machineType: string): string {
  return `machine-settings-${machineType}`;
}

/**
 * Hook for per-machine-type settings stored in localStorage.
 * Defaults are derived from the machine type's variable cardConfig.
 */
export function useMachineSettings(machineType: string) {
  const { machineTypes } = useMachineTypes();

  const defaults = useMemo<MachineTypeSettings>(() => {
    const mt = machineTypes.find((m) => m.slug === machineType);
    const thresholds: Record<string, ThresholdConfig> = {};

    if (mt) {
      for (const v of mt.variables) {
        const config = v.cardConfig as Record<string, unknown> | null;
        if (!config) continue;
        const warning = typeof config.warning === "number" ? config.warning : undefined;
        const alarm = typeof config.alarm === "number" ? config.alarm : undefined;
        if (warning != null || alarm != null) {
          thresholds[v.key] = { warning, alarm };
        }
      }
    }

    return {
      thresholds,
      notifications: { soundEnabled: true, soundVolume: 0.5 },
    };
  }, [machineTypes, machineType]);

  const [settings, setSettings] = useState<MachineTypeSettings>(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(machineType));
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<MachineTypeSettings>;
        return {
          thresholds: { ...defaults.thresholds, ...parsed.thresholds },
          notifications: { ...defaults.notifications, ...parsed.notifications },
        };
      }
    } catch { /* ignore */ }
    return defaults;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey(machineType), JSON.stringify(settings));
  }, [settings, machineType]);

  // Re-merge if defaults change (e.g., machine type re-fetched)
  useEffect(() => {
    setSettings((prev) => ({
      thresholds: { ...defaults.thresholds, ...prev.thresholds },
      notifications: { ...defaults.notifications, ...prev.notifications },
    }));
  }, [defaults]);

  const updateThresholds = useCallback(
    (varKey: string, patch: Partial<ThresholdConfig>) => {
      setSettings((prev) => ({
        ...prev,
        thresholds: {
          ...prev.thresholds,
          [varKey]: { ...prev.thresholds[varKey], ...patch },
        },
      }));
    },
    [],
  );

  const updateNotifications = useCallback(
    (patch: Partial<NotificationConfig>) => {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, ...patch },
      }));
    },
    [],
  );

  const resetToDefaults = useCallback(() => {
    setSettings(defaults);
    localStorage.removeItem(getStorageKey(machineType));
  }, [defaults, machineType]);

  return {
    settings,
    updateThresholds,
    updateNotifications,
    resetToDefaults,
    defaults,
  };
}
