import TelemetryCard from "@/components/TelemetryCard"
import { useTelemetry } from "@/hooks/useTelemetry"

export default function Dashboard() {
  const { telemetry } = useTelemetry()

  // Obtener estaciones únicas (AHUs)
  const stations = Array.from(
    new Set(telemetry.map((t) => t.stationId)),
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard HVAC</h1>
      <p className="text-muted-foreground">
        Estado en tiempo real de unidades HVAC
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stations.map((stationId) => (
          <TelemetryCard
            key={stationId}
            stationId={stationId}
            telemetry={telemetry}
          />
        ))}
      </div>
    </div>
  )
}
