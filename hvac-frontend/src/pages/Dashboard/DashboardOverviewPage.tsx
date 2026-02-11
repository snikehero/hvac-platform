"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useTelemetry } from "@/hooks/useTelemetry"
import { useFilteredAhus } from "./hooks/useFilteredAhus"
import { useDashboardStats } from "./hooks/useDashboardStats"

import { DashboardWidgets } from "./components/DashboardWidgets"
import { AhuCard } from "./components/AhuCard"

export default function DashboardOverviewPage() {
  const { telemetry } = useTelemetry()
  const navigate = useNavigate()

  /* -------------------- filtros -------------------- */
  const [plantFilter, setPlantFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<
    "OK" | "WARNING" | "ALARM" | "DISCONNECTED" | null
  >(null)

  /* -------------------- datos derivados -------------------- */
  const filteredAhus = useFilteredAhus(
    telemetry,
    plantFilter,
    statusFilter
  )

  const stats = useDashboardStats(filteredAhus)

  const plants = Array.from(
    new Set(telemetry.map(ahu => ahu.plantId))
  )

  /* -------------------- acciones KPI -------------------- */

  const handleResetFilters = () => {
    setPlantFilter(null)
    setStatusFilter(null)
  }

  const handleFilterByStatus = (
    status: "OK" | "WARNING" | "ALARM" | "DISCONNECTED"
  ) => {
    setPlantFilter(null)
    setStatusFilter(status)
  }

  return (
    <div className="p-6 space-y-6 text-white">
      {/* -------------------- Header -------------------- */}
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Resumen en tiempo real de todos los AHUs
        </p>
      </div>

      {/* -------------------- Widgets -------------------- */}
      <DashboardWidgets
        stats={stats}
        onReset={handleResetFilters}
        onFilterStatus={handleFilterByStatus}
      />

      {/* -------------------- Filtros -------------------- */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={plantFilter ?? ""}
          onChange={e =>
            setPlantFilter(
              e.target.value === "" ? null : e.target.value
            )
          }
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="">Todas las plantas</option>
          {plants.map(plant => (
            <option key={plant} value={plant}>
              {plant}
            </option>
          ))}
        </select>

        <select
          value={statusFilter ?? ""}
          onChange={e =>
            setStatusFilter(
              e.target.value === ""
                ? null
                : (e.target.value as
                    | "OK"
                    | "WARNING"
                    | "ALARM")
            )
          }
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="">Todos los estados</option>
          <option value="OK">OK</option>
          <option value="WARNING">WARNING</option>
          <option value="ALARM">ALARM</option>
        </select>
      </div>

      {/* -------------------- Grid AHUs -------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {filteredAhus.map(ahu => (
          <AhuCard
            key={`${ahu.plantId}-${ahu.stationId}`}
            ahu={ahu}
            onClick={() =>
              navigate(
                `/plants/${ahu.plantId}/ahus/${ahu.stationId}`
              )
            }
          />
        ))}

        {filteredAhus.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground">
            No hay AHUs que coincidan con los filtros
          </div>
        )}
      </div>
    </div>
  )
}
