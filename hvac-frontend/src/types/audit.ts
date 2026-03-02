export type AuditActionType =
  | "COMMAND_SENT"
  | "ALARM_ACKNOWLEDGED"
  | "ALARM_CLEARED"
  | "SETTINGS_CHANGED";

export interface AuditEntry {
  id: string;
  actionType: AuditActionType;
  actor?: string;
  details?: Record<string, unknown>;
  plantId?: string;
  ahuId?: string;
  timestamp: string;
}
