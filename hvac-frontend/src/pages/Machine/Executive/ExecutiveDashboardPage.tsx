import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useExecutiveDashboardData } from "./hooks/useExecutiveDashboardData";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { ExecutiveSkeleton } from "@/components/skeletons/ExecutiveSkeleton";
import type { DeviceHealthStatus } from "@/domain/device/getDeviceHealth";
import HeroSystemStatus from "./components/HeroSystemStatus";
import HeroPlantPanel from "./components/HeroPlantPanel";
import ExecutiveKpiWidgets from "./components/ExecutiveKpiWidgets";
import PlantHeatMap from "./components/PlantHeatMap";
import SystemActivityPanel from "./components/SystemActivityPanel";
import MachineInstanceCard from "./components/MachineInstanceCard";

export default function ExecutiveDashboardPage() {
  const { machineType: machineTypeSlug } = useParams<{ machineType: string }>();
  const { t } = useTranslation();
  const data = useExecutiveDashboardData(machineTypeSlug);

  const { connected } = useMachineTelemetry(machineTypeSlug);
  const [plantFilter, setPlantFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DeviceHealthStatus | null>(null);

  const handlePlantFilter = (plantId: string | null) => {
    setPlantFilter((prev) => (prev === plantId ? null : plantId));
  };

  const handleStatusFilter = (status: DeviceHealthStatus | null) => {
    setStatusFilter((prev) => (prev === status ? null : status));
  };

  const filteredInstances = useMemo(() => {
    let result = data.instances;
    if (plantFilter) {
      result = result.filter((inst) => inst.plantId === plantFilter);
    }
    if (statusFilter) {
      result = result.filter((inst) => {
        const key = `${inst.machineType}-${inst.plantId}-${inst.stationId}`;
        const entry = data.instanceHealthMap.get(key);
        return entry?.health.status === statusFilter;
      });
    }
    return result;
  }, [data.instances, data.instanceHealthMap, plantFilter, statusFilter]);

  if (!machineTypeSlug) return null;

  if (data.instances.length === 0 && connected) {
    return <ExecutiveSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground -m-6 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t.executiveDashboard.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {data.machineType?.name ?? machineTypeSlug}
        </p>
      </div>

      {/* Hero System Status */}
      <HeroSystemStatus
        systemStatus={data.systemStatus}
        stats={data.stats}
        machineTypeName={data.machineType?.name ?? machineTypeSlug}
      />

      {/* Plant Panel + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div className="xl:col-span-2">
          <HeroPlantPanel
            plantGroups={data.plantGroups}
            selectedPlant={plantFilter}
            onSelectPlant={handlePlantFilter}
          />
        </div>
        <div>
          <SystemActivityPanel
            recentEvents={data.recentEvents}
            stabilityScore={data.stabilityScore}
            machineTypeName={data.machineType?.name ?? machineTypeSlug}
          />
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="mt-8">
        <ExecutiveKpiWidgets
          stats={data.stats}
          onFilterByStatus={handleStatusFilter}
          activeFilter={statusFilter}
        />
      </div>

      {/* Heat Map */}
      <div className="mt-8">
        <PlantHeatMap
          plantGroups={data.plantGroups}
          instanceHealthMap={data.instanceHealthMap}
          displayVariables={data.displayVariables}
          machineTypeSlug={machineTypeSlug}
          statusFilter={statusFilter}
          plantFilter={plantFilter}
        />
      </div>

      {/* Instance Cards Grid */}
      <div className="mt-8">
        {(plantFilter || statusFilter) && (
          <div className="flex items-center gap-3 mb-4">
            {plantFilter && (
              <button
                onClick={() => setPlantFilter(null)}
                className="text-sm bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors"
              >
                {plantFilter} &times;
              </button>
            )}
            {statusFilter && (
              <button
                onClick={() => setStatusFilter(null)}
                className="text-sm bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors"
              >
                {statusFilter} &times;
              </button>
            )}
          </div>
        )}

        {filteredInstances.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">{t.executiveDashboard.noInstances}</p>
            <p className="text-sm mt-1">{t.executiveDashboard.noInstancesDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredInstances.map((inst) => {
              const key = `${inst.machineType}-${inst.plantId}-${inst.stationId}`;
              const entry = data.instanceHealthMap.get(key);
              const history = data.getInstanceHistory(inst.plantId, inst.stationId);
              return (
                <MachineInstanceCard
                  key={key}
                  instance={inst}
                  health={entry?.health ?? { status: "OK", badPoints: 0 }}
                  isConnected={entry?.isConnected ?? false}
                  displayVariables={data.displayVariables}
                  historyData={history}
                  machineTypeSlug={machineTypeSlug}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
