import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  WifiOff,
} from "lucide-react"
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth"

const STATUS_CONFIG = {
  OK: {
    label: "Operación normal",
    icon: CheckCircle,
    className: "text-green-400",
  },
  WARNING: {
    label: "Advertencias activas",
    icon: AlertTriangle,
    className: "text-yellow-400",
  },
  ALARM: {
    label: "Alarma activa",
    icon: XCircle,
    className: "text-red-500",
  },
  DISCONNECTED: {
    label: "Sin comunicación",
    icon: WifiOff,
    className: "text-gray-400",
  },
}

export function AhuHealthSummary({
  status,
  badPoints,
  lastUpdate,
}: {
  status: AhuHealthStatus
  badPoints: number
  lastUpdate: Date
}) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className={`h-6 w-6 ${config.className}`} />
        <div>
          <div className="text-sm font-semibold">
            {config.label}
          </div>

          {status === "WARNING" && (
            <div className="text-xs text-muted-foreground">
              {badPoints} punto(s) fuera de rango
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Última actualización<br />
        {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  )
}
