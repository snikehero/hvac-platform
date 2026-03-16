import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  GlobalSettingsProvider,
  useGlobalSettings,
} from "@/context/GlobalSettingsContext";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <GlobalSettingsProvider>{children}</GlobalSettingsProvider>
);

beforeEach(() => {
  localStorage.clear();
});

describe("GlobalSettingsContext", () => {
  it("provides default settings", () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper });
    expect(result.current.settings.language).toBe("es");
    expect(result.current.settings.refreshIntervalSeconds).toBe(5);
    expect(result.current.settings.operatorName).toBe("");
    expect(result.current.settings.disconnectTimeoutSeconds).toBe(120);
    expect(result.current.settings.notifications.soundEnabled).toBe(true);
    expect(result.current.settings.notifications.soundVolume).toBe(0.7);
  });

  it("updateLanguage changes language to en", () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper });

    act(() => {
      result.current.updateLanguage("en");
    });

    expect(result.current.settings.language).toBe("en");
  });

  it("updateLanguage changes language back to es", () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper });

    act(() => {
      result.current.updateLanguage("en");
    });
    act(() => {
      result.current.updateLanguage("es");
    });

    expect(result.current.settings.language).toBe("es");
  });

  it("persists settings to localStorage", () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper });

    act(() => {
      result.current.updateLanguage("en");
    });

    const stored = JSON.parse(
      localStorage.getItem("platform-global-settings")!,
    );
    expect(stored.language).toBe("en");
  });

  it("loads settings from localStorage on mount", () => {
    localStorage.setItem(
      "platform-global-settings",
      JSON.stringify({ language: "en", refreshIntervalSeconds: 10 }),
    );

    const { result } = renderHook(() => useGlobalSettings(), { wrapper });
    expect(result.current.settings.language).toBe("en");
    expect(result.current.settings.refreshIntervalSeconds).toBe(10);
  });

  it("migrates from legacy hvac-settings key", () => {
    localStorage.setItem(
      "hvac-settings",
      JSON.stringify({
        general: { language: "en", operatorName: "JD" },
        thresholds: { disconnectTimeoutSeconds: 60 },
        notifications: { soundEnabled: false },
      }),
    );

    const { result } = renderHook(() => useGlobalSettings(), { wrapper });
    expect(result.current.settings.language).toBe("en");
    expect(result.current.settings.operatorName).toBe("JD");
    expect(result.current.settings.disconnectTimeoutSeconds).toBe(60);
    expect(result.current.settings.notifications.soundEnabled).toBe(false);
  });

  it("updateNotifications patches partial notifications", () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper });

    act(() => {
      result.current.updateNotifications({ soundVolume: 0.3 });
    });

    expect(result.current.settings.notifications.soundVolume).toBe(0.3);
    expect(result.current.settings.notifications.soundEnabled).toBe(true);
  });

  it("updateOperatorName updates the operator name", () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper });

    act(() => {
      result.current.updateOperatorName("Jane D.");
    });

    expect(result.current.settings.operatorName).toBe("Jane D.");
  });

  it("updateDisconnectTimeout updates the timeout", () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper });

    act(() => {
      result.current.updateDisconnectTimeout(60);
    });

    expect(result.current.settings.disconnectTimeoutSeconds).toBe(60);
  });

  it("updateRefreshInterval updates the refresh interval", () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper });

    act(() => {
      result.current.updateRefreshInterval(30);
    });

    expect(result.current.settings.refreshIntervalSeconds).toBe(30);
  });

  it("throws when used outside of provider", () => {
    expect(() => {
      renderHook(() => useGlobalSettings());
    }).toThrow("useGlobalSettings must be used within a GlobalSettingsProvider");
  });
});
