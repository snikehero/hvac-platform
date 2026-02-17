import { useMemo } from "react";
import { useAhuHealth } from "@/hooks/useAhuHealth";
import { useClock } from "@/domain/hooks/useClock";
import type { HvacTelemetry } from "@/types/telemetry";
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  telemetry: HvacTelemetry[];
  onNavigate: (plantId: string, ahuId: string) => void;
}

const CELL_CLASSES: Record<AhuHealthStatus, string> = {
  OK: "bg-green-600/80 hover:bg-green-500 border-green-500/30",
  WARNING: "bg-yellow-600/80 hover:bg-yellow-500 border-yellow-500/30",
  ALARM: "bg-red-600/80 hover:bg-red-500 border-red-500/50 animate-pulse ring-1 ring-red-400 ring-offset-1 ring-offset-background",
  DISCONNECTED: "bg-neutral-700/80 hover:bg-neutral-600 border-neutral-600/30",
};

const LEGEND_ITEMS: { status: AhuHealthStatus; colorClass: string }[] = [
  { status: "OK", colorClass: "bg-green-600" },
  { status: "WARNING", colorClass: "bg-yellow-600" },
  { status: "ALARM", colorClass: "bg-red-600" },
  { status: "DISCONNECTED", colorClass: "bg-neutral-700" },
];

export function PlantHeatMap({ telemetry, onNavigate }: Props) {
  const getHealth = useAhuHealth();
  const now = useClock(1000);
  const { t } = useTranslation();

  const grouped = useMemo(() => {
    return telemetry.reduce<Record<string, HvacTelemetry[]>>((acc, ahu) => {
      if (!acc[ahu.plantId]) acc[ahu.plantId] = [];
      acc[ahu.plantId].push(ahu);
      return acc;
    }, {});
  }, [telemetry]);

  // Health map re-computes every second (via `now`) to detect stale connections
  const healthMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getHealth>>();
    telemetry.forEach((ahu) =>
      map.set(`${ahu.plantId}-${ahu.stationId}`, getHealth(ahu)),
    );
    return map;
  }, [telemetry, getHealth, now]);

  const sortedPlants = useMemo(
    () => Object.keys(grouped).sort(),
    [grouped],
  );

  return (
    <div className="space-y-5">
      {/* Header + Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">{t.plantHeatMap.title}</h3>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium">{t.plantHeatMap.legend}:</span>
          {LEGEND_ITEMS.map(({ status, colorClass }) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${colorClass}`} />
              <span>{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plant rows */}
      <div className="space-y-5">
        {sortedPlants.map((plantId) => {
          const ahus = grouped[plantId];
          return (
            <div key={plantId}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  {t.plantPanel.plant} {plantId}
                </span>
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground">
                  {ahus.length} {t.plantPanel.units}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ahus.map((ahu) => {
                  const health = healthMap.get(
                    `${ahu.plantId}-${ahu.stationId}`,
                  )!;
                  const temp = ahu.points.temperature?.value;
                  const hum = ahu.points.humidity?.value;
                  const ageSecs = Math.floor(
                    (Date.now() - new Date(ahu.timestamp).getTime()) / 1000,
                  );

                  const tooltip = [
                    `${ahu.stationId}`,
                    health.status,
                    typeof temp === "number" ? `${temp.toFixed(1)}°C` : null,
                    typeof hum === "number" ? `${hum.toFixed(1)}%` : null,
                    `${ageSecs}s ago`,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <button
                      key={ahu.stationId}
                      title={tooltip}
                      onClick={() => onNavigate(ahu.plantId, ahu.stationId)}
                      className={`
                        w-10 h-10 rounded-md border cursor-pointer
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
                        ${CELL_CLASSES[health.status]}
                      `}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {sortedPlants.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.common.noData}</p>
        )}
      </div>
    </div>
  );
}
