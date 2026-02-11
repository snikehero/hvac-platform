import TelemetryCard from "@/components/TelemetryCard/TelemetryCard"
import { useTelemetry } from "@/hooks/useTelemetry"
import type { HvacTelemetry } from "@/types/telemetry"
import { isAhuConnected, getAhuOperationalStatus } 
  from "@/domain/ahu/ahuSelectors"

export default function DashboardHVAC() {
  const { telemetry } = useTelemetry()

const connectedAhus = telemetry.filter(isAhuConnected)


const groupedByPlant = groupByPlant(connectedAhus)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard HVAC</h1>
        <p className="text-muted-foreground">
          Estado en tiempo real de unidades HVAC
        </p>
      </div>

      {Object.entries(groupedByPlant).map(([plantId, ahus]) => {
        const alarmActive = hasAlarm(ahus)
        return (
          <section
            key={plantId}
            className={alarmActive ? "alarm-glow p-4 rounded-lg" : "p-4"}
          >
            {/* Header de planta */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Planta {plantId}
              </h2>

              <span className="text-xs text-muted-foreground">
                {ahus.length} AHU{ahus.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Grid de AHUs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {ahus.map((ahu) => (
                <TelemetryCard
                  key={`${ahu.plantId}-${ahu.stationId}`}
                  ahu={ahu}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

/* ---------- helpers ---------- */

function groupByPlant(telemetry: HvacTelemetry[]) {
  return telemetry.reduce<Record<string, HvacTelemetry[]>>((acc, ahu) => {
    if (!acc[ahu.plantId]) {
      acc[ahu.plantId] = []
    }
    acc[ahu.plantId].push(ahu)
    return acc
  }, {})
}

function hasAlarm(ahus: HvacTelemetry[]) {
  return ahus.some(
    (ahu) => getAhuOperationalStatus(ahu) === "ALARM"
  )
}