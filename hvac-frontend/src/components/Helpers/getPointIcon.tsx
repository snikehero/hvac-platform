import {
  Thermometer,
  ThermometerSun,
  Snowflake,
  Droplets,
  Fan,
  Gauge,
  Filter,
  SlidersHorizontal,
  Power,
} from "lucide-react"

export function getPointIcon(
  key: string,
  value?: number | string | boolean,
) {
  switch (key) {
    /* ---------- Core HVAC ---------- */

    case "temperature": {
      if (typeof value !== "number") {
        return <Thermometer className="h-4 w-4 text-muted-foreground" />
      }

      if (value < 20) {
        return <Snowflake className="h-4 w-4 text-blue-500" />
      }

      if (value > 26) {
        return <ThermometerSun className="h-4 w-4 text-red-500" />
      }

      return <Thermometer className="h-4 w-4 text-green-500" />
    }

    case "humidity": {
      if (typeof value !== "number") {
        return <Droplets className="h-4 w-4 text-muted-foreground" />
      }

      if (value > 60) {
        return <Droplets className="h-4 w-4 text-yellow-500" />
      }

      if (value < 40) {
        return <Droplets className="h-4 w-4 text-blue-500" />
      }

      return <Droplets className="h-4 w-4 text-green-500" />
    }

    case "fan_status": {
      return (
        <Fan
          className={`h-4 w-4 ${
            value === "ON"
              ? "text-green-500 animate-spin"
              : "text-gray-400"
          }`}
        />
      )
    }

    case "status": {
      return (
        <Power
          className={`h-4 w-4 ${
            value === "ALARM"
              ? "text-red-500"
              : value === "WARNING"
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        />
      )
    }

    /* ---------- Extra / extensibles ---------- */

    case "airflow":
      return (
        <Gauge
          className={`h-4 w-4 ${
            typeof value === "number" && value > 1200
              ? "text-green-500"
              : "text-yellow-500"
          }`}
        />
      )

    case "filter_dp":
      return (
        <Filter
          className={`h-4 w-4 ${
            typeof value === "number" && value > 200
              ? "text-red-500"
              : "text-green-500"
          }`}
        />
      )

    case "damper_position":
      return (
        <SlidersHorizontal className="h-4 w-4 text-blue-500" />
      )

    case "power_status":
      return (
        <Power
          className={`h-4 w-4 ${
            value === "ON"
              ? "text-green-500"
              : "text-gray-400"
          }`}
        />
      )

    default:
      return null
  }
}