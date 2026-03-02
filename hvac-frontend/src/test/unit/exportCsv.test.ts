import { describe, it, expect } from "vitest";
import { reportToCsvString } from "@/domain/reports/exportCsv";
import type { ReportData } from "@/types/report";

const sampleReport: ReportData = {
  title: "Test Report",
  generatedAt: "2024-01-01T00:00:00Z",
  config: { templateId: "daily-summary", startDate: "2024-01-01", endDate: "2024-01-02" },
  sections: [
    {
      title: "Section A",
      columns: ["Name", "Value"],
      rows: [
        { Name: "temp", Value: 22.5 },
        { Name: "humidity", Value: 60 },
      ],
    },
  ],
};

describe("reportToCsvString", () => {
  it("includes the report title", () => {
    const csv = reportToCsvString(sampleReport);
    expect(csv).toContain("Test Report");
  });

  it("includes column headers", () => {
    const csv = reportToCsvString(sampleReport);
    expect(csv).toContain("Name");
    expect(csv).toContain("Value");
  });

  it("includes row values", () => {
    const csv = reportToCsvString(sampleReport);
    expect(csv).toContain("temp");
    expect(csv).toContain("22.5");
  });

  it("includes the section title", () => {
    const csv = reportToCsvString(sampleReport);
    expect(csv).toContain("Section A");
  });

  it("handles empty sections gracefully", () => {
    const empty: ReportData = { ...sampleReport, sections: [{ title: "Empty", columns: ["X"], rows: [] }] };
    expect(() => reportToCsvString(empty)).not.toThrow();
  });
});
