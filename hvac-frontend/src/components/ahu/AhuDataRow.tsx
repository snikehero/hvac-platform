import type { HvacPoint } from "@/types/telemetry"
import { getPointIcon } from "@/Helpers/getPointIcon"
export function AhuDataRow({
  label,
  pointKey,
  point,
}: {
  label: string
  pointKey: string
  point?: HvacPoint & { displayValue?: string }
}) {
  const valueColor =
    point?.quality === "BAD"
      ? "text-red-400"
      : point?.quality === "GOOD"
      ? "text-green-400"
      : "text-white"

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs">
      {/* Icono → usa VALUE REAL */}
      <div className="flex items-center justify-center w-4">
        {getPointIcon(pointKey, point?.value)}
      </div>

      {/* Label */}
      <span className="text-white/75 truncate">
        {label}
      </span>

      {/* Valor → usa DISPLAY */}
      <span className={`font-mono font-semibold ${valueColor}`}>
        {point
          ? `${point.displayValue ?? point.value} ${point.unit ?? ""}`
          : "--"}
      </span>
    </div>
  )
}
