import { useHvacTelemetry } from "../hooks/useHvacTelemetry";
import { AhuCard } from "./AhuCard";

export function HvacDashboard() {
  const telemetry = useHvacTelemetry();

  const grouped = telemetry.reduce(
    (acc, t) => {
      if (!acc[t.stationId]) acc[t.stationId] = [];
      acc[t.stationId].push(t);
      return acc;
    },
    {} as Record<string, typeof telemetry>,
  );

  return (
    <div style={{ padding: 24 }}>
      <h2>HVAC – AHU Overview</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {Object.entries(grouped).map(([stationId, points]) => (
          <AhuCard key={stationId} stationId={stationId} points={points} />
        ))}
      </div>
    </div>
  );
}
