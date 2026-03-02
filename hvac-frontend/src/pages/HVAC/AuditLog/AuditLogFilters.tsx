import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n/useTranslation";
import type { AuditActionType } from "@/types/audit";

interface AuditFilters {
  actionType: AuditActionType | "ALL";
  actor: string;
  startDate: string;
  endDate: string;
}

interface Props {
  filters: AuditFilters;
  onChange: (filters: AuditFilters) => void;
}

const ACTION_TYPES: Array<AuditActionType | "ALL"> = [
  "ALL",
  "COMMAND_SENT",
  "ALARM_ACKNOWLEDGED",
  "ALARM_CLEARED",
  "SETTINGS_CHANGED",
];

export function AuditLogFilters({ filters, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Action type */}
      <Select
        value={filters.actionType}
        onValueChange={(v) => onChange({ ...filters, actionType: v as AuditActionType | "ALL" })}
      >
        <SelectTrigger className="w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ACTION_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type === "ALL"
                ? t.auditLog.filters.allActions
                : t.auditLog.actionTypes[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Actor search */}
      <Input
        className="w-52"
        placeholder={t.auditLog.filters.searchActor}
        value={filters.actor}
        onChange={(e) => onChange({ ...filters, actor: e.target.value })}
      />

      {/* Date range */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">
          {t.auditLog.filters.startDate}
        </label>
        <Input
          type="date"
          className="w-40"
          value={filters.startDate}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">
          {t.auditLog.filters.endDate}
        </label>
        <Input
          type="date"
          className="w-40"
          value={filters.endDate}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
        />
      </div>
    </div>
  );
}

export type { AuditFilters };
