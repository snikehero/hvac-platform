import { CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TelemetryCardHeader({
  stationId,
  status,
}: {
  stationId: string
  status?: "OK" | "WARNING" | "ALARM"
}) {
  const variant =
    status === "ALARM"
      ? "destructive"
      : status === "WARNING"
      ? "secondary"
      : "default"

  return (
    <CardHeader className="flex flex-row items-center justify-between pb-3">
      <CardTitle className="text-lg font-semibold text-white">
        {stationId}
      </CardTitle>

      <Badge variant={variant}>
        {status ?? "N/A"}
      </Badge>
    </CardHeader>
  )
}
