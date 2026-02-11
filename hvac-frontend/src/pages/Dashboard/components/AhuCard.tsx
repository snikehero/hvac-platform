import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MiniLineChart from "@/components/Charts/MiniLineChart"

import { useAhuHistory } from "@/hooks/useAhuHistory"
import { getAhuHealth } from "@/domain/ahu/getAhuHealth"

import type { HvacTelemetry } from "@/types/telemetry"

interface Props {
  ahu: HvacTelemetry
  onClick?: () => void
}

export function AhuCard({ ahu, onClick }: Props) {
  const history = useAhuHistory(ahu)

  // Estado operativo global
  const health = getAhuHealth(ahu)

  const temperature = Number(ahu.points.temperature?.value)
  const humidity = Number(ahu.points.humidity?.value)

  return (
    <Card
      onClick={onClick}
      className="
        bg-gray-800
        hover:bg-gray-700
        cursor-pointer
        transition
        border
        border-transparent
        hover:border-gray-600
      "
    >
      {/* ---------- Header ---------- */}
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="font-semibold text-sm">
          {ahu.stationId} de {ahu.plantId}
        </span>

        <HealthBadge status={health.status} />
      </CardHeader>

      {/* ---------- Content ---------- */}
      <CardContent className="space-y-3">
        {/* Temperatura */}
        <MetricRow
          label="Temperatura"
          value={
            !isNaN(temperature)
              ? `${temperature.toFixed(1)} °C`
              : "--"
          }
          chart={
            history.temperature.length > 0 ? (
              <MiniLineChart
                data={history.temperature}
                color="#38bdf8"
                height={40}
              />
            ) : null
          }
        />

        {/* Humedad */}
        <MetricRow
          label="Humedad"
          value={
            !isNaN(humidity)
              ? `${humidity.toFixed(1)} %`
              : "--"
          }
          chart={
            history.humidity.length > 0 ? (
              <MiniLineChart
                data={history.humidity}
                color="#22c55e"
                height={40}
              />
            ) : null
          }
        />

        {/* Advertencias */}
        {health.badPoints > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Sensores con error
            </span>
            <Badge variant="secondary">
              {health.badPoints}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* ----------------------- Subcomponentes ---------------------------- */
/* ------------------------------------------------------------------ */

function HealthBadge({
  status,
}: {
  status: "OK" | "WARNING" | "ALARM" | "DISCONNECTED"
}) {
  const config = {
    OK: {
      label: "OK",
      variant: "default",
    },
    WARNING: {
      label: "WARNING",
      variant: "secondary",
    },
    ALARM: {
      label: "ALARM",
      variant: "destructive",
    },
    DISCONNECTED: {
      label: "OFFLINE",
      variant: "outline",
    },
  } as const

  const { label, variant } = config[status]

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  )
}

function MetricRow({
  label,
  value,
  chart,
}: {
  label: string
  value: string
  chart?: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {label}
        </span>
        <span className="font-medium">
          {value}
        </span>
      </div>

      {chart}
    </div>
  )
}
