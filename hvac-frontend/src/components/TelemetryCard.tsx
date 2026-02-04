import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer, Droplets, Fan } from "lucide-react"
import type { TelemetryDto } from "@/types/telemetry"

interface TelemetryCardProps {
  stationId: string
  telemetry: TelemetryDto[]
}

export default function TelemetryCard({
  stationId,
  telemetry,
}: TelemetryCardProps) {
  const getPoint = (key: string) =>
    telemetry.find(
      (t) => t.stationId === stationId && t.pointKey === key,
    )

  const temperature = getPoint("temperature")
  const humidity = getPoint("humidity")
  const fan = getPoint("fan_status")
  const status = getPoint("status")

  const statusValue = status?.value as string | undefined

  const statusColor =
    statusValue === "ALARM"
      ? "destructive"
      : statusValue === "WARNING"
      ? "secondary"
      : "default"

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{stationId}</CardTitle>
        <Badge variant={statusColor}>{statusValue ?? "N/A"}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Temperature */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Thermometer className="h-4 w-4" />
            Temperatura
          </div>
          <span className="font-semibold">
            {temperature?.value ?? "--"} {temperature?.unit}
          </span>
        </div>

        {/* Humidity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="h-4 w-4" />
            Humedad
          </div>
          <span className="font-semibold">
            {humidity?.value ?? "--"} {humidity?.unit}
          </span>
        </div>

        {/* Fan */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Fan className="h-4 w-4" />
            Ventilador
          </div>
          <Badge variant={fan?.value === "ON" ? "default" : "outline"}>
            {fan?.value ?? "--"}
          </Badge>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground pt-2">
          Última actualización:{" "}
          {temperature?.timestamp
            ? new Date(temperature.timestamp).toLocaleTimeString()
            : "--"}
        </div>
      </CardContent>
    </Card>
  )
}
