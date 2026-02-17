import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useTelemetry } from "@/hooks/useTelemetry";
import { useFilteredAhus } from "./hooks/useFilteredAhus";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { useSettings } from "@/context/SettingsContext";

import { DashboardWidgets } from "./components/DashboardWidgets";
import { AhuCard } from "./components/AhuCard";
import { HeroSystemStatus } from "./components/HeroSystemStatus";
import { HeroPlantPanel } from "./components/HeroPlantPanel";
import { SystemActivityPanel } from "./components/SystemActivityPanel";
import { routes } from "@/router/routes";
import { useTranslation } from "@/i18n/useTranslation";

export default function DashboardEjecutivoPage() {
  const { telemetry } = useTelemetry();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useSettings();

  /* -------------------- filtros -------------------- */
  const [plantFilter, setPlantFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "OK" | "WARNING" | "ALARM" | "DISCONNECTED" | null
  >(null);

  /* -------------------- datos derivados -------------------- */

  // KPIs always global (unfiltered)
  const stats = useDashboardStats(telemetry);

  // Grid respects filters
  const filteredAhus = useFilteredAhus(telemetry, plantFilter, statusFilter);

  const plants = Array.from(new Set(telemetry.map((ahu) => ahu.plantId)));

  /* -------------------- KPI actions -------------------- */

  const handleFilterByStatus = (
    status: "OK" | "WARNING" | "ALARM" | "DISCONNECTED",
  ) => {
    setPlantFilter(null);
    setStatusFilter(status);
  };

  const { widgets } = settings.dashboard;

  return (
    <div className="p-6 lg:p-8 space-y-8 lg:space-y-10">
      {/* ================= HEADER ================= */}
      <div className="space-y-2">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
          {t.dashboardPage.title}
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          {t.dashboardPage.subtitle}
        </p>
      </div>

      {/* ================= CONFIGURABLE WIDGETS ================= */}
      {widgets
        .filter((w) => w.visible)
        .map((w) => {
          switch (w.id) {
            case "hero-system-status":
              return <HeroSystemStatus key={w.id} />;

            case "plant-activity-block":
              return (
                <div key={w.id} className="space-y-8 lg:space-y-10">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <HeroPlantPanel
                        telemetry={telemetry}
                        onSelectPlant={(plantId) => {
                          setPlantFilter(plantId);
                          setStatusFilter(null);
                        }}
                      />
                    </div>
                  </div>
                  <SystemActivityPanel />
                </div>
              );

            case "kpi-widgets":
              return (
                <DashboardWidgets
                  key={w.id}
                  stats={stats}
                  onFilterStatus={handleFilterByStatus}
                />
              );

            default:
              return null;
          }
        })}

      {/* ================= FILTROS ================= */}
      <div className="border-t border-neutral-800 pt-6">
        <div className="flex flex-wrap gap-6 items-end">
          {/* ----------- Plant Filter ----------- */}
          <div className="flex flex-col gap-2 min-w-55">
            <Label>{t.dashboardPage.filterByPlant}</Label>
            <Select
              value={plantFilter ?? "ALL"}
              onValueChange={(value) =>
                setPlantFilter(value === "ALL" ? null : value)
              }
            >
              <SelectTrigger className="bg-neutral-900 border-neutral-700">
                <SelectValue placeholder={t.dashboardPage.allPlants} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">{t.dashboardPage.allPlants}</SelectItem>
                {plants.map((plant) => (
                  <SelectItem key={plant} value={plant}>
                    {plant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ----------- Status Filter ----------- */}
          <div className="flex flex-col gap-2 min-w-55">
            <Label>{t.dashboardPage.filterByStatus}</Label>
            <Select
              value={statusFilter ?? "ALL"}
              onValueChange={(value) =>
                setStatusFilter(
                  value === "ALL"
                    ? null
                    : (value as "OK" | "WARNING" | "ALARM" | "DISCONNECTED"),
                )
              }
            >
              <SelectTrigger className="bg-neutral-900 border-neutral-700">
                <SelectValue placeholder={t.dashboardPage.allStatuses} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">{t.dashboardPage.allStatuses}</SelectItem>
                <SelectItem value="OK">{t.status.ok}</SelectItem>
                <SelectItem value="WARNING">{t.status.warning}</SelectItem>
                <SelectItem value="ALARM">{t.status.alarm}</SelectItem>
                <SelectItem value="DISCONNECTED">{t.status.disconnected}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ================= GRID AHUs ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {filteredAhus.map((ahu) => (
          <AhuCard
            key={`${ahu.plantId}-${ahu.stationId}`}
            ahu={ahu}
            onClick={() =>
              navigate(routes.hvac.ahuDetail3D(ahu.plantId, ahu.stationId))
            }
          />
        ))}

        {filteredAhus.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground">
            {t.dashboardPage.noAhusMatch}
          </div>
        )}
      </div>
    </div>
  );
}
