import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { routes } from "@/router/routes";
import type { PlantGroup, InstanceHealthEntry } from "../hooks/useExecutiveDashboardData";
import type { MachineVariable } from "@/types/machine-type";
import type { DeviceHealthStatus } from "@/domain/device/getDeviceHealth";

interface Props {
  plantGroups: PlantGroup[];
  instanceHealthMap: Map<string, InstanceHealthEntry>;
  displayVariables: MachineVariable[];
  machineTypeSlug: string;
  statusFilter: DeviceHealthStatus | null;
  plantFilter: string | null;
}

const CELL_COLORS: Record<string, string> = {
  OK: "bg-emerald-500 hover:bg-emerald-400",
  WARNING: "bg-amber-500 hover:bg-amber-400",
  ALARM: "bg-red-500 hover:bg-red-400 animate-pulse",
  DISCONNECTED: "bg-slate-600 hover:bg-slate-500",
};

interface TooltipData {
  stationId: string;
  plantId: string;
  status: string;
  variables: { label: string; value: string }[];
  x: number;
  y: number;
}

export default function PlantHeatMap({
  plantGroups,
  instanceHealthMap,
  displayVariables,
  machineTypeSlug,
  statusFilter,
  plantFilter,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const filteredGroups = plantFilter
    ? plantGroups.filter((g) => g.plantId === plantFilter)
    : plantGroups;

  if (filteredGroups.length === 0) return null;

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
      <h3 className="text-lg font-semibold text-white mb-4">
        {t.executiveDashboard.heatMap}
      </h3>

      <div className="space-y-3">
        {filteredGroups.map((group) => (
          <div key={group.plantId} className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-24 truncate flex-shrink-0 text-right">
              {group.plantId}
            </span>
            <div className="flex flex-wrap gap-1">
              {group.instances.map((inst) => {
                const key = `${inst.machineType}-${inst.plantId}-${inst.stationId}`;
                const entry = instanceHealthMap.get(key);
                const status = entry?.health.status ?? "OK";
                const isDimmed = statusFilter && status !== statusFilter;

                const variables = displayVariables.map((v) => {
                  const point = inst.points[v.key];
                  const val =
                    point?.value != null
                      ? `${point.value}${v.unit ? ` ${v.unit}` : ""}`
                      : "--";
                  return { label: v.label, value: val };
                });

                return (
                  <button
                    key={key}
                    onClick={() =>
                      navigate(
                        routes.machine.detail(
                          machineTypeSlug,
                          inst.plantId,
                          inst.stationId,
                        ),
                      )
                    }
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        stationId: inst.stationId,
                        plantId: inst.plantId,
                        status,
                        variables,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    className={`
                      w-6 h-6 rounded-sm transition-all duration-200 cursor-pointer
                      ${CELL_COLORS[status]}
                      ${isDimmed ? "opacity-20" : "opacity-100"}
                      ${status === "ALARM" ? "ring-1 ring-red-400/50" : ""}
                    `}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-3 border-t border-white/5">
        <span className="text-xs text-slate-500">{t.executiveDashboard.legend}:</span>
        {(["OK", "WARNING", "ALARM", "DISCONNECTED"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1 text-xs text-slate-500">
            <span className={`w-3 h-3 rounded-sm ${CELL_COLORS[s].split(" ")[0]}`} />
            {t.status[s === "OK" ? "ok" : s === "WARNING" ? "warning" : s === "ALARM" ? "alarm" : "disconnected"]}
          </span>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-slate-900 border border-white/20 rounded-lg px-3 py-2 shadow-xl pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="text-xs font-semibold text-white">
            {tooltip.stationId}
          </p>
          <p className="text-[10px] text-slate-400">{tooltip.plantId}</p>
          <p
            className={`text-[10px] font-medium mt-1 ${
              tooltip.status === "OK"
                ? "text-emerald-400"
                : tooltip.status === "WARNING"
                  ? "text-amber-400"
                  : tooltip.status === "ALARM"
                    ? "text-red-400"
                    : "text-slate-400"
            }`}
          >
            {tooltip.status}
          </p>
          {tooltip.variables.map((v) => (
            <p key={v.label} className="text-[10px] text-slate-300">
              {v.label}: {v.value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
