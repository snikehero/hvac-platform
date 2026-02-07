import type { HvacTelemetry } from "@/types/telemetry";
import FanCard from "@/components/Graphs/Fan/FanCard";
import AirflowCard from "@/components/Graphs/Fan/AirflowCard";
import DamperCard from "@/components/Graphs/Fan/DamperCard";

export default function AhuVentSection({ ahu }: { ahu: HvacTelemetry }) {
  const fan = ahu.points["fan_status"];
  const airflow = ahu.points["airflow"];
  const damper = ahu.points["damper_position"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {fan && <FanCard status={fan.value as "ON" | "OFF"} title="Ventilador" />}
      {airflow && (
        <AirflowCard airflow={Number(airflow.value)} title="Flujo de Aire" />
      )}
      {damper && (
        <DamperCard position={Number(damper.value)} title="Compuerta" />
      )}
    </div>
  );
}
