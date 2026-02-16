import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, WifiOff, TrendingUp, Activity, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface DashboardStats {
  systemStatus: string;
  alarms: number;
  warnings: number;
  totalAhus: number;
  disconnected: number;
  affected: number;
  operational: number;
  operationalPercentage: number;
}

interface Props {
  stats: DashboardStats;
  onFilterStatus: (status: "OK" | "WARNING" | "ALARM" | "DISCONNECTED") => void;
}

export function DashboardWidgets({ stats, onFilterStatus }: Props) {
  const noData = stats.totalAhus === 0;
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Key Performance Indicators</h3>
        {!noData && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="w-3 h-3" />
            <span className="font-mono">{stats.totalAhus} {t.heroSystem.totalUnits}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unidades Afectadas */}
        <KpiCard
          icon={AlertTriangle}
          label="Units Affected"
          value={noData ? "--" : stats.affected}
          subtitle={`${stats.alarms} ${t.heroSystem.alarms} + ${stats.warnings} ${t.heroSystem.warnings}`}
          color="destructive"
          percentage={noData ? 0 : (stats.affected / stats.totalAhus) * 100}
          isClickable={stats.affected > 0}
          onClick={() => stats.affected > 0 && onFilterStatus("ALARM")}
        />

        {/* Sin Comunicación */}
        <KpiCard
          icon={WifiOff}
          label="No Communication"
          value={noData ? "--" : stats.disconnected}
          subtitle="Offline Units"
          color="warning"
          percentage={noData ? 0 : (stats.disconnected / stats.totalAhus) * 100}
          isClickable={stats.disconnected > 0}
          onClick={() =>
            stats.disconnected > 0 && onFilterStatus("DISCONNECTED")
          }
        />

        {/* Capacidad Operativa */}
        <KpiCard
          icon={TrendingUp}
          label={t.widgets.operationalCapacity}
          value={noData ? "--" : `${stats.operationalPercentage}%`}
          subtitle={`${stats.operational} ${t.common.all} ${stats.totalAhus} ${t.plantPanel.units}`}
          color="success"
          percentage={stats.operationalPercentage}
          isClickable={false}
        />
      </div>
    </div>
  );
}

// ===== Subcomponents =====

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle: string;
  color: "destructive" | "warning" | "success";
  percentage: number;
  isClickable: boolean;
  onClick?: () => void;
}

function KpiCard({
  icon: IconComponent,
  label,
  value,
  subtitle,
  color,
  percentage,
  isClickable,
  onClick,
}: KpiCardProps) {
  const colorConfig = {
    destructive: {
      gradient: "from-red-500 to-red-600",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      border: "border-red-500/30",
      valueBg: "bg-red-500/5",
      progressBg: "bg-red-500",
    },
    warning: {
      gradient: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      border: "border-orange-500/30",
      valueBg: "bg-orange-500/5",
      progressBg: "bg-orange-500",
    },
    success: {
      gradient: "from-green-500 to-green-600",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      border: "border-green-500/30",
      valueBg: "bg-green-500/5",
      progressBg: "bg-green-500",
    },
  };

  const config = colorConfig[color];

  return (
    <Card
      onClick={isClickable ? onClick : undefined}
      className={`
        group relative overflow-hidden backdrop-blur-sm
        transition-all duration-300
        ${config.border}
        ${isClickable ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg" : ""}
      `}
    >
      {/* Gradient Top Border */}
      <div
        className={`absolute top-0 inset-x-0 h-1 bg-linear-to-r ${config.gradient}`}
      />

      {/* Hover Effect */}
      {isClickable && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
      )}

      <CardContent className="relative z-10 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${config.iconBg} border ${config.border}`}
            >
              <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                {label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {subtitle}
              </div>
            </div>
          </div>
        </div>

        {/* Value */}
        <div
          className={`inline-flex items-baseline px-4 py-2 rounded-lg ${config.valueBg}`}
        >
          <span
            className={`text-4xl font-black tabular-nums ${config.iconColor}`}
          >
            {value}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Impact</span>
            <span className="font-bold">{percentage.toFixed(0)}%</span>
          </div>

          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${config.progressBg} transition-all duration-1000`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Clickable Hint */}
        {isClickable && (
          <div className="pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-muted-foreground font-medium">
              Click to filter →
            </span>
          </div>
        )}
      </CardContent>

      {/* Status Dot */}
      <div className="absolute top-4 right-4">
        <div
          className={`w-2 h-2 rounded-full ${config.iconColor.replace("text-", "bg-")}`}
        />
      </div>
    </Card>
  );
}
