import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildComparisonData } from "@/domain/energy/calculateEnergy";
import type { EnergyDataPoint } from "@/types/energy";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  currentPoints: EnergyDataPoint[];
  previousPoints: EnergyDataPoint[];
}

export function EnergyComparisonChart({ currentPoints, previousPoints }: Props) {
  const { t } = useTranslation();
  const data = buildComparisonData(currentPoints, previousPoints);

  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.energy.comparison.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis unit=" kWh" tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`${v.toFixed(1)} kWh`]} />
            <Legend />
            <Bar dataKey="current" name={t.energy.comparison.current} fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            <Bar dataKey="previous" name={t.energy.comparison.previous} fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
