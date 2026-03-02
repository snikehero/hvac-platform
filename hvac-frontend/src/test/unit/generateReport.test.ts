import { describe, it, expect } from "vitest";
import {
  buildDailySummaryReport,
  buildAlarmLogReport,
  buildEnergyReport,
  buildAhuPerformanceReport,
} from "@/domain/reports/generateReport";
import type { ReportConfig } from "@/types/report";
import type { TelemetryRecord, EventRecord, AggregatedPoint } from "@/types/history-api";

const config: ReportConfig = {
  templateId: "daily-summary",
  startDate: "2024-01-01",
  endDate: "2024-01-02",
};

const telemetry: TelemetryRecord[] = [
  {
    id: "t1",
    plantId: "p1",
    stationId: "ahu-1",
    pointName: "temperature",
    value: "22.5",
    quality: "GOOD",
    timestamp: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

const events: EventRecord[] = [
  {
    id: "e1",
    plantId: "p1",
    ahuId: "ahu-1",
    type: "ALARM",
    message: "Temperature too high",
    timestamp: "2024-01-01T06:00:00Z",
    createdAt: "2024-01-01T06:00:00Z",
  },
  {
    id: "e2",
    plantId: "p1",
    ahuId: "ahu-1",
    type: "OK",
    message: "Back to normal",
    timestamp: "2024-01-01T07:00:00Z",
    createdAt: "2024-01-01T07:00:00Z",
  },
];

const aggregated: AggregatedPoint[] = [
  { bucket: "2024-01-01T00:00:00Z", plantId: "p1", stationId: "ahu-1", pointName: "power", avg: 5, min: 4, max: 6, sum: 5, count: 1 },
];

// Multi-bucket, multi-AHU fixture for grouping tests
const multiAggregated: AggregatedPoint[] = [
  { bucket: "2024-01-01T00:00:00Z", plantId: "p1", stationId: "ahu-1", pointName: "temperature", avg: 20, min: 18, max: 22, sum: 20, count: 60 },
  { bucket: "2024-01-01T01:00:00Z", plantId: "p1", stationId: "ahu-1", pointName: "temperature", avg: 24, min: 21, max: 26, sum: 24, count: 60 },
  { bucket: "2024-01-01T00:00:00Z", plantId: "p1", stationId: "ahu-2", pointName: "temperature", avg: 30, min: 28, max: 32, sum: 30, count: 60 },
];

// ─── buildDailySummaryReport ──────────────────────────────────────────────────

describe("buildDailySummaryReport", () => {
  it("contains a telemetry section and an events section", () => {
    const r = buildDailySummaryReport(config, telemetry, events);
    const titles = r.sections.map((s) => s.title);
    expect(titles).toContain("Telemetry Records");
    expect(titles).toContain("Events");
  });

  it("maps telemetry rows correctly", () => {
    const r = buildDailySummaryReport(config, telemetry, events);
    const tel = r.sections.find((s) => s.title === "Telemetry Records")!;
    expect(tel.rows).toHaveLength(1);
    expect(tel.rows[0]["Value"]).toBe("22.5");
  });

  it("stores the config", () => {
    const r = buildDailySummaryReport(config, telemetry, events);
    expect(r.config.templateId).toBe("daily-summary");
  });
});

// ─── buildAlarmLogReport ──────────────────────────────────────────────────────

describe("buildAlarmLogReport", () => {
  it("filters to only ALARM and WARNING events", () => {
    const r = buildAlarmLogReport(config, events);
    expect(r.sections[0].rows).toHaveLength(1); // only the ALARM event
    expect(r.sections[0].rows[0]["Type"]).toBe("ALARM");
  });

  it("returns an empty section when no alarms", () => {
    const okOnly: EventRecord[] = [{ ...events[1] }];
    const r = buildAlarmLogReport(config, okOnly);
    expect(r.sections[0].rows).toHaveLength(0);
  });
});

// ─── buildEnergyReport ────────────────────────────────────────────────────────

describe("buildEnergyReport", () => {
  it("includes cost column computed from costPerKwh", () => {
    const r = buildEnergyReport(config, aggregated, 0.10);
    const row = r.sections[0].rows[0];
    // avg=5 kW, interval=1h, kwh=5, cost=0.5
    expect(row["Avg kW"]).toBe(5);
    expect(row["Total kWh"]).toBeCloseTo(5, 1);
    expect(row["Cost ($)"]).toBeCloseTo(0.5, 1);
  });

  it("uses default costPerKwh = 0.12 when not provided", () => {
    const r = buildEnergyReport(config, aggregated);
    const row = r.sections[0].rows[0];
    expect(row["Cost ($)"]).toBeCloseTo(0.6, 1);
  });
});

// ─── buildAhuPerformanceReport ────────────────────────────────────────────────

describe("buildAhuPerformanceReport", () => {
  it("groups multiple buckets into one row per AHU per metric", () => {
    const r = buildAhuPerformanceReport(config, multiAggregated);
    // ahu-1/temperature + ahu-2/temperature = 2 rows, not 3 raw buckets
    expect(r.sections[0].rows).toHaveLength(2);
  });

  it("computes averaged Avg across buckets", () => {
    const r = buildAhuPerformanceReport(config, multiAggregated);
    const ahu1 = r.sections[0].rows.find((row) => row["AHU"] === "ahu-1")!;
    // (20 + 24) / 2 = 22
    expect(ahu1["Avg"]).toBe(22);
  });

  it("tracks global min and max across all buckets", () => {
    const r = buildAhuPerformanceReport(config, multiAggregated);
    const ahu1 = r.sections[0].rows.find((row) => row["AHU"] === "ahu-1")!;
    expect(ahu1["Min"]).toBe(18); // lowest min across both buckets
    expect(ahu1["Max"]).toBe(26); // highest max across both buckets
  });

  it("sums sample counts across buckets", () => {
    const r = buildAhuPerformanceReport(config, multiAggregated);
    const ahu1 = r.sections[0].rows.find((row) => row["AHU"] === "ahu-1")!;
    expect(ahu1["Samples"]).toBe(120); // 60 + 60
  });

  it("uses Samples column instead of Count", () => {
    const r = buildAhuPerformanceReport(config, aggregated);
    expect(r.sections[0].columns).toContain("Samples");
    expect(r.sections[0].columns).not.toContain("Count");
  });

  it("sorts rows by AHU then metric", () => {
    const r = buildAhuPerformanceReport(config, multiAggregated);
    const ahus = r.sections[0].rows.map((row) => row["AHU"]);
    expect(ahus).toEqual(["ahu-1", "ahu-2"]);
  });
});
