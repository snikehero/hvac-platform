import { Card, CardContent } from "@/components/ui/card"

interface DashboardStats {
  systemStatus: string
  alarms: number
  warnings: number
  totalAhus: number
  disconnected: number
  affected: number
  operational: number
  operationalPercentage: number
}

interface Props {
  stats: DashboardStats
  onFilterStatus: (
    status: "OK" | "WARNING" | "ALARM" | "DISCONNECTED"
  ) => void
}

export function DashboardWidgets({ stats, onFilterStatus }: Props) {
  const noData = stats.totalAhus === 0

  return (
    <div className="space-y-6">


      {/* ================= KPIs ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Unidades afectadas */}
        <Card
          onClick={
            stats.affected > 0
              ? () => onFilterStatus("ALARM")
              : undefined
          }
          
        >
          <CardContent className="p-5 space-y-2">
            <div className="text-xs text-neutral-400 uppercase">
              Unidades afectadas
            </div>
            <div className="text-3xl font-bold text-red-500">
              {noData ? "--" : stats.affected}
            </div>
            <div className="text-xs text-neutral-500">
              Alarmas + Warnings
            </div>
          </CardContent>
        </Card>

        {/* Sin comunicación */}
        <Card
          onClick={
            stats.disconnected > 0
              ? () => onFilterStatus("DISCONNECTED")
              : undefined
          }
        >
          <CardContent className="p-5 space-y-2">
            <div className="text-xs text-neutral-400 uppercase">
              Sin comunicación
            </div>
            <div className="text-3xl font-bold text-orange-500">
              {noData ? "--" : stats.disconnected}
            </div>
            <div className="text-xs text-neutral-500">
              AHUs desconectados
            </div>
          </CardContent>
        </Card>

        {/* Capacidad operativa */}
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="text-xs text-neutral-400 uppercase">
              Capacidad operativa
            </div>
            <div className="text-3xl font-bold text-green-500">
              {noData ? "--" : `${stats.operationalPercentage}%`}
            </div>
            <div className="text-xs text-neutral-500">
              {stats.operational} de {stats.totalAhus} operativos
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
