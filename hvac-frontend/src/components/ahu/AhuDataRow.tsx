/* eslint-disable @typescript-eslint/no-explicit-any */
export function AhuDataRow({
  label,
  point,
}: {
  label: string
  point?: { value: any; unit?: string }
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/80">{label}</span>
      <span className="font-medium text-white">
        {point
          ? `${point.value} ${point.unit ?? ""}`
          : "--"}
      </span>
    </div>
  )
}