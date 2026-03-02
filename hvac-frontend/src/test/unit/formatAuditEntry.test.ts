import { describe, it, expect } from "vitest";
import {
  formatActionType,
  formatAuditDetails,
  formatAuditTimestamp,
} from "@/domain/audit/formatAuditEntry";
import type { AuditEntry } from "@/types/audit";

// ─── formatActionType ─────────────────────────────────────────────────────────

describe("formatActionType", () => {
  it("returns human-readable label for COMMAND_SENT", () => {
    expect(formatActionType("COMMAND_SENT")).toBe("Command Sent");
  });

  it("returns human-readable label for ALARM_ACKNOWLEDGED", () => {
    expect(formatActionType("ALARM_ACKNOWLEDGED")).toBe("Alarm Acknowledged");
  });

  it("returns human-readable label for ALARM_CLEARED", () => {
    expect(formatActionType("ALARM_CLEARED")).toBe("Alarm Cleared");
  });

  it("returns human-readable label for SETTINGS_CHANGED", () => {
    expect(formatActionType("SETTINGS_CHANGED")).toBe("Settings Changed");
  });
});

// ─── formatAuditDetails ───────────────────────────────────────────────────────

describe("formatAuditDetails", () => {
  it("returns command details for COMMAND_SENT with command + value", () => {
    const entry: AuditEntry = {
      id: "1",
      actionType: "COMMAND_SENT",
      timestamp: new Date().toISOString(),
      details: { command: "fan_status", value: "ON" },
    };
    expect(formatAuditDetails(entry)).toBe("fan_status → ON");
  });

  it("returns only command when value missing", () => {
    const entry: AuditEntry = {
      id: "1",
      actionType: "COMMAND_SENT",
      timestamp: new Date().toISOString(),
      details: { command: "damper_position" },
    };
    expect(formatAuditDetails(entry)).toBe("damper_position");
  });

  it("returns dash when no details", () => {
    const entry: AuditEntry = {
      id: "1",
      actionType: "COMMAND_SENT",
      timestamp: new Date().toISOString(),
    };
    expect(formatAuditDetails(entry)).toBe("—");
  });

  it("returns previous status for ALARM_ACKNOWLEDGED", () => {
    const entry: AuditEntry = {
      id: "1",
      actionType: "ALARM_ACKNOWLEDGED",
      timestamp: new Date().toISOString(),
      details: { previousStatus: "ALARM" },
    };
    expect(formatAuditDetails(entry)).toBe("Previous: ALARM");
  });

  it("returns changed key names for SETTINGS_CHANGED", () => {
    const entry: AuditEntry = {
      id: "1",
      actionType: "SETTINGS_CHANGED",
      timestamp: new Date().toISOString(),
      details: { temperatureWarning: 28, soundEnabled: true },
    };
    const result = formatAuditDetails(entry);
    expect(result).toContain("temperatureWarning");
    expect(result).toContain("soundEnabled");
  });
});

// ─── formatAuditTimestamp ─────────────────────────────────────────────────────

describe("formatAuditTimestamp", () => {
  it("returns a non-empty string for a valid ISO timestamp", () => {
    const result = formatAuditTimestamp("2024-06-15T10:30:00Z");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(5);
  });
});
