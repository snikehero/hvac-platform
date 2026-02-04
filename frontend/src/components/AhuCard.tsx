import type { Telemetry } from "../types/telemetry";

interface Props {
  stationId: string;
  points: Telemetry[];
}

export function AhuCard({ stationId, points }: Props) {
  return (
    <div
      style={{
        border: "2px solid #222",
        borderRadius: 12,
        padding: 16,
        minWidth: 250,
      }}
    >
      <h3>{stationId}</h3>

      {points.map((p) => (
        <div key={p.pointKey}>
          <strong>{p.pointKey}</strong>: {p.value} {p.unit}
        </div>
      ))}
    </div>
  );
}
