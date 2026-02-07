// src/components/Charts/MiniLineChart.tsx
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface MiniLineChartProps {
  data: { timestamp: string; value: number }[];
  color?: string;
  height?: number;
  yDomain?: [number, number];
}

export default function MiniLineChart({
  data,
  color = "#38bdf8",
  height = 50,
  yDomain,
}: MiniLineChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-xs text-gray-400">Sin datos</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <XAxis dataKey="timestamp" hide />
        <YAxis domain={yDomain} hide />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
