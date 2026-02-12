import { Card, CardContent } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import type { PlantStats } from "../hooks/usePlantStats"

export function PlantHealthPanel({
  plants,
}: {
  plants: PlantStats[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plants.map((plant) => {
        const color =
          plant.status === "CRITICAL"
            ? "border-red-600"
            : plant.status === "DEGRADED"
              ? "border-orange-500"
              : "border-green-600"

        return (
          <Card
            key={plant.plantId}
            className={`bg-neutral-900 border-2 ${color}`}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Planta {plant.plantId}
                </span>
                <Building2 className="h-4 w-4 text-neutral-500" />
              </div>

              <div className="text-sm text-neutral-400">
                {plant.total} AHUs
              </div>

              <div className="text-xs space-y-1">
                <div>🔴 Alarmas: {plant.alarms}</div>
                <div>🟠 Warnings: {plant.warnings}</div>
                <div>⚫ Desconectados: {plant.disconnected}</div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
