// src/app/page.tsx
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Thermometer,
  AlertTriangle,
  AirVent,
  Bell,
  ShieldCheck,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { useTelemetry } from "@/hooks/useTelemetry"
import { useWebSocket } from "@/hooks/useWebSocket"
import { getAhuHealth } from "@/domain/ahu/getAhuHealth"

export default function HomePage() {
  const { telemetry } = useTelemetry()
  const connected = useWebSocket()

  /* -------------------------------- */
  /* Contadores usando HEALTH */
  /* -------------------------------- */

  const { activeAlarms, activeWarnings } = useMemo(() => {
    let alarms = 0
    let warnings = 0

    telemetry.forEach((ahu) => {
      const health = getAhuHealth(ahu)

      if (health.status === "ALARM") alarms++
      else if (health.status === "WARNING") warnings++
    })

    return { activeAlarms: alarms, activeWarnings: warnings }
  }, [telemetry])

  /* -------------------------------- */
/* Salud Operacional Global */
/* -------------------------------- */

const systemHealth = useMemo(() => {
  if (telemetry.length === 0) return "NO_DATA"

  let hasAlarm = false
  let hasWarning = false
  let hasDisconnected = false

  telemetry.forEach((ahu) => {
    const health = getAhuHealth(ahu)

    if (health.status === "ALARM") hasAlarm = true
    else if (health.status === "WARNING") hasWarning = true
    else if (health.status === "DISCONNECTED") hasDisconnected = true
  })

  if (hasAlarm) return "CRITICAL"
  if (hasWarning || hasDisconnected) return "DEGRADED"

  return "HEALTHY"
}, [telemetry])

const healthColor =
  systemHealth === "CRITICAL"
    ? "text-red-600"
    : systemHealth === "DEGRADED"
      ? "text-orange-500"
      : systemHealth === "NO_DATA"
        ? "text-neutral-500"
        : "text-green-600"

  /* -------------------------------- */
  /* Temperatura promedio (solo conectados) */
  /* -------------------------------- */

  const avgTemperature = useMemo(() => {
    const temps: number[] = []

    telemetry.forEach((ahu) => {
      const health = getAhuHealth(ahu)

      // 🚫 Ignorar desconectados
      if (health.status === "DISCONNECTED") return

      const t = ahu.points.temperature?.value
      if (typeof t === "number") temps.push(t)
    })

    return temps.length
      ? temps.reduce((a, b) => a + b, 0) / temps.length
      : null
  }, [telemetry])

  const avgTemperatureDisplay =
    avgTemperature !== null ? `${avgTemperature.toFixed(1)} °C` : "--"

  /* -------------------------------- */
  /* Widgets */
  /* -------------------------------- */

  const widgets = [
    {
      icon: Activity,
      title: "Estado del sistema",
      value: connected ? "ONLINE" : "OFFLINE",
      subtitle: connected
        ? "Conexión establecida"
        : "Sin conexión al servidor",
      color: connected ? "text-green-600" : "text-red-600",
    },
      {
    icon: ShieldCheck,
    title: "Salud Operacional",
    value: systemHealth,
    subtitle: "Estado global de AHUs",
    color: healthColor,
  },
    {
      icon: Thermometer,
      title: "Temperatura promedio",
      value: avgTemperatureDisplay,
      subtitle: "AHUs actualmente activos",
      color: "text-blue-600",
    },
    {
      icon: AlertTriangle,
      title: "Alarmas activas",
      value: (
        <Badge variant="destructive" className="animate-pulse">
          {activeAlarms}
        </Badge>
      ),
      subtitle: "Requieren atención",
      color: "text-red-600",
    },
    {
      icon: AirVent,
      title: "Warnings activos",
      value: (
        <Badge variant="secondary" className="animate-pulse">
          {activeWarnings}
        </Badge>
      ),
      subtitle: "Monitoreo necesario",
      color: "text-yellow-600",
    },
  ]

  /* -------------------------------- */
  /* Quick Links */
  /* -------------------------------- */

  const quickLinks = [
    {
      to: "/dashboardHVAC",
      label: "HVAC",
      icon: AirVent,
      color: "text-blue-500",
    },
    { to: "/alarms", label: "Alarmas", icon: Bell, color: "text-red-500" },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">FireIIOT Platform</h1>
      <p className="text-muted-foreground">
        Monitoreo en tiempo real de PLCs y sistemas conectados
      </p>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {widgets.map(({ icon: Icon, title, value, subtitle, color }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="relative flex items-center">
                <Icon className={color} />
                {title === "Estado del sistema" && (
                  <span
                    className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${
                      connected
                        ? "bg-green-500 animate-ping"
                        : "bg-red-500 animate-pulse"
                    }`}
                  />
                )}
              </div>
              <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>
              <p className={`text-2xl font-semibold ${color}`}>
                {value}
              </p>
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className="hover:scale-105 transition cursor-pointer border-2 border-transparent hover:border-blue-400">
              <CardContent className="flex flex-col items-center gap-2 py-6">
                <link.icon className={`h-6 w-6 ${link.color}`} />
                <p className="font-semibold">{link.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="pt-4">
        <Link to="/dashboard">
          <Button size="lg">Ir al Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
