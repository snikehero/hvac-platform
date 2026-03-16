import type { LucideIcon } from "lucide-react";
import type React from "react";
import type { HistoryPoint } from "@/types/history";

export interface TrendInfo {
  direction: "up" | "down" | "stable";
  delta?: string;
}

/* ================= METRIC CARD TYPES ================= */

export type MetricType =
  | "temperature"
  | "humidity"
  | "fan"
  | "airflow"
  | "damper"
  | "power"
  | "filter"
  | "rpm"
  | "current"
  | "generic";

export type MetricQuality = "GOOD" | "BAD" | "UNCERTAIN";

export type MetricColor =
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "destructive"
  | "chart";

export interface BaseMetricCardProps {
  label: string;
  value: number | string | boolean | null | undefined;
  unit: string;
  quality?: MetricQuality;
  color: MetricColor;
  /** Passed from MachineDetailPage for sparkline rendering */
  historyData?: HistoryPoint[];
  /** Pre-calculated trend for arrow indicator */
  trend?: TrendInfo;
}

export interface TemperatureCardProps extends BaseMetricCardProps {
  type: "temperature";
  min?: number;
  max?: number;
  target?: number;
}

export interface HumidityCardProps extends BaseMetricCardProps {
  type: "humidity";
}

export interface FanCardProps extends BaseMetricCardProps {
  type: "fan";
  status: "ON" | "OFF" | string;
}

export interface AirflowCardProps extends BaseMetricCardProps {
  type: "airflow";
  min?: number;
  max?: number;
}

export interface DamperCardProps extends BaseMetricCardProps {
  type: "damper";
}

export interface PowerCardProps extends BaseMetricCardProps {
  type: "power";
  status: "ON" | "OFF" | string;
}

export interface FilterCardProps extends BaseMetricCardProps {
  type: "filter";
  min?: number;
  max?: number;
  critical?: number;
}

export interface GenericCardProps extends BaseMetricCardProps {
  type: "generic";
  icon?: LucideIcon;
}

export interface RpmCardProps extends BaseMetricCardProps {
  type: "rpm";
  min?: number;
  max?: number;
  target?: number;
}

export interface CurrentCardProps extends BaseMetricCardProps {
  type: "current";
  min?: number;
  max?: number;
  critical?: number;
}

export interface MetricCardBaseProps {
  icon: LucideIcon;
  label: string;
  value: number | string | boolean | null | undefined;
  unit: string;
  quality?: MetricQuality;
  color: MetricColor;
  badge?: React.ReactNode;
  children: React.ReactNode;
  /** Optional trend data derived from history */
  trend?: TrendInfo;
  /** Raw history points for mini sparkline (last 10 used) */
  historyData?: HistoryPoint[];
}
