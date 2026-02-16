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
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  title?: string;
  data: HistoryPoint[];
  status?: AhuHealthStatus;
}

export function AhuHistoryTemperatureChart({
  title = "Temperatura",
  data,
  status,
}: Props) {
  const avgTemperature =
    data.length > 0
      ? data.reduce((acc, p) => acc + p.value, 0) / data.length
      : null;

  const lastIndex = data.length - 1;
  const trend = getTrend(data);

  // Color brillante adaptativo según estado (optimizado para fondos oscuros)
  const lineColor =
    status === "ALARM"
      ? "#ef4444" // Rojo brillante
      : status === "WARNING"
        ? "#f59e0b" // Naranja/Amarillo brillante
        : "#3b82f6"; // Azul brillante

  return (
    <div className="space-y-3">
      {/* Stats Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {trend === "up" && (
            <TrendingUp className="w-4 h-4 text-destructive" />
          )}
          {trend === "down" && <TrendingDown className="w-4 h-4 text-accent" />}
          {trend === "stable" && (
            <Minus className="w-4 h-4 text-muted-foreground" />
          )}

          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
        </div>

        {avgTemperature !== null && (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tabular-nums text-primary">
              {avgTemperature.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">°C avg</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div
        className={`
        relative rounded-lg border backdrop-blur-sm overflow-hidden
        ${status === "ALARM" ? "border-destructive/50 bg-destructive/5 shadow-lg shadow-destructive/20 animate-pulse" : ""}
        ${status === "WARNING" ? "border-chart-3/50 bg-chart-3/5" : ""}
        ${!status || status === "OK" || status === "DISCONNECTED" ? "border-border bg-card/50" : ""}
      `}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
            Sin datos históricos
          </div>
        ) : (
          <div className="relative z-10 p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, bottom: 30, left: 0 }}
              >
                {/* Zonas de temperatura */}
                <ReferenceArea
                  y1={0}
                  y2={18}
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.1}
                  strokeOpacity={0.3}
                  stroke="hsl(var(--chart-1))"
                />
                <ReferenceArea
                  y1={18}
                  y2={26}
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.1}
                  strokeOpacity={0.3}
                  stroke="hsl(var(--chart-2))"
                />
                <ReferenceArea
                  y1={26}
                  y2={40}
                  fill="hsl(var(--destructive))"
                  fillOpacity={0.1}
                  strokeOpacity={0.3}
                  stroke="hsl(var(--destructive))"
                />

                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  tick={{
                    fontSize: 12,
                    fill: "var(--chart-axis-label)",
                    fontWeight: 500,
                  }}
                  stroke="var(--chart-axis-line)"
                  strokeWidth={1.5}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, 40]}
                  tick={{
                    fontSize: 12,
                    fill: "var(--chart-axis-label)",
                    fontWeight: 500,
                  }}
                  stroke="var(--chart-axis-line)"
                  strokeWidth={1.5}
                  tickLine={false}
                  width={40}
                  label={{
                    value: "°C",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 13,
                    fontWeight: 600,
                    fill: "var(--chart-axis-label)",
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  formatter={(v: number) => [
                    `${v.toFixed(1)} °C`,
                    "Temperatura",
                  ]}
                  labelFormatter={(l) => `${new Date(l).toLocaleTimeString()}`}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={lineColor}
                  strokeWidth={3.5}
                  dot={(props) => {
                    const isLastPoint = props.index === lastIndex;

                    return (
                      <g>
                        {/* Glow effect */}
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={isLastPoint ? 8 : 5}
                          fill={lineColor}
                          fillOpacity={0.2}
                        />
                        {/* Main dot */}
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={isLastPoint ? 5 : 3}
                          fill={lineColor}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                          className={
                            isLastPoint && status === "ALARM"
                              ? "animate-pulse"
                              : ""
                          }
                        />
                      </g>
                    );
                  }}
                  activeDot={{
                    r: 8,
                    fill: lineColor,
                    stroke: "hsl(var(--background))",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Helpers =====

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function getTrend(data: HistoryPoint[]): "up" | "down" | "stable" {
  if (data.length < 2) return "stable";

  const last5 = data.slice(-5);
  const avg = last5.reduce((acc, p) => acc + p.value, 0) / last5.length;
  const lastValue = data[data.length - 1].value;

  const diff = lastValue - avg;

  if (diff > 1) return "up";
  if (diff < -1) return "down";
  return "stable";
}
