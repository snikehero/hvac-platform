/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import type { HvacTelemetry } from "@/types/telemetry"
import type { HistoryPoint } from "@/types/history"

const MAX_POINTS = 30

export function useAhuHistory(ahu?: HvacTelemetry) {
  const [temperature, setTemperature] = useState<HistoryPoint[]>([])
  const [humidity, setHumidity] = useState<HistoryPoint[]>([])

  useEffect(() => {
    if (!ahu) return

    const ts = ahu.timestamp

    const temp = ahu.points.temperature?.value
    const hum = ahu.points.humidity?.value

    if (typeof temp === "number") {
      setTemperature((prev) =>
        [...prev, { timestamp: ts, value: temp }].slice(-MAX_POINTS),
      )
    }

    if (typeof hum === "number") {
      setHumidity((prev) =>
        [...prev, { timestamp: ts, value: hum }].slice(-MAX_POINTS),
      )
    }
  }, [ahu?.timestamp])

  return {
    temperature,
    humidity,
  }
}
