import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download } from "lucide-react";
import { ReportTemplateCard } from "./ReportTemplateCard";
import { ReportPreview } from "./ReportPreview";
import { useTranslation } from "@/i18n/useTranslation";
import { fetchTelemetryHistory, fetchEvents, fetchAggregated } from "@/api/historyApi";
import {
  buildDailySummaryReport,
  buildAlarmLogReport,
  buildEnergyReport,
  buildAhuPerformanceReport,
} from "@/domain/reports/generateReport";
import { downloadCsv } from "@/domain/reports/exportCsv";
import { downloadPdf } from "@/domain/reports/exportPdf";
import { useSettings } from "@/context/SettingsContext";
import type { ReportData, ReportTemplateId, ReportHistoryEntry } from "@/types/report";

const TEMPLATES: ReportTemplateId[] = [
  "daily-summary",
  "alarm-log",
  "energy-report",
  "ahu-performance",
];

export default function ReportsPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplateId>("daily-summary");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [plantId, setPlantId] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);

  const templateInfo = (id: ReportTemplateId) => ({
    title: t.reports.templates[id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()) as keyof typeof t.reports.templates] ?? id,
    desc: t.reports.templates[(id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()) + "Desc") as keyof typeof t.reports.templates] ?? "",
  });

  const generate = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    const plantFilter = plantId.trim() || undefined;
    const config = {
      templateId: selectedTemplate,
      startDate,
      endDate,
      ...(plantFilter ? { plantId: plantFilter } : {}),
    };
    const isoStart = new Date(startDate).toISOString();
    const isoEnd = new Date(endDate + "T23:59:59Z").toISOString();

    try {
      let generated: ReportData;

      if (selectedTemplate === "daily-summary") {
        const [telRes, evRes] = await Promise.all([
          fetchTelemetryHistory({ startDate: isoStart, endDate: isoEnd, pageSize: 500, ...(plantFilter ? { plantId: plantFilter } : {}) }),
          fetchEvents({ startDate: isoStart, endDate: isoEnd, ...(plantFilter ? { plantId: plantFilter } : {}) }),
        ]);
        generated = buildDailySummaryReport(config, telRes.data, evRes.data);
      } else if (selectedTemplate === "alarm-log") {
        const evRes = await fetchEvents({ startDate: isoStart, endDate: isoEnd, ...(plantFilter ? { plantId: plantFilter } : {}) });
        generated = buildAlarmLogReport(config, evRes.data);
      } else if (selectedTemplate === "energy-report") {
        const aggRes = await fetchAggregated({ startDate: isoStart, endDate: isoEnd, aggregation: "hourly", ...(plantFilter ? { plantId: plantFilter } : {}) });
        generated = buildEnergyReport(config, aggRes, settings.energy?.costPerKwh ?? 0.12);
      } else {
        const aggRes = await fetchAggregated({ startDate: isoStart, endDate: isoEnd, aggregation: "hourly", ...(plantFilter ? { plantId: plantFilter } : {}) });
        generated = buildAhuPerformanceReport(config, aggRes);
      }

      setReport(generated);
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          templateId: selectedTemplate,
          generatedAt: generated.generatedAt,
          startDate,
          endDate,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleCsvDownload = () => {
    if (report) downloadCsv(report, `report-${selectedTemplate}-${startDate}`);
  };

  const handlePdfDownload = () => {
    if (report) downloadPdf(report, `report-${selectedTemplate}-${startDate}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          {t.reports.title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t.reports.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Config panel */}
        <div className="flex flex-col gap-5 lg:col-span-1">
          {/* Template selection */}
          <div>
            <Label className="mb-3 block text-sm font-semibold">Template</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {TEMPLATES.map((id) => {
                const info = templateInfo(id);
                return (
                  <ReportTemplateCard
                    key={id}
                    id={id}
                    title={info.title}
                    description={info.desc}
                    selected={selectedTemplate === id}
                    onSelect={() => setSelectedTemplate(id)}
                  />
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Date range */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold">{t.reports.dateRange.label}</Label>
            <div className="flex flex-col gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">{t.reports.dateRange.start}</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t.reports.dateRange.end}</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Plant filter */}
          <div>
            <Label className="text-xs text-muted-foreground">{t.reports.dateRange.plantFilter}</Label>
            <Input
              type="text"
              placeholder={t.reports.dateRange.plantFilterPlaceholder}
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
            />
          </div>

          <Button onClick={() => void generate()} disabled={loading} className="w-full">
            {loading ? t.reports.generating : t.reports.generate}
          </Button>

          {/* History */}
          {history.length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-semibold mb-2 block">{t.reports.history.title}</Label>
                <div className="flex flex-col gap-2">
                  {history.map((h) => (
                    <div key={h.id} className="text-xs text-muted-foreground border border-border rounded px-2 py-1">
                      <span className="font-medium">{h.templateId}</span>
                      <br />
                      {h.startDate} → {h.endDate}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Preview panel */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
            </div>
          )}

          {!loading && !report && !error && (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              {t.reports.noPreview}
            </div>
          )}

          {report && (
            <>
              {/* Download actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleCsvDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  {t.reports.export.csv}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePdfDownload}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.reports.export.pdf}
                </Button>
              </div>
              <ReportPreview report={report} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
