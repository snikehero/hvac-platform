
type HvacStatus = "OK" | "WARNING" | "ALARM" | undefined

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import type { HistoryPoint } from "@/types/history"

interface Props {
  title: string
  unit: string
  data: HistoryPoint[]
  status?: HvacStatus
}


export default function AhuHistoryChart({
  title,
  unit,
  data,
  status,
}: Props) {

    const color = getColorByStatus(status)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Sin datos históricos
          </div>
        ) : (
          <ChartContainer
            config={{
              value: {
                label: title,
                color: color,
              },
            }}
            className="h-[55]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 20, bottom: 30, left: 40 }}
              >
                {/* ---- Eje X (Tiempo) ---- */}
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  tick={{ fontSize: 11 }}
                  axisLine
                  tickLine={false}
                  label={{
                    value: "Tiempo",
                    position: "insideBottom",
                    offset: -15,
                    fontSize: 12,
                  }}
                />

                {/* ---- Eje Y (Valor) ---- */}
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine
                  tickLine={false}
                  width={40}
                  domain={["auto", "auto"]}
                  label={{
                    value: unit,
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 12,
                  }}
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(l) =>
                        `Hora: ${new Date(l).toLocaleTimeString()}`
                      }
                      formatter={(v) => `${v} ${unit}`}
                    />
                  }
                />

                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: color }}
                    activeDot={{ r: 6, fill: color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- helper ---------- */

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}
function getColorByStatus(status?: HvacStatus) {
  switch (status) {
    case "ALARM":
      return "#dc2626"   // rojo
    case "WARNING":
      return "#f59e0b"   // amarillo
    default:
      return "#16a34a"   // verde
  }
}
