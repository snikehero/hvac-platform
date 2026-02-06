import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HistoryPoint } from "@/types/history"

interface Props {
  title: string
  unit: string
  data: HistoryPoint[]
}

export default function AhuHistory({ title, unit, data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Sin datos históricos
          </div>
        ) : (
          <div className="flex items-end gap-1 h-24">
            {data.map((p, idx) => (
              <div
                key={idx}
                className="flex-1 bg-blue-500/70 rounded-sm"
                style={{
                  height: `${normalize(p.value, data)}%`,
                }}
                title={`${p.value} ${unit}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- helper ---------- */

function normalize(value: number, data: HistoryPoint[]) {
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min === max) return 50

  return ((value - min) / (max - min)) * 100
}
