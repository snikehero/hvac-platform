/* eslint-disable @typescript-eslint/no-explicit-any */
// renderAhuCard.tsx

import TemperatureCard from "../../../../components/Graphs/Temperature/TemperatureCard";
import HumidityCard from "../../../../components/Graphs/Humidity/HumidityCard";
import FanCardIndustrial from "../../../../components/Graphs/Fan/FanCard";
import AirflowCard from "../../../../components/Graphs/Fan/AirflowCard";
import DamperCard from "../../../../components/Graphs/Fan/DamperCard";
import PowerCard from "../../../../components/Graphs/Power/PowerCard";
import FilterCard from "../../../../components/Graphs/Power/FilterCard";

import { type AhuCardId } from "@/types/AhuCardId";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";

export function renderAhuCard(id: AhuCardId, ahu: any) {
  const points = ahu.points;

  // 🔥 Nuevo status real del dominio
  const health = getAhuHealth(ahu);
  const status = health.status;

  switch (id) {
    case "temperature":
      return <TemperatureCard temperature={points.temperature?.value ?? 0} />;

    case "humidity":
      return <HumidityCard humidity={points.humidity?.value ?? 0} />;

    case "fan":
      return <FanCardIndustrial status={points.fan_status?.value ?? "OFF"} />;

    case "airflow":
      return (
        <AirflowCard
          airflow={points.airflow?.value ?? 0}
          status={status} // ✅ ahora usa health real
        />
      );

    case "damper":
      return <DamperCard position={points.damper_position?.value ?? 0} />;

    case "power":
      return <PowerCard status={points.power_status?.value ?? "OFF"} />;

    case "filter":
      return <FilterCard dp={points.filter_dp?.value ?? 0} />;

    default:
      return null;
  }
}
