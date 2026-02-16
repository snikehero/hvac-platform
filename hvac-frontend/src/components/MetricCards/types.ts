/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LucideIcon } from "lucide-react";

/* ================= METRIC CARD TYPES ================= */

export type MetricType =
  | "temperature"
  | "humidity"
  | "fan"
  | "airflow"
  | "damper"
  | "power"
  | "filter"
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
  value: any;
  unit: string;
  quality?: MetricQuality;
  color: MetricColor;
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

export interface MetricCardBaseProps {
  icon: LucideIcon;
  label: string;
  value: any;
  unit: string;
  quality?: MetricQuality;
  color: MetricColor;
  badge?: React.ReactNode;
  children: React.ReactNode;
}
