import type { HvacTelemetry } from "@/types/telemetry";
import TemperatureCard from "@/components/Graphs/Temperature/TemperatureCard";
import HumidityCard from "@/components/Graphs/Humidity/HumidityCard";
export default function AhuTempHumSection({ ahu }: { ahu: HvacTelemetry }) {
  const temp = ahu.points["temperature"];
  const humidity = ahu.points["humidity"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {temp && <TemperatureCard temperature={Number(temp.value)} />}
      {humidity && <HumidityCard humidity={Number(humidity.value)} />}
    </div>
  );
}
