import { AlertTriangle, WifiOff, Activity } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { ExecutiveDashboardStats } from "../hooks/useExecutiveDashboardData";
import type { DeviceHealthStatus } from "@/domain/device/getDeviceHealth";

interface Props {
  stats: ExecutiveDashboardStats;
  onFilterByStatus: (status: DeviceHealthStatus | null) => void;
  activeFilter: DeviceHealthStatus | null;
}

export default function ExecutiveKpiWidgets({ stats, onFilterByStatus, activeFilter }: Props) {
  const { t } = useTranslation();
  const affected = stats.alarm + stats.warning;
  const affectedPercent = stats.total > 0 ? Math.round((affected / stats.total) * 100) : 0;
  const disconnectedPercent = stats.total > 0 ? Math.round((stats.disconnected / stats.total) * 100) : 0;

  const cards = [
    {
      label: t.executiveDashboard.affectedUnits,
      value: affected,
      icon: AlertTriangle,
      color: "text-red-400",
      iconBg: "bg-red-500/20",
      borderColor: "border-red-500/30",
      gradientTop: "bg-gradient-to-r from-red-500 to-rose-500",
      percent: affectedPercent,
      percentColor: "bg-red-500/30",
      percentFill: "bg-red-500",
      filterStatus: "ALARM" as DeviceHealthStatus,
    },
    {
      label: t.executiveDashboard.noCommunication,
      value: stats.disconnected,
      icon: WifiOff,
      color: "text-amber-400",
      iconBg: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
      gradientTop: "bg-gradient-to-r from-amber-500 to-orange-500",
      percent: disconnectedPercent,
      percentColor: "bg-amber-500/30",
      percentFill: "bg-amber-500",
      filterStatus: "DISCONNECTED" as DeviceHealthStatus,
    },
    {
      label: t.executiveDashboard.operationalCapacity,
      value: `${stats.operationalPercent}%`,
      icon: Activity,
      color:
        stats.operationalPercent >= 80
          ? "text-emerald-400"
          : stats.operationalPercent >= 50
            ? "text-amber-400"
            : "text-red-400",
      iconBg: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
      gradientTop: "bg-gradient-to-r from-emerald-500 to-cyan-500",
      percent: stats.operationalPercent,
      percentColor: "bg-emerald-500/30",
      percentFill: "bg-emerald-500",
      filterStatus: "OK" as DeviceHealthStatus,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.filterStatus;

        return (
          <button
            key={card.label}
            onClick={() => onFilterByStatus(card.filterStatus)}
            className={`
              group relative text-left w-full rounded-xl overflow-hidden
              bg-muted/50 backdrop-blur-md border transition-all duration-300
              hover:scale-[1.02] hover:bg-muted/60
              ${card.borderColor}
              ${isActive ? "ring-2 ring-cyan-500/50 bg-muted" : ""}
            `}
          >
            {/* Top gradient bar */}
            <div className={`h-1 ${card.gradientTop}`} />

            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {card.label}
                  </p>
                  <p className={`text-4xl font-bold mt-1 ${card.color}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>

              {/* Impact bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    {t.executiveDashboard.impact}
                  </span>
                  <span className="text-muted-foreground">{card.percent}%</span>
                </div>
                <div className={`h-1.5 rounded-full ${card.percentColor} overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${card.percentFill} transition-all duration-700`}
                    style={{ width: `${card.percent}%` }}
                  />
                </div>
              </div>

              {/* Hover hint */}
              <p className="text-[10px] text-muted-foreground/60 mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {t.executiveDashboard.clickToFilter}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
