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

export interface GlobalNotifications {
  soundEnabled: boolean;
  soundVolume: number;
}

export interface GlobalSettings {
  language: "es" | "en";
  refreshIntervalSeconds: number;
  operatorName: string;
  disconnectTimeoutSeconds: number;
  notifications: GlobalNotifications;
}

/* ============================
   Defaults
   ============================ */

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  language: "es",
  refreshIntervalSeconds: 5,
  operatorName: "",
  disconnectTimeoutSeconds: 120,
  notifications: {
    soundEnabled: true,
    soundVolume: 0.7,
  },
};

const STORAGE_KEY = "platform-global-settings";
const LEGACY_HVAC_KEY = "hvac-settings";

/* ============================
   Context
   ============================ */

interface GlobalSettingsContextValue {
  settings: GlobalSettings;
  updateLanguage: (language: "es" | "en") => void;
  updateNotifications: (patch: Partial<GlobalNotifications>) => void;
  updateOperatorName: (name: string) => void;
  updateDisconnectTimeout: (seconds: number) => void;
  updateRefreshInterval: (seconds: number) => void;
}

const GlobalSettingsContext = createContext<GlobalSettingsContextValue | null>(
  null,
);

/* ============================
   Migration + Loading
   ============================ */

function migrateFromLegacy(): GlobalSettings | null {
  try {
    const raw = localStorage.getItem(LEGACY_HVAC_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      language: parsed.general?.language ?? DEFAULT_GLOBAL_SETTINGS.language,
      refreshIntervalSeconds:
        parsed.general?.refreshIntervalSeconds ??
        DEFAULT_GLOBAL_SETTINGS.refreshIntervalSeconds,
      operatorName:
        parsed.general?.operatorName ?? DEFAULT_GLOBAL_SETTINGS.operatorName,
      disconnectTimeoutSeconds:
        parsed.thresholds?.disconnectTimeoutSeconds ??
        DEFAULT_GLOBAL_SETTINGS.disconnectTimeoutSeconds,
      notifications: {
        ...DEFAULT_GLOBAL_SETTINGS.notifications,
        ...parsed.notifications,
      },
    };
  } catch {
    return null;
  }
}

function loadFromStorage(): GlobalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_GLOBAL_SETTINGS, ...parsed };
    }

    // Migration: first load — extract from legacy hvac-settings
    const migrated = migrateFromLegacy();
    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    return DEFAULT_GLOBAL_SETTINGS;
  } catch {
    return DEFAULT_GLOBAL_SETTINGS;
  }
}

/* ============================
   Provider
   ============================ */

export function GlobalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateLanguage = useCallback((language: "es" | "en") => {
    setSettings((prev) => ({ ...prev, language }));
  }, []);

  const updateNotifications = useCallback(
    (patch: Partial<GlobalNotifications>) => {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, ...patch },
      }));
    },
    [],
  );

  const updateOperatorName = useCallback((operatorName: string) => {
    setSettings((prev) => ({ ...prev, operatorName }));
  }, []);

  const updateDisconnectTimeout = useCallback(
    (disconnectTimeoutSeconds: number) => {
      setSettings((prev) => ({ ...prev, disconnectTimeoutSeconds }));
    },
    [],
  );

  const updateRefreshInterval = useCallback(
    (refreshIntervalSeconds: number) => {
      setSettings((prev) => ({ ...prev, refreshIntervalSeconds }));
    },
    [],
  );

  return (
    <GlobalSettingsContext.Provider
      value={{
        settings,
        updateLanguage,
        updateNotifications,
        updateOperatorName,
        updateDisconnectTimeout,
        updateRefreshInterval,
      }}
    >
      {children}
    </GlobalSettingsContext.Provider>
  );
}

/* ============================
   Hook
   ============================ */

export function useGlobalSettings() {
  const ctx = useContext(GlobalSettingsContext);
  if (!ctx) {
    throw new Error(
      "useGlobalSettings must be used within a GlobalSettingsProvider",
    );
  }
  return ctx;
}
