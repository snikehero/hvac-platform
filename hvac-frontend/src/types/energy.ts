export type AggregationType = "hourly" | "daily";

export type EnergyPeriod = "last24h" | "last7d" | "last30d" | "custom";

export interface EnergyDataPoint {
  timestamp: string;
  ahuId: string;
  plantId: string;
  kwh: number;
}

export interface EnergyRankingRow {
  plantId: string;
  stationId: string;
  totalKwh: number;
  cost: number;
}

export interface EnergySummary {
  totalKwh: number;
  totalCost: number;
  avgKwhPerAhu: number;
  deltaPercent: number | null;
  rankingRows: EnergyRankingRow[];
}

export interface EnergyComparisonPoint {
  label: string;
  current: number;
  previous: number;
}
