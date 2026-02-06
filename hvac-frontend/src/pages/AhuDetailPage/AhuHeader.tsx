import { Badge } from "@/components/ui/badge"
import type { HvacTelemetry } from "@/types/telemetry"

export default function AhuHeader({
  ahu,
  status,
}: {
  ahu: HvacTelemetry
  status?: "OK" | "WARNING" | "ALARM"
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          {ahu.stationId}
        </h1>
        <p className="text-muted-foreground">
          Planta {ahu.plantId}
        </p>
      </div>

      <Badge
        variant={
          status === "ALARM"
            ? "destructive"
            : status === "WARNING"
            ? "secondary"
            : "default"
        }
      >
        {status ?? "N/A"}
      </Badge>
    </div>
  )
}
