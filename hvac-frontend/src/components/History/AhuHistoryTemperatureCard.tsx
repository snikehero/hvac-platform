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
import { Badge } from "../ui/badge";

interface Props {
  title?: string;
  data: HistoryPoint[];
  status?: "OK" | "WARNING" | "ALARM";
}

export function AhuHistoryTemperatureChart({
  title = "Temperatura",
  data,
  status,
}: Props) {
  const lineColor = "#38bdf8"; // azul fijo (puedes cambiarlo si quieres)
  const avgTemperature =
    data.length > 0
      ? data.reduce((acc, p) => acc + p.value, 0) / data.length
      : null;
  // último punto (para animarlo si está en ALARM)
  const lastIndex = data.length - 1;

  return (
    <Card
      className={` text-white rounded-xl shadow-md ${
        status === "ALARM" ? "alarm-glow" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {avgTemperature !== null && (
          <Badge variant="secondary">
            Temperatura Promedio: {avgTemperature.toFixed(1)} °C
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-gray-400">Sin datos históricos</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, bottom: 30, left: 40 }}
            >
              {/* Zonas térmicas HVAC */}
              <ReferenceArea y1={0} y2={23} fill="#22c55e22" />
              <ReferenceArea y1={23} y2={29} fill="#facc1522" />
              <ReferenceArea y1={29} y2={40} fill="#dc262622" />

              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                tick={{ fontSize: 11, fill: "#cbd5e1" }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
              />

              <YAxis
                domain={[0, 40]}
                tick={{ fontSize: 11, fill: "#cbd5e1" }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
                label={{
                  value: "°C",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                }}
              />

              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none" }}
                formatter={(v: number) => [`${v} °C`, "Temperatura"]}
                labelFormatter={(l) =>
                  `Hora: ${new Date(l).toLocaleTimeString()}`
                }
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={3}
                dot={(props) => {
                  const isLastPoint =
                    props.index === lastIndex && status === "ALARM";

                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={isLastPoint ? 6 : 3}
                      fill={lineColor}
                      className={isLastPoint ? "alarm-blink-dot" : ""}
                    />
                  );
                }}
                activeDot={{
                  r: 6,
                  stroke: "#fff",
                  strokeWidth: 2,
                  fill: lineColor,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
