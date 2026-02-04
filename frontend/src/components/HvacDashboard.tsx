import { useHvacTelemetry } from "../hooks/useHvacTelemetry";

export function HvacDashboard() {
  const telemetry = useHvacTelemetry();

  return (
    <div style={{ padding: 24 }}>
      <h2>HVAC – Telemetría en tiempo real</h2>

      <div style={{ display: "grid", gap: 12 }}>
        {telemetry.map((t) => (
          <div
            key={`${t.stationId}-${t.pointKey}`}
            style={{
              border: "1px solid #ccc",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <strong>{t.stationId}</strong>
            <div>Punto: {t.pointKey}</div>
            <div>
              Valor: {t.value} {t.unit}
            </div>
            <div>Calidad: {t.quality}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
