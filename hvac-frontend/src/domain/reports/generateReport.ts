import type { ReportConfig, ReportData, ReportSection } from "@/types/report";
import type { TelemetryRecord, EventRecord, AggregatedPoint } from "@/types/history-api";

/**
 * Build a daily summary report from telemetry + events data.
 */
export function buildDailySummaryReport(
  config: ReportConfig,
  telemetry: TelemetryRecord[],
  events: EventRecord[],
): ReportData {
  const telemetrySection: ReportSection = {
    title: "Telemetry Records",
    columns: ["Timestamp", "Plant", "Station", "Point", "Value", "Quality"],
    rows: telemetry.map((r) => ({
      Timestamp: r.timestamp,
      Plant: r.plantId,
      Station: r.stationId,
      Point: r.pointName,
      Value: r.value,
      Quality: r.quality,
    })),
  };

  const eventsSection: ReportSection = {
    title: "Events",
    columns: ["Timestamp", "Plant", "AHU", "Type", "Previous Type", "Message"],
    rows: events.map((e) => ({
      Timestamp: e.timestamp,
      Plant: e.plantId,
      AHU: e.ahuId,
      Type: e.type,
      "Previous Type": e.previousType ?? "—",
      Message: e.message,
    })),
  };

  return {
    title: "Daily Summary Report",
    generatedAt: new Date().toISOString(),
    config,
    sections: [telemetrySection, eventsSection],
  };
}

/**
 * Build an alarm log report from events data.
 */
export function buildAlarmLogReport(
  config: ReportConfig,
  events: EventRecord[],
): ReportData {
  const alarmEvents = events.filter((e) => e.type === "ALARM" || e.type === "WARNING");

  const section: ReportSection = {
    title: "Alarm Log",
    columns: ["Timestamp", "Plant", "AHU", "Type", "Previous Type", "Message"],
    rows: alarmEvents.map((e) => ({
      Timestamp: e.timestamp,
      Plant: e.plantId,
      AHU: e.ahuId,
      Type: e.type,
      "Previous Type": e.previousType ?? "—",
      Message: e.message,
    })),
  };

  return {
    title: "Alarm Log Report",
    generatedAt: new Date().toISOString(),
    config,
    sections: [section],
  };
}

/**
 * Build an energy report from aggregated power data.
 */
export function buildEnergyReport(
  config: ReportConfig,
  aggregated: AggregatedPoint[],
  costPerKwh = 0.12,
): ReportData {
  const section: ReportSection = {
    title: "Energy Consumption",
    columns: ["Bucket", "Plant", "Station", "Point", "Avg kW", "Total kWh", "Cost ($)"],
    rows: aggregated.map((p) => {
      const kwh = Math.round(p.avg * 1 * 100) / 100; // 1-hour bucket assumption
      return {
        Bucket: p.bucket,
        Plant: p.plantId,
        Station: p.stationId,
        Point: p.pointName,
        "Avg kW": p.avg,
        "Total kWh": kwh,
        "Cost ($)": Math.round(kwh * costPerKwh * 100) / 100,
      };
    }),
  };

  return {
    title: "Energy Report",
    generatedAt: new Date().toISOString(),
    config,
    sections: [section],
  };
}

interface AhuMetricAccumulator {
  plant: string;
  station: string;
  point: string;
  sumAvg: number;
  min: number;
  max: number;
  totalCount: number;
  bucketCount: number;
}

/**
 * Build an AHU performance report from aggregated telemetry.
 * Rows are grouped by AHU (plantId + stationId) and metric (pointName),
 * producing one summary row per AHU per metric instead of one row per bucket.
 */
export function buildAhuPerformanceReport(
  config: ReportConfig,
  aggregated: AggregatedPoint[],
): ReportData {
  const map = new Map<string, AhuMetricAccumulator>();

  for (const p of aggregated) {
    const key = `${p.plantId}::${p.stationId}::${p.pointName}`;
    const existing = map.get(key);
    if (existing) {
      existing.sumAvg += p.avg;
      existing.min = Math.min(existing.min, p.min);
      existing.max = Math.max(existing.max, p.max);
      existing.totalCount += p.count;
      existing.bucketCount += 1;
    } else {
      map.set(key, {
        plant: p.plantId,
        station: p.stationId,
        point: p.pointName,
        sumAvg: p.avg,
        min: p.min,
        max: p.max,
        totalCount: p.count,
        bucketCount: 1,
      });
    }
  }

  const sorted = Array.from(map.values()).sort((a, b) => {
    const stationCmp = a.station.localeCompare(b.station);
    return stationCmp !== 0 ? stationCmp : a.point.localeCompare(b.point);
  });

  const section: ReportSection = {
    title: "AHU Performance Summary",
    columns: ["Plant", "AHU", "Metric", "Avg", "Min", "Max", "Samples"],
    rows: sorted.map((acc) => ({
      Plant: acc.plant,
      AHU: acc.station,
      Metric: acc.point,
      Avg: Math.round((acc.sumAvg / acc.bucketCount) * 100) / 100,
      Min: Math.round(acc.min * 100) / 100,
      Max: Math.round(acc.max * 100) / 100,
      Samples: acc.totalCount,
    })),
  };

  return {
    title: "AHU Performance Report",
    generatedAt: new Date().toISOString(),
    config,
    sections: [section],
  };
}
