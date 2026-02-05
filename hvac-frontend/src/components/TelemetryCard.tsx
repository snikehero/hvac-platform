import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import type { HvacTelemetry } from "@/types/telemetry"
import { getPointIcon } from "./Helpers/getPointIcon"
interface Props {
  ahu: HvacTelemetry
}

const CORE_KEYS = ["temperature", "humidity", "fan_status", "status"]

export default function TelemetryCard({ ahu }: Props) {
  const navigate = useNavigate()
  const { stationId, points, timestamp, plantId } = ahu

  const temperature = points.temperature
  const humidity = points.humidity
  const fan = points.fan_status
  const hvacStatus = points.status?.value as
    | "OK"
    | "WARNING"
    | "ALARM"
    | undefined

  const statusVariant =
    hvacStatus === "ALARM"
    ? "destructive"
    : hvacStatus === "WARNING"
      ? "secondary"
    : "default"

  const overlayClass =
    hvacStatus === "ALARM"
      ? "bg-red-900/70"
      : hvacStatus === "WARNING"
      ? "bg-yellow-900/60"
      : "bg-black/50"

  const extraPoints = Object.entries(points).filter(
    ([key]) => !CORE_KEYS.includes(key),
  )

  return (
    <Card
      onClick={() =>
        navigate(`/plants/${plantId}/ahus/${stationId}`)
      }
      className="
        relative overflow-hidden
        cursor-pointer
        transition
        hover:shadow-lg
        hover:-translate-y-0.5
      "
    >
      {/* ---------- Background ---------- */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/ahu-bg.jpg')" }}
      />

      {/* ---------- Overlay ---------- */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* ---------- Content ---------- */}
      <div className="relative z-10 text-white">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            {stationId}
          </CardTitle>

          <Badge variant={statusVariant}>
            {hvacStatus ?? "N/A"}
          </Badge>
        </CardHeader>

        {/* Body */}
        <CardContent className="space-y-4">
          <Row
            icon={getPointIcon(
              "temperature",
              temperature?.value,
            )}
            label="Temperatura"
            value={`${temperature?.value ?? "--"} ${
              temperature?.unit ?? ""
            }`}
          />

          <Row
            icon={getPointIcon(
              "humidity",
              humidity?.value,
            )}
            label="Humedad"
            value={`${humidity?.value ?? "--"} ${
              humidity?.unit ?? ""
            }`}
          />

          {/* Fan */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              {getPointIcon("fan_status", fan?.value)}
              Ventilador
            </div>

            <Badge
              className={
                fan?.value === "ON"
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-white"
              }
            >
              {fan?.value ?? "--"}
            </Badge>
          </div>

          {/* Extra points */}
          {extraPoints.length > 0 && (
            <div className="pt-3 border-t border-white/20 space-y-2">
              <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                Datos adicionales
              </div>

              {extraPoints.map(([key, point]) => (
                <Row
                  key={key}
                  icon={getPointIcon(key, point.value)}
                  label={formatLabel(key)}
                  value={`${point.value ?? "--"} ${
                    point.unit ?? ""
                  }`}
                />
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="pt-2 text-xs text-white/60">
            Última actualización:{" "}
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

/* ---------- Helpers ---------- */

function formatLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
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
        <span className="font-medium text-white">
          {label}
        </span>
      </div>

      <span className="font-semibold tabular-nums text-white">
        {value}
      </span>
    </div>
  )
}
