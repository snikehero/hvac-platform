import type { HvacTelemetry } from "@/types/telemetry";
import PowerCard from "@/components/Graphs/Power/PowerCard";
import FilterCard from "@/components/Graphs/Power/FilterCard";
export default function AhuStateEnergySection({ ahu }: { ahu: HvacTelemetry }) {
  const power = ahu.points["power_status"];
  const filter = ahu.points["filter_dp"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {power && (
        <PowerCard status={power.value as "ON" | "OFF"} title="Energía" />
      )}
      {filter && <FilterCard dp={Number(filter.value)} title="ΔP Filtros" />}
    </div>
  );
}
