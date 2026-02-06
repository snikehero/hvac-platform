import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HvacStatus } from "@/types/hvac-status"

interface Props {
  title: string
  backgroundImage: string
  status?: HvacStatus
  children: React.ReactNode
}

export function AhuSection({
  title,
  backgroundImage,
  status,
  children,
}: Props) {
  const overlayClass =
    status === "ALARM"
      ? "bg-red-900/60"
      : status === "WARNING"
      ? "bg-yellow-800/50"
      : "bg-black/50"

  return (
    <Card className="relative overflow-hidden">
      {/* ---------- Background ---------- */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />

      {/* ---------- Overlay ---------- */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* ---------- Content ---------- */}
      <div className="relative z-10 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {children}
        </CardContent>
      </div>
    </Card>
  )
}
