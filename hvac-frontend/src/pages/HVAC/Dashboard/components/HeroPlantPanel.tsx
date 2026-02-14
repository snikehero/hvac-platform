import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { getAhuHealth } from "@/domain/ahu/getAhuHealth"
import type { HvacTelemetry } from "@/types/telemetry"

type PlantStatus =
  | "OK"
  | "WARNING"
  | "ALARM"
  | "DISCONNECTED"

interface Props {
  telemetry: HvacTelemetry[]
  onSelectPlant?: (plantId: string) => void
}

export function HeroPlantPanel({ telemetry, onSelectPlant }: Props) {
  const grouped = useMemo(() => {
    return telemetry.reduce<Record<string, HvacTelemetry[]>>((acc, ahu) => {
      if (!acc[ahu.plantId]) acc[ahu.plantId] = []
      acc[ahu.plantId].push(ahu)
      return acc
    }, {})
  }, [telemetry])
    
// eslint-disable-next-line react-hooks/exhaustive-deps
const SEVERITY_ORDER: Record<PlantStatus, number> = {
  ALARM: 0,
  DISCONNECTED: 1,
  WARNING: 2,
  OK: 3,
}

const plantSummaries = useMemo(() => {
  const summaries = Object.entries(grouped).map(([plantId, ahus]) => {
    let alarms = 0
    let warnings = 0
    let disconnected = 0

    ahus.forEach((ahu) => {
      const health = getAhuHealth(ahu)

      if (health.status === "ALARM") alarms++
      else if (health.status === "WARNING") warnings++
      else if (health.status === "DISCONNECTED") disconnected++
    })

    let status: PlantStatus = "OK"

    if (alarms > 0) status = "ALARM"
    else if (disconnected > 0) status = "DISCONNECTED"
    else if (warnings > 0) status = "WARNING"

    return {
      plantId,
      total: ahus.length,
      alarms,
      warnings,
      disconnected,
      status,
    }
  })

  // 🔥 Orden automático por severidad
  return summaries.sort(
    (a, b) => SEVERITY_ORDER[a.status] - SEVERITY_ORDER[b.status]
  )
}, [SEVERITY_ORDER, grouped])


  const statusColor = (status: PlantStatus) => {
    switch (status) {
      case "ALARM":
        return "bg-red-600"
      case "DISCONNECTED":
        return "bg-orange-500"
      case "WARNING":
        return "bg-yellow-500"
      default:
        return "bg-green-600"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {plantSummaries.map((plant) => (
        <Card
          key={plant.plantId}
          onClick={() => onSelectPlant?.(plant.plantId)}
          className={`p-6 text-white shadow-lg cursor-pointer transition hover:scale-105 ${statusColor(
            plant.status
          )}`}
        >
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">
              Planta {plant.plantId}
            </h3>

            <div className="text-sm opacity-90 space-y-1">
              <p>Total AHUs: {plant.total}</p>
              <p>Alarmas: {plant.alarms}</p>
              <p>Warnings: {plant.warnings}</p>
              <p>Desconectados: {plant.disconnected}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
