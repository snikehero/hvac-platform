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

export type DashboardWidgetId =
  | "hero-system-status"
  | "plant-activity-block"
  | "kpi-widgets";

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  visible: boolean;
}

export interface HvacDashboard {
  widgets: DashboardWidgetConfig[];
}

export interface HvacSettings {
  thresholds: HvacThresholds;
  notifications: HvacNotifications;
  general: HvacGeneral;
  dashboard: HvacDashboard;
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
  dashboard: {
    widgets: [
      { id: "hero-system-status", visible: true },
      { id: "plant-activity-block", visible: true },
      { id: "kpi-widgets", visible: true },
    ],
  },
};

const STORAGE_KEY = "hvac-settings";

const DEFAULT_WIDGET_IDS: DashboardWidgetId[] = [
  "hero-system-status",
  "plant-activity-block",
  "kpi-widgets",
];

/* ============================
   Context
   ============================ */

interface SettingsContextValue {
  settings: HvacSettings;
  updateThresholds: (patch: Partial<HvacThresholds>) => void;
  updateNotifications: (patch: Partial<HvacNotifications>) => void;
  updateGeneral: (patch: Partial<HvacGeneral>) => void;
  updateDashboard: (dashboard: HvacDashboard) => void;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/* ============================
   Provider
   ============================ */

function mergeDashboard(stored: unknown): HvacDashboard {
  if (
    !stored ||
    typeof stored !== "object" ||
    !Array.isArray((stored as HvacDashboard).widgets)
  ) {
    return DEFAULT_SETTINGS.dashboard;
  }

  const storedWidgets = (stored as HvacDashboard).widgets;
  const storedIds = storedWidgets.map((w) => w.id);

  // Check that stored array contains exactly the default IDs (no extras, no missing)
  const hasAllIds =
    DEFAULT_WIDGET_IDS.every((id) => storedIds.includes(id)) &&
    storedIds.every((id) => DEFAULT_WIDGET_IDS.includes(id as DashboardWidgetId));

  if (hasAllIds) {
    // Preserve user order; keep stored visibility
    return { widgets: storedWidgets as DashboardWidgetConfig[] };
  }

  // Fall back: use default order, re-apply stored visibility where IDs match
  const visibilityMap = new Map(storedWidgets.map((w) => [w.id, w.visible]));
  return {
    widgets: DEFAULT_SETTINGS.dashboard.widgets.map((w) => ({
      id: w.id,
      visible: visibilityMap.has(w.id) ? (visibilityMap.get(w.id) as boolean) : w.visible,
    })),
  };
}

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
      dashboard: mergeDashboard(parsed.dashboard),
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

  const updateDashboard = useCallback((dashboard: HvacDashboard) => {
    setSettings((prev) => ({ ...prev, dashboard }));
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
        updateDashboard,
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
