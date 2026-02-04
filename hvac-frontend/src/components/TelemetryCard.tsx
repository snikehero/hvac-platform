import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer, Droplets, Fan } from "lucide-react"
import type { HvacTelemetry } from "@/types/telemetry"

interface Props {
  ahu: HvacTelemetry
}

export default function TelemetryCard({ ahu }: Props) {
  const { stationId, points, timestamp } = ahu

  const temperature = points.temperature
  const humidity = points.humidity
  const fan = points.fan_status
  const status = points.status?.value as string | undefined

  const statusVariant =
    status === "ALARM"
      ? "destructive"
      : status === "WARNING"
      ? "secondary"
      : "default"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{stationId}</CardTitle>
        <Badge variant={statusVariant}>{status ?? "N/A"}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <Row
          icon={<Thermometer className="h-4 w-4" />}
          label="Temperatura"
          value={`${temperature?.value ?? "--"} ${temperature?.unit ?? ""}`}
        />

        <Row
          icon={<Droplets className="h-4 w-4" />}
          label="Humedad"
          value={`${humidity?.value ?? "--"} ${humidity?.unit ?? ""}`}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Fan className="h-4 w-4" />
            Ventilador
          </div>
          <Badge variant={fan?.value === "ON" ? "default" : "outline"}>
            {fan?.value ?? "--"}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground pt-2">
          Última actualización:{" "}
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        {label}
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
