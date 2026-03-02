import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AuditRecord } from "@/types/history-api";
import { formatActionType, formatAuditDetails, formatAuditTimestamp } from "@/domain/audit/formatAuditEntry";
import { useTranslation } from "@/i18n/useTranslation";
import type { AuditActionType } from "@/types/audit";

const ACTION_BADGE_VARIANT: Record<AuditActionType, "default" | "secondary" | "destructive" | "outline"> = {
  COMMAND_SENT: "default",
  ALARM_ACKNOWLEDGED: "secondary",
  ALARM_CLEARED: "secondary",
  SETTINGS_CHANGED: "outline",
};

interface Props {
  records: AuditRecord[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export function AuditLogTable({ records, page, totalPages, onPageChange }: Props) {
  const { t } = useTranslation();

  if (records.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        {t.auditLog.noEntries}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t.auditLog.columns.timestamp}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t.auditLog.columns.actionType}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t.auditLog.columns.actor}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t.auditLog.columns.plant}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t.auditLog.columns.ahu}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t.auditLog.columns.details}</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                  {formatAuditTimestamp(r.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ACTION_BADGE_VARIANT[r.actionType] ?? "outline"}>
                    {formatActionType(r.actionType)}
                  </Badge>
                </td>
                <td className="px-4 py-3">{r.actor ?? "—"}</td>
                <td className="px-4 py-3">
                  {r.plantId ? <Badge variant="outline">{r.plantId}</Badge> : "—"}
                </td>
                <td className="px-4 py-3">{r.ahuId ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">
                  {formatAuditDetails({ ...r, details: r.details as Record<string, unknown> | undefined })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
