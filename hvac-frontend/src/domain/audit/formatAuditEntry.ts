import type { AuditEntry, AuditActionType } from "@/types/audit";

const ACTION_LABELS: Record<AuditActionType, string> = {
  COMMAND_SENT: "Command Sent",
  ALARM_ACKNOWLEDGED: "Alarm Acknowledged",
  ALARM_CLEARED: "Alarm Cleared",
  SETTINGS_CHANGED: "Settings Changed",
};

/**
 * Returns a human-readable label for an action type.
 */
export function formatActionType(actionType: AuditActionType): string {
  return ACTION_LABELS[actionType] ?? actionType;
}

/**
 * Format the details object of an audit entry into a short descriptive string.
 */
export function formatAuditDetails(entry: AuditEntry): string {
  const d = entry.details ?? {};

  switch (entry.actionType) {
    case "COMMAND_SENT": {
      const cmd = d["command"] as string | undefined;
      const value = d["value"] as string | number | undefined;
      if (cmd && value !== undefined) return `${cmd} → ${String(value)}`;
      if (cmd) return cmd;
      return "—";
    }
    case "ALARM_ACKNOWLEDGED":
    case "ALARM_CLEARED": {
      const status = d["previousStatus"] as string | undefined;
      if (status) return `Previous: ${status}`;
      return "—";
    }
    case "SETTINGS_CHANGED": {
      const keys = Object.keys(d);
      if (keys.length > 0) return keys.join(", ");
      return "—";
    }
    default:
      return "—";
  }
}

/**
 * Format a timestamp string for display.
 */
export function formatAuditTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
