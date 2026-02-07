/* eslint-disable @typescript-eslint/no-explicit-any */
import { AhuHistoryTemperatureChart } from "@/components/History/AhuHistoryTemperatureCard";
import { AhuHistoryHumidityChart } from "@/components/History/AhuHistoryHumidityChart";
import { AhuSection } from "@/components/ahu/AhuSection";
import type { HvacStatus } from "@/types/hvac-status";

export default function AhuHistorySection({
  history,
  status,
}: {
  history: any;
  status?: HvacStatus;
}) {
  return (
    <AhuSection title="Histórico reciente" status={status}>
      <div className="grid md:grid-cols-2 gap-4">
        <AhuHistoryTemperatureChart
          data={history.temperature}
          status={status}
        />

        <AhuHistoryHumidityChart data={history.humidity} status={status} />
      </div>
    </AhuSection>
  );
}
