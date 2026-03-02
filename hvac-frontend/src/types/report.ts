export type ReportTemplateId =
  | "daily-summary"
  | "alarm-log"
  | "energy-report"
  | "ahu-performance";

export interface ReportTemplate {
  id: ReportTemplateId;
  titleKey: string;
  descKey: string;
}

export interface ReportConfig {
  templateId: ReportTemplateId;
  startDate: string;
  endDate: string;
  plantId?: string;
}

export interface ReportDataRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ReportSection {
  title: string;
  columns: string[];
  rows: ReportDataRow[];
}

export interface ReportData {
  title: string;
  generatedAt: string;
  config: ReportConfig;
  sections: ReportSection[];
}

export interface ReportHistoryEntry {
  id: string;
  templateId: ReportTemplateId;
  generatedAt: string;
  startDate: string;
  endDate: string;
}
