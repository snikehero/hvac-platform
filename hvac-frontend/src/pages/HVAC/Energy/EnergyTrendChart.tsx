import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnergyDataPoint } from "@/types/energy";
import { useTranslation } from "@/i18n/useTranslation";

interface ChartRow {
  label: string;
  kwh: number;
}

function toChartData(points: EnergyDataPoint[]): ChartRow[] {
  const map = new Map<string, number>();
  for (const p of points) {
    const label = new Date(p.timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
    });
    map.set(label, (map.get(label) ?? 0) + p.kwh);
  }
  return Array.from(map.entries()).map(([label, kwh]) => ({ label, kwh: Math.round(kwh * 10) / 10 }));
}

interface Props {
  points: EnergyDataPoint[];
  chartType?: "bar" | "line";
}

export function EnergyTrendChart({ points, chartType = "bar" }: Props) {
  const { t } = useTranslation();
  const data = toChartData(points);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.energy.chart.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-muted-foreground text-sm">
          {t.energy.chart.noData}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.energy.chart.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          {chartType === "bar" ? (
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
              />
              <YAxis unit=" kWh" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v} kWh`, "Consumption"]} />
              <Bar dataKey="kwh" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
              />
              <YAxis unit=" kWh" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v} kWh`, "Consumption"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="kwh"
                stroke="hsl(var(--primary))"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
