import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
} from "recharts";
import type { HistoryPoint } from "@/types/history";

interface Props {
  title?: string;
  data: HistoryPoint[];
  status?: "OK" | "WARNING" | "ALARM";
}

export function AhuHistoryHumidityChart({
  title = "Humedad",
  data,
  status,
}: Props) {
  const color = getColorByStatus(status);

  return (
    <Card className="bg-gray-900 text-white rounded-xl shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-gray-400">Sin datos históricos</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, bottom: 30, left: 40 }}
            >
              {/* Zonas de humedad */}
              <ReferenceArea y1={0} y2={50} fill="#22c55e22" />
              <ReferenceArea y1={50} y2={70} fill="#facc1522" />
              <ReferenceArea y1={70} y2={100} fill="#dc262622" />

              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                tick={{ fontSize: 11, fill: "#cbd5e1" }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#cbd5e1" }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
                label={{
                  value: "%",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                }}
              />

              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none" }}
                formatter={(v: number) => [`${v} %`, "Humedad"]}
                labelFormatter={(l) =>
                  `Hora: ${new Date(l).toLocaleTimeString()}`
                }
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                dot={{ r: 3, fill: color }}
                activeDot={{
                  r: 6,
                  stroke: "#fff",
                  strokeWidth: 2,
                  fill: color,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
/* ---------- helpers ---------- */
function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getColorByStatus(status?: "OK" | "WARNING" | "ALARM") {
  switch (status) {
    case "ALARM":
      return "#dc2626"; // rojo
    case "WARNING":
      return "#facc15"; // amarillo
    default:
      return "#22c55e"; // verde
  }
}
