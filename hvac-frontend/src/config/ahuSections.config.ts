/* eslint-disable @typescript-eslint/no-explicit-any */
import type { HvacTelemetry } from "@/types/telemetry"

export interface AhuSectionConfig {
  title: string
  rows: {
    label: string
    pointKey: keyof HvacTelemetry["points"]
    format?: (value: any) => string
  }[]
}

export const AHU_SECTIONS: AhuSectionConfig[] = [
  {
    title: "Temperatura y Humedad",
    rows: [
      {
        label: "Temperatura",
        pointKey: "temperature",
        format: v => `${Number(v).toFixed(1)}`
      },
      {
        label: "Humedad",
        pointKey: "humidity",
        format: v => `${Number(v).toFixed(1)}`
      },
    ],
  },
  {
    title: "Ventilación",
    rows: [
      {
        label: "Ventilador",
        pointKey: "fan_status",
      },
      {
        label: "Flujo de aire",
        pointKey: "airflow",
      },
      {
        label: "Compuerta",
        pointKey: "damper_position",
        format: v => `${v}`
      },
    ],
  },
  {
    title: "Estado y Energía",
    rows: [
      {
        label: "Energía",
        pointKey: "power_status",
      },
      {
        label: "ΔP Filtros",
        pointKey: "filter_dp",
      },
    ],
  },
]
