import Papa from "papaparse";
import type { ReportData, ReportDataRow } from "@/types/report";

/**
 * Convert a ReportData object to a CSV string.
 * Multiple sections are separated by a blank line.
 */
export function reportToCsvString(report: ReportData): string {
  const parts: string[] = [
    `# ${report.title}`,
    `# Generated: ${new Date(report.generatedAt).toLocaleString()}`,
    `# Period: ${report.config.startDate} - ${report.config.endDate}`,
    "",
  ];

  for (const section of report.sections) {
    parts.push(`## ${section.title}`);
    const csvSection = Papa.unparse(section.rows as ReportDataRow[], {
      header: true,
      columns: section.columns,
    });
    parts.push(csvSection);
    parts.push("");
  }

  return parts.join("\n");
}

/**
 * Trigger a browser CSV file download.
 */
export function downloadCsv(report: ReportData, filename: string): void {
  const csv = reportToCsvString(report);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
