import { CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth"

export default function TelemetryCardHeader({
  stationId,
  status,
}: {
  stationId: string
  status: AhuHealthStatus
}) {
  const variant =
    status === "ALARM"
      ? "destructive"
      : status === "WARNING"
        ? "secondary"
        : status === "DISCONNECTED"
          ? "outline"
          : "default"

  const label =
    status === "DISCONNECTED"
      ? "SIN COMUNICACIÓN"
      : status

  return (
    <CardHeader className="flex flex-row items-center justify-between pb-3">
      <CardTitle className="text-lg font-semibold text-white">
        {stationId}
      </CardTitle>

      <Badge variant={variant}>
        {label}
      </Badge>
    </CardHeader>
  )
}
