/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useTelemetry } from "@/hooks/useTelemetry"
import { AlertTriangle, WifiOff, Clock, ShieldCheck } from "lucide-react"

export function SystemActivityPanel() {
  const { events } = useTelemetry()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const {
    recentCritical,
    recentDisconnects,
    lastEventSeconds,
    stability,
  } = useMemo(() => {
    const now = Date.now()
    const FIVE_MIN = 5 * 60 * 1000

    let recentCritical = 0
    let recentDisconnects = 0

    events.forEach((event) => {
      const ts = new Date(event.timestamp).getTime()

      if (now - ts <= FIVE_MIN) {
        if (event.type === "ALARM") recentCritical++
        if (event.type === "DISCONNECTED") recentDisconnects++
      }
    })

    const lastEvent = events[0]
    const lastEventSeconds = lastEvent
      ? Math.floor((now - new Date(lastEvent.timestamp).getTime()) / 1000)
      : null

    const instabilityScore = recentCritical + recentDisconnects

    const stability =
      instabilityScore === 0
        ? "STABLE"
        : instabilityScore < 3
          ? "DEGRADED"
          : "UNSTABLE"

    return {
      recentCritical,
      recentDisconnects,
      lastEventSeconds,
      stability,
    }
  }, [events, tick])

  const stabilityColor =
    stability === "STABLE"
      ? "text-green-500"
      : stability === "DEGRADED"
        ? "text-yellow-500"
        : "text-red-500"

  return (
    <Card >
      <CardContent className="p-6 space-y-5 text-white">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-sm uppercase tracking-wide text-neutral-400">
            Actividad del sistema
          </div>

          <div className={`flex items-center gap-2 text-sm font-semibold ${stabilityColor}`}>
            <ShieldCheck className="h-4 w-4" />
            {stability}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-3 gap-6 text-sm">

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-neutral-400">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Eventos críticos
            </div>
            <div className="text-2xl font-bold text-red-500">
              {recentCritical}
            </div>
            <div className="text-xs text-neutral-500">
              últimos 5 min
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-neutral-400">
              <WifiOff className="h-4 w-4 text-orange-500" />
              Desconexiones
            </div>
            <div className="text-2xl font-bold text-orange-500">
              {recentDisconnects}
            </div>
            <div className="text-xs text-neutral-500">
              últimos 5 min
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-neutral-400">
              <Clock className="h-4 w-4 text-neutral-400" />
              Último evento
            </div>
            <div className="text-2xl font-bold">
              {lastEventSeconds !== null
                ? `${lastEventSeconds}s`
                : "--"}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
