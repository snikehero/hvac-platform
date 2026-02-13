import { getAhuHealth } from "@/domain/ahu/getAhuHealth"
import { useTelemetry } from "@/hooks/useTelemetry"
import { useParams } from "react-router-dom"
import Scene from "@/presentation/AhuDetail3D/Scene/Scene"
import FanModel from "@/presentation/AhuDetail3D/Model/FanModel"
export default function AhuDetailView() {
  const { plantId, ahuId } = useParams<{
    plantId: string
    ahuId: string
  }>()

  const { telemetry } = useTelemetry()

  const ahu = telemetry.find(
    a =>
      a.plantId === plantId &&
      a.stationId === ahuId
  )

  if (!ahu) {
    return <div className="p-6 text-white">AHU no encontrado</div>
  }

  const health = getAhuHealth(ahu)

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">
        AHU {ahu.stationId}
      </h1>

      <p>Plant: {ahu.plantId}</p>
      <p>Status: {health.status}</p>
      <Scene>
        <FanModel status={health.status} />
      </Scene>
    </div>
  )
}
