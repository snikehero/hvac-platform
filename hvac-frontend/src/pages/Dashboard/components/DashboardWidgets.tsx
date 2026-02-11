import { Card, CardContent } from "@/components/ui/card"
import {
  Activity,
  Thermometer,
  Droplet,
  AlertTriangle,
  Building2,
  PlugZap,
} from "lucide-react"

interface DashboardStats {
  alarms: number
  warnings: number
  avgTemp: number | null
  avgHumidity: number | null
  totalAhus: number
  disconnected: number
}

interface Props {
  stats: DashboardStats
  onReset: () => void
  onFilterStatus: (
    status: "OK" | "WARNING" | "ALARM" | "DISCONNECTED"
  ) => void
}

export function DashboardWidgets({
  stats,
  onReset,
  onFilterStatus,
}: Props) {
  const noData = stats.totalAhus === 0

  const systemStatus = noData
    ? "SIN DATOS"
    : stats.alarms > 0
      ? "ALARM"
      : stats.warnings > 0
        ? "WARNING"
        : "OK"

  const systemColor =
    systemStatus === "ALARM"
      ? "text-red-500"
      : systemStatus === "WARNING"
        ? "text-yellow-500"
        : systemStatus === "SIN DATOS"
          ? "text-neutral-500"
          : "text-green-500"

  const widgets = [
    {
      icon: Building2,
      label: "Total AHUs",
      value: stats.totalAhus,
      valueClass: "text-white",
      onClick: onReset,
    },
        {
      icon: PlugZap,
      label: "AHUs desconectados",
      value: noData ? "--" : stats.disconnected,
      valueClass:
        stats.disconnected > 0
          ? "text-orange-500"
          : "text-white",
      onClick:
        stats.disconnected > 0
          ? () => onFilterStatus("DISCONNECTED")
          : undefined,
    },

    {
      icon: Activity,
      label: "Estado del sistema",
      value: systemStatus,
      valueClass: systemColor,
      onClick:
        systemStatus === "OK" ||
        systemStatus === "WARNING" ||
        systemStatus === "ALARM"
          ? () =>
              onFilterStatus(
                systemStatus as
                  | "OK"
                  | "WARNING"
                  | "ALARM"
              )
          : undefined,
    },
    {
      icon: AlertTriangle,
      label: "Alarmas activas",
      value: noData ? "--" : stats.alarms,
      valueClass:
        stats.alarms > 0
          ? "text-red-500"
          : "text-white",
      onClick:
        stats.alarms > 0
          ? () => onFilterStatus("ALARM")
          : undefined,
    },
    {
      icon: Thermometer,
      label: "Temperatura promedio",
      value:
        stats.avgTemp !== null && !noData
          ? `${stats.avgTemp.toFixed(1)}°`
          : "--",
      valueClass: "text-white",
    },
    {
      icon: Droplet,
      label: "Humedad promedio",
      value:
        stats.avgHumidity !== null && !noData
          ? `${stats.avgHumidity.toFixed(1)}%`
          : "--",
      valueClass: "text-white",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
      {widgets.map(
        ({
          icon: Icon,
          label,
          value,
          valueClass,
          onClick,
        }) => (
          <Card
            key={label}
            onClick={onClick}
            className={`relative bg-neutral-900 border border-neutral-800
              ${noData ? "opacity-70" : ""}
              ${onClick ? "cursor-pointer hover:border-neutral-600" : ""}
            `}
          >
            <CardContent className="p-4 space-y-2">
              <div className="text-xs text-neutral-400 tracking-wide uppercase">
                {label}
              </div>

              <div
                className={`text-3xl font-bold tracking-tight ${valueClass}`}
              >
                {value}
              </div>

              <Icon className="absolute top-4 right-4 h-6 w-6 text-neutral-700" />
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}
