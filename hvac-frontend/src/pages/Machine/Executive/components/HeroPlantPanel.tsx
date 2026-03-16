import { Building2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { PlantGroup } from "../hooks/useExecutiveDashboardData";

interface Props {
  plantGroups: PlantGroup[];
  selectedPlant: string | null;
  onSelectPlant: (plantId: string | null) => void;
}

function getPlantStatus(group: PlantGroup): "ALARM" | "WARNING" | "DISCONNECTED" | "OK" {
  if (group.alarm > 0) return "ALARM";
  if (group.disconnected > 0) return "DISCONNECTED";
  if (group.warning > 0) return "WARNING";
  return "OK";
}

const BORDER_COLORS: Record<string, string> = {
  ALARM: "border-red-500/40 hover:border-red-500/60",
  WARNING: "border-amber-500/40 hover:border-amber-500/60",
  DISCONNECTED: "border-muted-foreground/30 hover:border-muted-foreground/50",
  OK: "border-emerald-500/40 hover:border-emerald-500/60",
};

const BAR_COLORS: Record<string, string> = {
  ALARM: "bg-red-500",
  WARNING: "bg-amber-500",
  DISCONNECTED: "bg-muted-foreground",
  OK: "bg-emerald-500",
};

export default function HeroPlantPanel({ plantGroups, selectedPlant, onSelectPlant }: Props) {
  const { t } = useTranslation();

  if (plantGroups.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t.executiveDashboard.plantOverview}
        </h3>
        {selectedPlant && (
          <button
            onClick={() => onSelectPlant(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.executiveDashboard.allPlants}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plantGroups.map((group) => {
          const status = getPlantStatus(group);
          const isSelected = selectedPlant === group.plantId;

          return (
            <button
              key={group.plantId}
              onClick={() => onSelectPlant(group.plantId)}
              className={`
                relative text-left w-full rounded-xl p-4
                bg-muted/50 backdrop-blur-md border transition-all duration-300
                hover:scale-[1.02] hover:bg-muted/60
                ${BORDER_COLORS[status]}
                ${isSelected ? "ring-2 ring-cyan-500/50 bg-muted" : ""}
              `}
            >
              {/* Top border gradient */}
              <div
                className={`absolute top-0 left-4 right-4 h-[2px] rounded-b ${BAR_COLORS[status]}`}
              />

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Building2 className="h-5 w-5 text-foreground/70" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground truncate">
                      {group.plantId}
                    </h4>
                    <span className="text-xs text-muted-foreground ml-2">
                      {group.instances.length} {t.executiveDashboard.instances}
                    </span>
                  </div>

                  {/* Status pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {group.alarm > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                        {group.alarm} {t.executiveDashboard.alarms}
                      </span>
                    )}
                    {group.warning > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                        {group.warning} {t.executiveDashboard.warnings}
                      </span>
                    )}
                    {group.disconnected > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground font-medium">
                        {group.disconnected} {t.executiveDashboard.disconnected}
                      </span>
                    )}
                  </div>

                  {/* Operational bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{t.executiveDashboard.operational}</span>
                      <span
                        className={
                          group.operationalPercent >= 80
                            ? "text-emerald-400"
                            : group.operationalPercent >= 50
                              ? "text-amber-400"
                              : "text-red-400"
                        }
                      >
                        {group.operationalPercent}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          group.operationalPercent >= 80
                            ? "bg-emerald-500"
                            : group.operationalPercent >= 50
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${group.operationalPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover hint */}
              <p className="text-[10px] text-muted-foreground/60 mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {t.executiveDashboard.clickToFilter}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
