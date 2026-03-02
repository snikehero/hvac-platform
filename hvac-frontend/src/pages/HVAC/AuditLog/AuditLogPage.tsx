import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Download, RefreshCw } from "lucide-react";
import { fetchAuditLog } from "@/api/historyApi";
import { AuditLogTable } from "./AuditLogTable";
import { AuditLogFilters, type AuditFilters } from "./AuditLogFilters";
import { useTranslation } from "@/i18n/useTranslation";
import type { AuditRecord, PaginatedResponse } from "@/types/history-api";
import type { AuditActionType } from "@/types/audit";

const PAGE_SIZE = 25;

function defaultFilters(): AuditFilters {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return {
    actionType: "ALL",
    actor: "",
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function exportCsv(records: AuditRecord[], filename: string) {
  const header = "timestamp,actionType,actor,plantId,ahuId,details\n";
  const rows = records.map((r) =>
    [
      r.timestamp,
      r.actionType,
      r.actor ?? "",
      r.plantId ?? "",
      r.ahuId ?? "",
      JSON.stringify(r.details ?? {}),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditLogPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AuditFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<AuditRecord> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (p = page) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAuditLog({
          startDate: new Date(filters.startDate).toISOString(),
          endDate: new Date(filters.endDate + "T23:59:59Z").toISOString(),
          ...(filters.actionType !== "ALL" ? { actionType: filters.actionType as AuditActionType } : {}),
          ...(filters.actor ? { actor: filters.actor } : {}),
          page: p,
          pageSize: PAGE_SIZE,
        });
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit log");
      } finally {
        setLoading(false);
      }
    },
    [filters, page],
  );

  useEffect(() => {
    setPage(1);
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    void load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleExport = () => {
    if (result?.data) {
      exportCsv(result.data, t.auditLog.export.filename);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            {t.auditLog.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t.auditLog.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!result?.data?.length}>
            <Download className="h-4 w-4 mr-2" />
            {t.auditLog.export.button}
          </Button>
          <Button variant="outline" size="icon" onClick={() => void load(page)}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AuditLogFilters filters={filters} onChange={setFilters} />

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      {loading && !result ? (
        <div className="flex flex-col gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : (
        <AuditLogTable
          records={result?.data ?? []}
          page={page}
          totalPages={result?.totalPages ?? 1}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
