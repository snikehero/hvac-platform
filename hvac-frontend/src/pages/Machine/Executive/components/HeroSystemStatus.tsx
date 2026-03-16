import { Shield, ShieldAlert, ShieldX, ShieldQuestion } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { SystemStatus, ExecutiveDashboardStats } from "../hooks/useExecutiveDashboardData";

interface Props {
  systemStatus: SystemStatus;
  stats: ExecutiveDashboardStats;
  machineTypeName: string;
}

const STATUS_CONFIG: Record<
  SystemStatus,
  {
    gradient: string;
    iconBg: string;
    icon: typeof Shield;
    glowColor: string;
    barColor: string;
  }
> = {
  OPTIMAL: {
    gradient: "from-emerald-900/60 via-emerald-800/30 to-transparent",
    iconBg: "bg-emerald-500/20",
    icon: Shield,
    glowColor: "shadow-emerald-500/20",
    barColor: "bg-emerald-500",
  },
  DEGRADED: {
    gradient: "from-amber-900/60 via-amber-800/30 to-transparent",
    iconBg: "bg-amber-500/20",
    icon: ShieldAlert,
    glowColor: "shadow-amber-500/20",
    barColor: "bg-amber-500",
  },
  CRITICAL: {
    gradient: "from-red-900/60 via-red-800/30 to-transparent",
    iconBg: "bg-red-500/20",
    icon: ShieldX,
    glowColor: "shadow-red-500/20",
    barColor: "bg-red-500",
  },
  NO_DATA: {
    gradient: "from-muted/60 via-muted/30 to-transparent",
    iconBg: "bg-muted/50",
    icon: ShieldQuestion,
    glowColor: "shadow-muted/20",
    barColor: "bg-muted-foreground",
  },
};

export default function HeroSystemStatus({ systemStatus, stats, machineTypeName }: Props) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[systemStatus];
  const Icon = config.icon;

  const statusLabel =
    systemStatus === "OPTIMAL"
      ? t.status.optimal
      : systemStatus === "DEGRADED"
        ? t.status.degraded
        : systemStatus === "CRITICAL"
          ? t.status.critical
          : t.status.noData;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r ${config.gradient} p-6 lg:p-8 shadow-2xl ${config.glowColor}`}
    >
      {/* Animated glow for critical */}
      {systemStatus === "CRITICAL" && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
        {/* Icon + Status */}
        <div className="flex items-center gap-4">
          <div className={`relative p-4 rounded-2xl ${config.iconBg}`}>
            <Icon className="h-10 w-10 text-foreground" />
            {systemStatus === "CRITICAL" && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              {t.executiveDashboard.systemStatus}
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {statusLabel}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{machineTypeName}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 w-full lg:w-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatBox
              label={t.executiveDashboard.totalUnits}
              value={stats.total}
              color="text-foreground"
            />
            <StatBox
              label={t.status.alarm}
              value={stats.alarm}
              color={stats.alarm > 0 ? "text-red-400" : "text-muted-foreground"}
            />
            <StatBox
              label={t.status.warning}
              value={stats.warning}
              color={stats.warning > 0 ? "text-amber-400" : "text-muted-foreground"}
            />
            <StatBox
              label={t.executiveDashboard.operationalCapacity}
              value={`${stats.operationalPercent}%`}
              color={
                stats.operationalPercent >= 80
                  ? "text-emerald-400"
                  : stats.operationalPercent >= 50
                    ? "text-amber-400"
                    : "text-red-400"
              }
            />
          </div>

          {/* Distribution Bar */}
          {stats.total > 0 && (
            <div className="mt-4">
              <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                {stats.alarm > 0 && (
                  <div
                    className="h-full bg-red-500 transition-all duration-700"
                    style={{ width: `${(stats.alarm / stats.total) * 100}%` }}
                  />
                )}
                {stats.warning > 0 && (
                  <div
                    className="h-full bg-amber-500 transition-all duration-700"
                    style={{ width: `${(stats.warning / stats.total) * 100}%` }}
                  />
                )}
                {stats.disconnected > 0 && (
                  <div
                    className="h-full bg-muted-foreground transition-all duration-700"
                    style={{ width: `${(stats.disconnected / stats.total) * 100}%` }}
                  />
                )}
                {stats.ok > 0 && (
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${(stats.ok / stats.total) * 100}%` }}
                  />
                )}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {stats.alarm > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> {stats.alarm} {t.status.alarm}
                  </span>
                )}
                {stats.warning > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> {stats.warning} {t.status.warning}
                  </span>
                )}
                {stats.disconnected > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" /> {stats.disconnected} {t.status.disconnected}
                  </span>
                )}
                {stats.ok > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {stats.ok} {t.status.ok}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-muted/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${color} mt-0.5`}>{value}</p>
    </div>
  );
}
