/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/* ============================
   Types
   ============================ */

export interface HvacThresholds {
  temperatureWarning: number;
  temperatureAlarm: number;
  humidityWarning: number;
  humidityAlarm: number;
  disconnectTimeoutSeconds: number;
}

export interface HvacNotifications {
  soundEnabled: boolean;
  soundVolume: number;
}

export interface HvacGeneral {
  language: "es" | "en";
  refreshIntervalSeconds: number;
}

export interface HvacSettings {
  thresholds: HvacThresholds;
  notifications: HvacNotifications;
  general: HvacGeneral;
}

/* ============================
   Defaults
   ============================ */

export const DEFAULT_SETTINGS: HvacSettings = {
  thresholds: {
    temperatureWarning: 28,
    temperatureAlarm: 35,
    humidityWarning: 70,
    humidityAlarm: 85,
    disconnectTimeoutSeconds: 120,
  },
  notifications: {
    soundEnabled: true,
    soundVolume: 0.7,
  },
  general: {
    language: "es",
    refreshIntervalSeconds: 5,
  },
};

const STORAGE_KEY = "hvac-settings";

/* ============================
   Context
   ============================ */

interface SettingsContextValue {
  settings: HvacSettings;
  updateThresholds: (patch: Partial<HvacThresholds>) => void;
  updateNotifications: (patch: Partial<HvacNotifications>) => void;
  updateGeneral: (patch: Partial<HvacGeneral>) => void;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/* ============================
   Provider
   ============================ */

function loadFromStorage(): HvacSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      thresholds: { ...DEFAULT_SETTINGS.thresholds, ...parsed.thresholds },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...parsed.notifications,
      },
      general: { ...DEFAULT_SETTINGS.general, ...parsed.general },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<HvacSettings>(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateThresholds = useCallback((patch: Partial<HvacThresholds>) => {
    setSettings((prev) => ({
      ...prev,
      thresholds: { ...prev.thresholds, ...patch },
    }));
  }, []);

  const updateNotifications = useCallback(
    (patch: Partial<HvacNotifications>) => {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, ...patch },
      }));
    },
    [],
  );

  const updateGeneral = useCallback((patch: Partial<HvacGeneral>) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, ...patch },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateThresholds,
        updateNotifications,
        updateGeneral,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/* ============================
   Hook
   ============================ */

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
