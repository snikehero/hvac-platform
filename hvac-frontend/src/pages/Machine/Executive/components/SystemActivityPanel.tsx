import { Activity, AlertTriangle, AlertCircle, WifiOff, CheckCircle2, Wifi } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { DeviceEvent } from "@/types/device-event";

interface Props {
  recentEvents: DeviceEvent[];
  stabilityScore: number;
  machineTypeName: string;
}

const EVENT_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  ALARM: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20" },
  WARNING: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/20" },
  DISCONNECTED: { icon: WifiOff, color: "text-slate-400", bg: "bg-slate-500/20" },
  RECONNECTED: { icon: Wifi, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  OK: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20" },
};

function getStabilityLevel(score: number): { label: string; color: string; key: "stable" | "degraded" | "unstable" } {
  if (score >= 80) return { label: "STABLE", color: "text-emerald-400", key: "stable" };
  if (score >= 50) return { label: "DEGRADED", color: "text-amber-400", key: "degraded" };
  return { label: "UNSTABLE", color: "text-red-400", key: "unstable" };
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function SystemActivityPanel({ recentEvents, stabilityScore, machineTypeName }: Props) {
  const { t } = useTranslation();
  const stability = getStabilityLevel(stabilityScore);

  const criticalCount = recentEvents.filter((e) => e.type === "ALARM").length;
  const disconnectCount = recentEvents.filter((e) => e.type === "DISCONNECTED").length;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white">
        {t.executiveDashboard.systemActivity}
      </h3>
      <p className="text-xs text-slate-500 mb-4">{machineTypeName}</p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/5 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            {t.status.alarm}
          </p>
          <p className={`text-lg font-bold ${criticalCount > 0 ? "text-red-400" : "text-slate-500"}`}>
            {criticalCount}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            {t.executiveDashboard.disconnected}
          </p>
          <p className={`text-lg font-bold ${disconnectCount > 0 ? "text-amber-400" : "text-slate-500"}`}>
            {disconnectCount}
          </p>
        </div>
      </div>

      {/* Stability Score */}
      <div className="bg-white/5 rounded-lg px-3 py-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400">{t.executiveDashboard.stabilityScore}</span>
          </div>
          <span className={`text-sm font-bold ${stability.color}`}>
            {t.executiveDashboard[stability.key]} · {stabilityScore}%
          </span>
        </div>
        <div className="h-1 rounded-full bg-slate-800 mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              stabilityScore >= 80
                ? "bg-emerald-500"
                : stabilityScore >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${stabilityScore}%` }}
          />
        </div>
      </div>

      {/* Event Timeline */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          {t.executiveDashboard.recentEvents}
        </p>

        {recentEvents.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-4">
            {t.executiveDashboard.noEvents}
          </p>
        ) : (
          recentEvents.slice(0, 10).map((event, idx) => {
            const config = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.OK;
            const EventIcon = config.icon;

            return (
              <div
                key={`${event.timestamp}-${event.instanceId}-${idx}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className={`p-1 rounded ${config.bg} flex-shrink-0`}>
                  <EventIcon className={`h-3 w-3 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">
                    {event.instanceId}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {event.message}
                  </p>
                </div>
                <span className="text-[10px] text-slate-600 flex-shrink-0">
                  {formatTimeAgo(event.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
