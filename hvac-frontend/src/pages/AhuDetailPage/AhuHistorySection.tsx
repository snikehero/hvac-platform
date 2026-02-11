/* eslint-disable @typescript-eslint/no-explicit-any */
import { AhuHistoryTemperatureChart } from "@/components/History/AhuHistoryTemperatureCard";
import { AhuHistoryHumidityChart } from "@/components/History/AhuHistoryHumidityChart";
import { AhuSection } from "@/components/ahu/AhuSection";
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth";

export default function AhuHistorySection({
  history,
  status,
}: {
  history: {
    temperature: any[];
    humidity: any[];
  };
  status: AhuHealthStatus;
}) {
  return (
    <AhuSection title="Histórico reciente" status={status}>
      <div className="grid md:grid-cols-2 gap-4">
        <AhuHistoryTemperatureChart 
          data={history.temperature}
          status={status}
        />

        <AhuHistoryHumidityChart 
          data={history.humidity}
          status={status}
        />
      </div>
    </AhuSection>
  );
}
