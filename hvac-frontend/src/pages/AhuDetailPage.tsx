/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom"
import { useTelemetry } from "@/hooks/useTelemetry"
import { useAhuHistory } from "@/hooks/useAhuHistory"
import AhuHistoryChart from "@/components/History/AhuHistoryChart"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAhuEvents } from "@/hooks/useAhuEvents"
import AhuEventTimeline from "@/components/EventTimeline/AhuEventTimeLine"
export default function AhuDetailPage() {
  const { telemetry } = useTelemetry()
  const { ahuId, plantId } = useParams()
  const ahu = telemetry.find(
    (t) => t.stationId === ahuId && t.plantId === plantId,
  )

  if (!ahu) {
    return <div className="text-muted-foreground">AHU no encontrado</div>
  }

    const hvacStatus = ahu.points.status?.value as
    | "OK"
    | "WARNING"
    | "ALARM"
    | undefined
  // 🔥 Histórico local por AHU
  const history = useAhuHistory(ahu)
  const events = useAhuEvents(ahu)

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{ahu.stationId}</h1>
          <p className="text-muted-foreground">
            Planta {ahu.plantId}
          </p>
        </div>

        <Badge
          variant={
            hvacStatus === "ALARM"
              ? "destructive"
              : hvacStatus === "WARNING"
              ? "secondary"
              : "default"
          }
        >
          {hvacStatus ?? "N/A"}
        </Badge>
      </div>

      {/* ---------- Secciones operativas ---------- */}
      <AhuSection
        title="Temperatura y Humedad"
        backgroundImage="/images/temp-bg.jpg"
        status={hvacStatus}
      >
        <DataRow label="Temperatura" point={ahu.points.temperature} />
        <DataRow label="Humedad" point={ahu.points.humidity} />
      </AhuSection>

      <AhuSection
        title="Ventilación"
        backgroundImage="/images/ventilation-bg.jpg"
        status={hvacStatus}
      >
        <DataRow label="Ventilador" point={ahu.points.fan_status} />
        <DataRow label="Flujo de aire" point={ahu.points.airflow} />
        <DataRow label="Compuerta" point={ahu.points.damper_position} />
      </AhuSection>

      <AhuSection
        title="Estado y Energía"
        backgroundImage="/images/energy-bg.jpg"
        status={hvacStatus}
      >
        <DataRow label="Energía" point={ahu.points.power_status} />
        <DataRow label="ΔP Filtros" point={ahu.points.filter_dp} />
      </AhuSection>

      {/* ---------- Histórico ---------- */}
        <AhuSection
            title="Histórico reciente"
            backgroundImage="/images/ahu-bg.jpg"
            status={hvacStatus}
            >
            <div className="grid md:grid-cols-2 gap-4">
                <AhuHistoryChart
                title="Temperatura"
                unit="°C"
                data={history.temperature}
                status={hvacStatus}
                />

                <AhuHistoryChart
                title="Humedad"
                unit="%"
                data={history.humidity}
                status={hvacStatus}
                />
            </div>
          </AhuSection>
          
          <AhuSection
            title="Eventos recientes"
            backgroundImage="/images/ahu-bg.jpg"
            status={hvacStatus}
            >
            <AhuEventTimeline events={events} />
        </AhuSection>


      {/* ---------- Footer ---------- */}
      <div className="text-xs text-muted-foreground">
        Última actualización:{" "}
        {new Date(ahu.timestamp).toLocaleString()}
      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function AhuSection({
  title,
  backgroundImage,
  status,
  children,
}: {
  title: string
  backgroundImage: string
  status?: string
  children: React.ReactNode
}) {
  const overlayClass =
    status === "ALARM"
      ? "bg-red-900/60"
      : status === "WARNING"
      ? "bg-yellow-800/50"
      : "bg-black/50"

  return (
    <Card className="relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* Content */}
      <div className="relative z-10 text-white">
        <CardHeader>
          <CardTitle className="text-base text-white">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {children}
        </CardContent>
      </div>
    </Card>
  )
}

function DataRow({
  label,
  point,
}: {
  label: string
  point?: { value: any; unit?: string }
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/80">{label}</span>
      <span className="font-medium text-white">
        {point ? `${point.value} ${point.unit ?? ""}` : "--"}
      </span>
    </div>
  )
}