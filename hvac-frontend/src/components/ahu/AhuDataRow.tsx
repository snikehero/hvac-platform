import type { HvacPoint } from "@/types/telemetry"

export function AhuDataRow({
  label,
  point,
}: {
  label: string
  point?: HvacPoint
}) {
  const valueColor ="text-white"
  

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/80">{label}</span>
      <span className={`font-medium ${valueColor}`}>
        {point
          ? `${point.value} ${point.unit ?? ""}`
          : "--"}
      </span>
    </div>
  )
}
