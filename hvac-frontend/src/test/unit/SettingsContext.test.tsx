import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  SettingsProvider,
  useSettings,
  DEFAULT_SETTINGS,
} from "@/context/SettingsContext";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

// =====================================================================
// Default settings
// =====================================================================
describe("SettingsProvider - defaults", () => {
  it("uses DEFAULT_SETTINGS when localStorage is empty", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings.thresholds).toEqual(DEFAULT_SETTINGS.thresholds);
    expect(result.current.settings.general).toEqual(DEFAULT_SETTINGS.general);
    expect(result.current.settings.notifications).toEqual(DEFAULT_SETTINGS.notifications);
  });
});

// =====================================================================
// updateThresholds
// =====================================================================
describe("SettingsProvider - updateThresholds", () => {
  it("merges patch with existing thresholds (partial update)", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateThresholds({ temperatureAlarm: 40 });
    });

    expect(result.current.settings.thresholds.temperatureAlarm).toBe(40);
    // Other thresholds remain unchanged
    expect(result.current.settings.thresholds.temperatureWarning).toBe(DEFAULT_SETTINGS.thresholds.temperatureWarning);
    expect(result.current.settings.thresholds.humidityAlarm).toBe(DEFAULT_SETTINGS.thresholds.humidityAlarm);
  });

  it("persists changes to localStorage", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateThresholds({ temperatureAlarm: 40 });
    });

    const stored = JSON.parse(localStorage.getItem("hvac-settings") ?? "{}");
    expect(stored.thresholds.temperatureAlarm).toBe(40);
  });

  it("does not mutate other settings sections", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateThresholds({ temperatureAlarm: 40 });
    });

    expect(result.current.settings.general).toEqual(DEFAULT_SETTINGS.general);
    expect(result.current.settings.notifications).toEqual(DEFAULT_SETTINGS.notifications);
  });
});

// =====================================================================
// resetToDefaults
// =====================================================================
describe("SettingsProvider - resetToDefaults", () => {
  it("restores all settings to DEFAULT_SETTINGS values", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateThresholds({ temperatureAlarm: 99 });
      result.current.updateGeneral({ operatorName: "CustomOperator" });
    });
    act(() => {
      result.current.resetToDefaults();
    });

    expect(result.current.settings.thresholds.temperatureAlarm).toBe(DEFAULT_SETTINGS.thresholds.temperatureAlarm);
    expect(result.current.settings.general.operatorName).toBe(DEFAULT_SETTINGS.general.operatorName);
  });
});

// =====================================================================
// localStorage loading
// =====================================================================
describe("SettingsProvider - localStorage loading", () => {
  it("merges stored thresholds over defaults on mount", () => {
    localStorage.setItem(
      "hvac-settings",
      JSON.stringify({ thresholds: { temperatureAlarm: 50 } }),
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    // Stored value merged
    expect(result.current.settings.thresholds.temperatureAlarm).toBe(50);
    // Other thresholds come from defaults
    expect(result.current.settings.thresholds.temperatureWarning).toBe(DEFAULT_SETTINGS.thresholds.temperatureWarning);
  });

  it("handles corrupted JSON gracefully (falls back to defaults)", () => {
    localStorage.setItem("hvac-settings", "not-valid-json{{");

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings.thresholds).toEqual(DEFAULT_SETTINGS.thresholds);
  });
});

// =====================================================================
// mergeDashboard behavior
// =====================================================================
describe("SettingsProvider - mergeDashboard behavior", () => {
  it("preserves stored widget order when all IDs match", () => {
    const reversedWidgets = [
      { id: "plant-heat-map", visible: true },
      { id: "kpi-widgets", visible: false },
      { id: "plant-activity-block", visible: true },
      { id: "hero-system-status", visible: false },
    ];
    localStorage.setItem(
      "hvac-settings",
      JSON.stringify({ dashboard: { widgets: reversedWidgets } }),
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings.dashboard.widgets[0].id).toBe("plant-heat-map");
    expect(result.current.settings.dashboard.widgets[3].id).toBe("hero-system-status");
  });

  it("preserves stored visibility values", () => {
    const widgets = DEFAULT_SETTINGS.dashboard.widgets.map((w) => ({
      ...w,
      visible: false, // all hidden
    }));
    localStorage.setItem(
      "hvac-settings",
      JSON.stringify({ dashboard: { widgets } }),
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    result.current.settings.dashboard.widgets.forEach((w) => {
      expect(w.visible).toBe(false);
    });
  });

  it("falls back to default order when stored IDs are incomplete", () => {
    // Only 2 of 4 widgets stored
    const incompleteWidgets = [
      { id: "hero-system-status", visible: false },
      { id: "kpi-widgets", visible: true },
    ];
    localStorage.setItem(
      "hvac-settings",
      JSON.stringify({ dashboard: { widgets: incompleteWidgets } }),
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    // Falls back to default order (4 widgets)
    expect(result.current.settings.dashboard.widgets).toHaveLength(4);
    expect(result.current.settings.dashboard.widgets[0].id).toBe(DEFAULT_SETTINGS.dashboard.widgets[0].id);
    // Stored visibility for hero-system-status should be preserved
    const hero = result.current.settings.dashboard.widgets.find((w) => w.id === "hero-system-status");
    expect(hero?.visible).toBe(false);
  });

  it("falls back to defaults when stored dashboard is null", () => {
    localStorage.setItem(
      "hvac-settings",
      JSON.stringify({ dashboard: null }),
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings.dashboard).toEqual(DEFAULT_SETTINGS.dashboard);
  });
});
