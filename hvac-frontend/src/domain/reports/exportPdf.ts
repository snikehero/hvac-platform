import { jsPDF } from "jspdf";
import type { ReportData } from "@/types/report";

/**
 * Generate and download a PDF version of the report.
 */
export function downloadPdf(report: ReportData, filename: string): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(report.title, margin, y);
  y += 8;

  // Metadata
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(
    `Generated: ${new Date(report.generatedAt).toLocaleString()}   |   Period: ${report.config.startDate} – ${report.config.endDate}`,
    margin,
    y,
  );
  y += 10;
  doc.setTextColor(0);

  for (const section of report.sections) {
    // Section heading
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin, y);
    y += 6;

    if (section.rows.length === 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text("No data", margin, y);
      y += 8;
      continue;
    }

    // Column headers
    const cols = section.columns;
    const colWidth = Math.min(40, (pageWidth - margin * 2) / cols.length);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    cols.forEach((col, i) => {
      doc.text(String(col).slice(0, 18), margin + i * colWidth, y);
    });
    y += 5;

    // Row data
    doc.setFont("helvetica", "normal");
    for (const row of section.rows) {
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      cols.forEach((col, i) => {
        const val = row[col];
        doc.text(String(val ?? "").slice(0, 18), margin + i * colWidth, y);
      });
      y += 5;
    }

    y += 8;
  }

  doc.save(`${filename}.pdf`);
}
