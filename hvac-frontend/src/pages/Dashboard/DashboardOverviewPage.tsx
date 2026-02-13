"use client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useTelemetry } from "@/hooks/useTelemetry"
import { useFilteredAhus } from "./hooks/useFilteredAhus"
import { useDashboardStats } from "./hooks/useDashboardStats"

import { DashboardWidgets } from "./components/DashboardWidgets"
import { AhuCard } from "./components/AhuCard"
import { HeroSystemStatus } from "./components/HeroSystemStatus"
import { HeroPlantPanel } from "./components/HeroPlantPanel"
import { SystemActivityPanel } from "./components/SystemActivityPanel"

export default function DashboardOverviewPage() {
  const { telemetry } = useTelemetry()
  const navigate = useNavigate()

  /* -------------------- filtros -------------------- */
  const [plantFilter, setPlantFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<
    "OK" | "WARNING" | "ALARM" | "DISCONNECTED" | null
  >(null)

  /* -------------------- datos derivados -------------------- */

  // 🔥 KPIs SIEMPRE globales (no filtrados)
  const stats = useDashboardStats(telemetry)

  // 👇 Grid sí respeta filtros
  const filteredAhus = useFilteredAhus(
    telemetry,
    plantFilter,
    statusFilter
  )

  const plants = Array.from(
    new Set(telemetry.map(ahu => ahu.plantId))
  )

  /* -------------------- acciones KPI -------------------- */

  const handleFilterByStatus = (
    status: "OK" | "WARNING" | "ALARM" | "DISCONNECTED"
  ) => {
    setPlantFilter(null)
    setStatusFilter(status)
  }

  return (
    <div className="p-6 space-y-8 text-white">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Vista ejecutiva del estado global del sistema HVAC
        </p>
      </div>

      {/* ================= HERO GLOBAL ================= */}
      <HeroSystemStatus />

      {/* ================= BLOQUE ESTRATÉGICO ================= */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Panel por planta (más ancho) */}
        <div className="lg:col-span-2">
          <HeroPlantPanel
            telemetry={telemetry}
            onSelectPlant={(plantId) => {
              setPlantFilter(plantId)
              setStatusFilter(null)
            }}
          />
        </div>

      </div>
      
        {/* Actividad reciente */}

          <SystemActivityPanel />
      {/* ================= KPIs SECUNDARIOS ================= */}
      <DashboardWidgets
        stats={stats}
        onFilterStatus={handleFilterByStatus}
      />


     {/* ================= FILTROS ================= */}
<div className="border-t border-neutral-800 pt-6">
  <div className="flex flex-wrap gap-6 items-end">

    {/* ----------- Plant Filter ----------- */}
    <div className="flex flex-col gap-2 min-w-55">
      <Label>Planta</Label>
      <Select
        value={plantFilter ?? "ALL"}
        onValueChange={(value) =>
          setPlantFilter(value === "ALL" ? null : value)
        }
      >
        <SelectTrigger className="bg-neutral-900 border-neutral-700">
          <SelectValue placeholder="Todas las plantas" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="ALL">Todas las plantas</SelectItem>
          {plants.map((plant) => (
            <SelectItem key={plant} value={plant}>
              {plant}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* ----------- Status Filter ----------- */}
    <div className="flex flex-col gap-2 min-w-55">
      <Label>Estado</Label>
      <Select
        value={statusFilter ?? "ALL"}
        onValueChange={(value) =>
          setStatusFilter(
            value === "ALL"
              ? null
              : (value as
                  | "OK"
                  | "WARNING"
                  | "ALARM"
                  | "DISCONNECTED")
          )
        }
      >
        <SelectTrigger className="bg-neutral-900 border-neutral-700">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="ALL">Todos los estados</SelectItem>
          <SelectItem value="OK">OK</SelectItem>
          <SelectItem value="WARNING">WARNING</SelectItem>
          <SelectItem value="ALARM">ALARM</SelectItem>
          <SelectItem value="DISCONNECTED">
            DISCONNECTED
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

  </div>
</div>
      {/* ================= GRID AHUs ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

        {filteredAhus.map(ahu => (
          <AhuCard
            key={`${ahu.plantId}-${ahu.stationId}`}
            ahu={ahu}
            onClick={() =>
              navigate(
                `/plants/${ahu.plantId}/ahus/${ahu.stationId}/detail`
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
