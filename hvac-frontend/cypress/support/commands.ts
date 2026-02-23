// Custom Cypress commands for the HVAC Platform

/**
 * Seeds localStorage with a pre-acknowledged alarm/warning record.
 * Useful for testing the ACKNOWLEDGED tab without needing to click through the flow.
 */
Cypress.Commands.add(
  "seedAck",
  (plantId: string, ahuId: string, forStatus: "ALARM" | "WARNING") => {
    const record = {
      id: `${plantId}-${ahuId}-${Date.now()}`,
      plantId,
      ahuId,
      forStatus,
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: "TestOperator",
    };
    localStorage.setItem("hvac-acks", JSON.stringify([record]));
  },
);

/**
 * Seeds localStorage with custom settings.
 * Merges provided overrides with sensible defaults so tests only need to
 * specify what they care about.
 */
Cypress.Commands.add("seedSettings", (overrides: Record<string, unknown>) => {
  const defaults = {
    thresholds: {
      temperatureWarning: 28,
      temperatureAlarm: 35,
      humidityWarning: 70,
      humidityAlarm: 85,
      disconnectTimeoutSeconds: 120,
    },
    notifications: { soundEnabled: false, soundVolume: 0 },
    general: {
      language: "es",
      refreshIntervalSeconds: 5,
      operatorName: "TestOperator",
    },
    dashboard: {
      widgets: [
        { id: "hero-system-status", visible: true },
        { id: "plant-activity-block", visible: true },
        { id: "kpi-widgets", visible: true },
        { id: "plant-heat-map", visible: true },
      ],
    },
  };

  const merged = { ...defaults, ...overrides };
  localStorage.setItem("hvac-settings", JSON.stringify(merged));
});

declare global {
  namespace Cypress {
    interface Chainable {
      seedAck(
        plantId: string,
        ahuId: string,
        forStatus: "ALARM" | "WARNING",
      ): Chainable<void>;
      seedSettings(overrides: Record<string, unknown>): Chainable<void>;
    }
  }
}
