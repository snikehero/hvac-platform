import { Card } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import type { HvacTelemetry } from "@/types/telemetry"
import type { HvacStatus } from "@/types/hvac-status"
import { isHvacStatus } from "@/types/hvac-status"

import TelemetryCardHeader from "./TelemetryCardHeader"
import TelemetryCardCore from "./TelemetryCardCore"
import TelemetryCardFan from "./TelemetryCardFan"
import TelemetryCardExtras from "./TelemertryCardExtras"

const CORE_KEYS = ["temperature", "humidity", "fan_status", "status"]

interface TelemetryCardProps {
  ahu: HvacTelemetry
}

export default function TelemetryCard({
  ahu,
}: TelemetryCardProps) {
  const navigate = useNavigate()
  const { stationId, points, timestamp, plantId } = ahu

  // ✅ Status validado correctamente
  const hvacStatus: HvacStatus | undefined =
    isHvacStatus(points.status?.value)
      ? points.status.value
      : undefined

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
        <TelemetryCardHeader
          stationId={stationId}
          status={hvacStatus}
        />

        <div className="px-6 pb-6 space-y-4">
          <TelemetryCardCore points={points} />

          <TelemetryCardFan fan={points.fan_status} />

          {extraPoints.length > 0 && (
            <TelemetryCardExtras points={extraPoints} />
          )}

          <div className="pt-2 text-xs text-white/60">
            Última actualización:{" "}
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </Card>
  )
}
