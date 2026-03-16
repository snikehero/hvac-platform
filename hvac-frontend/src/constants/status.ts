import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  WifiOff,
  Wifi,
} from "lucide-react";

export type DeviceStatus = "OK" | "WARNING" | "ALARM" | "DISCONNECTED";
export type EventType = "OK" | "WARNING" | "ALARM" | "DISCONNECTED" | "RECONNECTED";

/** bg-* class for status indicator dots */
export const STATUS_DOT: Record<DeviceStatus, string> = {
  OK: "bg-green-500",
  WARNING: "bg-yellow-500",
  ALARM: "bg-destructive",
  DISCONNECTED: "bg-muted-foreground",
};

/** text-* class for status-colored text */
export const STATUS_COLOR: Record<DeviceStatus, string> = {
  OK: "text-green-500",
  WARNING: "text-yellow-500",
  ALARM: "text-destructive",
  DISCONNECTED: "text-muted-foreground",
};

/** shadcn/ui Badge variant per device status */
export const STATUS_BADGE_VARIANT: Record<
  DeviceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  OK: "default",
  WARNING: "secondary",
  ALARM: "destructive",
  DISCONNECTED: "outline",
};

/** Lucide icon component per device status */
export const STATUS_ICON: Record<DeviceStatus, typeof CheckCircle2> = {
  OK: CheckCircle2,
  WARNING: AlertTriangle,
  ALARM: XCircle,
  DISCONNECTED: WifiOff,
};

/** Lucide icon component per event type (superset of DeviceStatus) */
export const EVENT_ICON: Record<EventType, typeof CheckCircle2> = {
  OK: CheckCircle2,
  WARNING: AlertTriangle,
  ALARM: XCircle,
  DISCONNECTED: WifiOff,
  RECONNECTED: Wifi,
};

/** text-* class per event type */
export const EVENT_COLOR: Record<EventType, string> = {
  OK: "text-green-500",
  WARNING: "text-yellow-500",
  ALARM: "text-destructive",
  DISCONNECTED: "text-muted-foreground",
  RECONNECTED: "text-green-500",
};

/** HeatMap cell bg+hover classes per device status */
export const STATUS_CELL: Record<DeviceStatus, string> = {
  OK: "bg-emerald-500 hover:bg-emerald-400",
  WARNING: "bg-amber-500 hover:bg-amber-400",
  ALARM: "bg-red-500 hover:bg-red-400 animate-pulse",
  DISCONNECTED: "bg-slate-600 hover:bg-slate-500",
};

export function getStatusDot(status: DeviceStatus): string {
  return STATUS_DOT[status] ?? STATUS_DOT.DISCONNECTED;
}

export function getStatusColor(status: DeviceStatus): string {
  return STATUS_COLOR[status] ?? STATUS_COLOR.DISCONNECTED;
}

export function getStatusBadgeVariant(
  status: DeviceStatus,
): "default" | "secondary" | "destructive" | "outline" {
  return STATUS_BADGE_VARIANT[status] ?? "outline";
}

export function getEventBadgeVariant(
  type: string,
): "destructive" | "secondary" | "default" | "outline" {
  if (type === "ALARM") return "destructive";
  if (type === "WARNING") return "secondary";
  if (type === "DISCONNECTED") return "outline";
  return "default";
}
