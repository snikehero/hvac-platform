import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { HistoryPoint } from "@/types/history";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/i18n/useTranslation";

interface DeviceHistoryChartProps {
  title: string;
  data: HistoryPoint[];
  color?: string;
  unit?: string;
  height?: number;
  showGrid?: boolean;
}

export function DeviceHistoryChart({
  title,
  data,
  color = "#3b82f6",
  unit = "",
  height = 200,
  showGrid = true,
}: DeviceHistoryChartProps) {
  const { t } = useTranslation();
  const avg =
    data.length > 0
      ? data.reduce((acc, p) => acc + p.value, 0) / data.length
      : null;

  const lastIndex = data.length - 1;
  const trend = getTrend(data);

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {trend === "up" && <TrendingUp className="w-4 h-4 text-destructive" />}
            {trend === "down" && <TrendingDown className="w-4 h-4 text-accent" />}
            {trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
          </div>

          {avg !== null && (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tabular-nums text-primary">
                {avg.toFixed(1)}
              </span>
              {unit && (
                <span className="text-xs text-muted-foreground">{unit} {t.historyChart.avg}</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative rounded-lg border border-border bg-card/50 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />

          {data.length === 0 ? (
            <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height }}>
              {t.historyChart.noData}
            </div>
          ) : (
            <div className="relative z-10 p-4">
              <ResponsiveContainer width="100%" height={height}>
                <LineChart
                  data={data}
                  margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
                >
                  {showGrid && (
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--chart-axis-line)"
                      strokeOpacity={0.3}
                    />
                  )}

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
                    tick={{
                      fontSize: 12,
                      fill: "var(--chart-axis-label)",
                      fontWeight: 500,
                    }}
                    stroke="var(--chart-axis-line)"
                    strokeWidth={1.5}
                    tickLine={false}
                    width={45}
                    label={
                      unit
                        ? {
                            value: unit,
                            angle: -90,
                            position: "insideLeft",
                            fontSize: 13,
                            fontWeight: 600,
                            fill: "var(--chart-axis-label)",
                          }
                        : undefined
                    }
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
                      `${v.toFixed(1)}${unit ? ` ${unit}` : ""}`,
                      title,
                    ]}
                    labelFormatter={(l) => new Date(l).toLocaleTimeString()}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={3}
                    dot={(props) => {
                      const isLastPoint = props.index === lastIndex;
                      return (
                        <g>
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={isLastPoint ? 8 : 4}
                            fill={color}
                            fillOpacity={0.2}
                          />
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={isLastPoint ? 5 : 3}
                            fill={color}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        </g>
                      );
                    }}
                    activeDot={{
                      r: 8,
                      fill: color,
                      stroke: "hsl(var(--background))",
                      strokeWidth: 3,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

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
