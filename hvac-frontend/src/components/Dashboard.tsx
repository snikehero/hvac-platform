import { useTelemetry } from "../hooks/useTelemetry";
import { TelemetryCard } from "./TelemetryCard";

export function Dashboard() {
  const telemetry = useTelemetry();

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {telemetry.map((t, i) => (
        <TelemetryCard key={i} data={t} />
      ))}
    </div>
  );
}
