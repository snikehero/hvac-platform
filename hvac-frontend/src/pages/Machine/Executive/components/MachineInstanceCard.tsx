import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { routes } from "@/router/routes";
import { useTranslation } from "@/i18n/useTranslation";
import type { MachineTelemetry, MachineVariable } from "@/types/machine-type";
import type { DeviceHealthResult } from "@/domain/device/getDeviceHealth";
import type { HistoryPoint } from "@/types/history";

interface Props {
  instance: MachineTelemetry;
  health: DeviceHealthResult;
  isConnected: boolean;
  displayVariables: MachineVariable[];
  historyData: Record<string, HistoryPoint[]>;
  machineTypeSlug: string;
}

const STATUS_STYLES: Record<string, { border: string; glow: string; badge: string; badgeText: string }> = {
  OK: {
    border: "border-emerald-500/30",
    glow: "",
    badge: "bg-emerald-500/20",
    badgeText: "text-emerald-400",
  },
  WARNING: {
    border: "border-amber-500/40",
    glow: "shadow-amber-500/10 shadow-lg",
    badge: "bg-amber-500/20",
    badgeText: "text-amber-400",
  },
  ALARM: {
    border: "border-red-500/50",
    glow: "shadow-red-500/20 shadow-lg",
    badge: "bg-red-500/20",
    badgeText: "text-red-400",
  },
  DISCONNECTED: {
    border: "border-slate-600/40",
    glow: "",
    badge: "bg-slate-500/20",
    badgeText: "text-slate-400",
  },
};

function MiniSparkline({ data, color }: { data: HistoryPoint[]; color: string }) {
  if (data.length < 2) return null;

  const values = data.map((d) => (typeof d.value === "number" ? d.value : 0));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 60;
  const height = 20;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getTrend(data: HistoryPoint[]): "up" | "down" | "stable" {
  if (data.length < 3) return "stable";
  const recent = data.slice(-3);
  const values = recent.map((d) => (typeof d.value === "number" ? d.value : 0));
  const diff = values[values.length - 1] - values[0];
  if (Math.abs(diff) < 0.5) return "stable";
  return diff > 0 ? "up" : "down";
}

export default function MachineInstanceCard({
  instance,
  health,
  isConnected,
  displayVariables,
  historyData,
  machineTypeSlug,
}: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const style = STATUS_STYLES[health.status] ?? STATUS_STYLES.OK;

  const variableData = useMemo(() => {
    return displayVariables.map((v) => {
      const point = instance.points[v.key];
      const value = point?.value;
      const history = historyData[v.key] ?? [];
      const trend = getTrend(history);
      return { variable: v, value, history, trend };
    });
  }, [displayVariables, instance.points, historyData]);

  return (
    <button
      onClick={() =>
        navigate(
          routes.machine.detail(machineTypeSlug, instance.plantId, instance.stationId),
        )
      }
      className={`
        group relative text-left w-full rounded-xl overflow-hidden
        bg-white/5 backdrop-blur-md border transition-all duration-300
        hover:scale-[1.02] hover:bg-white/8
        ${style.border} ${style.glow}
        ${health.status === "ALARM" ? "animate-pulse" : ""}
        ${!isConnected ? "opacity-60" : ""}
      `}
    >
      {/* Top accent */}
      <div
        className={`h-[2px] ${
          health.status === "OK"
            ? "bg-emerald-500"
            : health.status === "WARNING"
              ? "bg-amber-500"
              : health.status === "ALARM"
                ? "bg-red-500"
                : "bg-slate-600"
        }`}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">
              {instance.stationId}
            </h4>
            <p className="text-[10px] text-slate-500">{instance.plantId}</p>
          </div>

          <div className="flex items-center gap-2">
            {health.badPoints > 0 && (
              <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                <AlertCircle className="h-3 w-3" />
                {health.badPoints} {t.executiveDashboard.badPoints}
              </span>
            )}
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style.badge} ${style.badgeText}`}
            >
              {health.status}
            </span>
          </div>
        </div>

        {/* Variables */}
        <div className="space-y-2">
          {variableData.map(({ variable, value, history, trend }) => {
            const displayValue =
              value != null && value !== ""
                ? `${typeof value === "number" ? value.toFixed(1) : value}${variable.unit ? ` ${variable.unit}` : ""}`
                : "--";

            const TrendIcon =
              trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
            const trendColor =
              trend === "up" ? "text-red-400" : trend === "down" ? "text-cyan-400" : "text-slate-600";

            return (
              <div key={variable.key} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: variable.color || "#94a3b8" }}
                  />
                  <span className="text-xs text-slate-400 truncate">
                    {variable.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <MiniSparkline
                    data={history}
                    color={variable.color || "#94a3b8"}
                  />
                  <span className="text-xs font-medium text-white w-14 text-right">
                    {displayValue}
                  </span>
                  <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Status indicator dot */}
        <div className="absolute top-3 right-3">
          <span
            className={`block w-2 h-2 rounded-full ${
              health.status === "OK"
                ? "bg-emerald-500"
                : health.status === "WARNING"
                  ? "bg-amber-500"
                  : health.status === "ALARM"
                    ? "bg-red-500 animate-ping"
                    : "bg-slate-600"
            }`}
          />
        </div>
      </div>
    </button>
  );
}
