/* eslint-disable react-hooks/rules-of-hooks */
import { getAhuHealth } from "@/domain/ahu/getAhuHealth"
import { useTelemetry } from "@/hooks/useTelemetry"
import { useParams } from "react-router-dom"
import { useEffect, useRef } from "react"

import Scene from "@/presentation/AhuDetail3D/Scene/Scene"
import FanModel from "@/presentation/AhuDetail3D/Model/FanModel"
import { audioManager } from "@/presentation/Audio/AudioManager"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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

  /* ----------------------------------
     EXTRAER PARÁMETROS REALES
  ---------------------------------- */

  const fanStatusRaw = ahu.points.fan_status?.value
  const temperatureRaw = ahu.points.temperature?.value

  const fanStatus =
    fanStatusRaw === true ||
    fanStatusRaw === 1 ||
    fanStatusRaw === "ON"

  const temperature =
    typeof temperatureRaw === "number"
      ? temperatureRaw
      : 0

  /* ----------------------------------
     AUDIO SOLO EN TRANSICIÓN A ALARM
  ---------------------------------- */

  const prevAlarmRef = useRef(false)

  useEffect(() => {
    // cargar sonido una sola vez
    audioManager.loadGlobal(
      "ahu-alarm",
      "/models/fan/sound/fan-alarm.mp3"
    )
  }, [])

  useEffect(() => {
    const isAlarm = health.status === "ALARM"

    if (!prevAlarmRef.current && isAlarm) {
      audioManager.playOneShot("ahu-alarm")
    }

    prevAlarmRef.current = isAlarm
  }, [health.status])

  /* ---------------------------------- */

  const statusColor = {
    OK: "bg-green-500",
    WARNING: "bg-yellow-500",
    ALARM: "bg-red-500",
    DISCONNECTED: "bg-gray-500"
  }[health.status]

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            AHU {ahu.stationId}
          </h1>
          <p className="text-muted-foreground">
            Planta {ahu.plantId}
          </p>
        </div>

        <Badge className={`${statusColor} text-white`}>
          {health.status}
        </Badge>
      </div>

      <Separator />

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 3D VIEW */}
        <Card className="lg:col-span-2 h-125">
          <CardHeader>
            <CardTitle>Visualización 3D</CardTitle>
          </CardHeader>

          <CardContent className="h-105">
            <Scene>
              <FanModel
                fanStatus={fanStatus}
                temperature={temperature}
              />
            </Scene>
          </CardContent>
        </Card>

        {/* INFO PANEL */}
        <Card>
          <CardHeader>
            <CardTitle>Información Técnica</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">

            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="font-medium">
                {health.status}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Temperatura</span>
              <span className="font-medium">
                {temperature} °C
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Fan Status</span>
              <span className="font-medium">
                {fanStatus ? "ON" : "OFF"}
              </span>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold">Sensores</h4>

              {Object.entries(ahu.points).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between border-b pb-1"
                >
                  <span className="text-muted-foreground capitalize">
                    {key.replace("_", " ")}
                  </span>
                  <span className="font-medium">
                    {value?.value ?? "-"}
                  </span>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
