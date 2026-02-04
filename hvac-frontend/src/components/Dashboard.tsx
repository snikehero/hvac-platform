import TelemetryCard from "@/components/TelemetryCard"
import { useTelemetry } from "@/hooks/useTelemetry"

export default function Dashboard() {
  const { telemetry } = useTelemetry()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard HVAC</h1>
      <p className="text-muted-foreground">
        Estado en tiempo real de unidades HVAC
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {telemetry.map((ahu) => (
          <TelemetryCard key={ahu.stationId} ahu={ahu} />
        ))}
      </div>
    </div>
  )
}
