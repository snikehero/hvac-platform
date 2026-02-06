import { Card, CardContent } from "@/components/ui/card"
import type { HvacStatus } from "@/types/hvac-status"

interface Props {
  title: string
  status?: HvacStatus
  children: React.ReactNode
}

export function AhuSection({
  title,
  status,
  children,
}: Props) {
  const overlayClass =
    status === "ALARM"
      ? "bg-red-900/70"
      : status === "WARNING"
      ? "bg-yellow-800/60"
      : "bg-black/60"

  return (
    <Card className="relative overflow-hidden rounded-lg">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
      />

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* Content */}
      <CardContent className="relative z-10 px-4 py-3 text-white">
        {/* Title */}
        <div className="mb-2 text-sm font-semibold tracking-wide text-white/90">
          {title}
        </div>

        {/* Rows */}
        <div className="grid gap-1">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
