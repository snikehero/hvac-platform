import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DamperCardProps {
  position: number; // 0-100%
  title?: string;
}

export default function DamperCard({
  position,
  title = "Compuerta",
}: DamperCardProps) {
  const [posAnim, setPosAnim] = useState(position);

  useEffect(() => {
    const timeout = setTimeout(() => setPosAnim(position), 100);
    return () => clearTimeout(timeout);
  }, [position]);

  const barHeight = 160 * (posAnim / 100);
  const isAlarm = posAnim >= 80;

  const getBarColor = (value: number) => {
    if (value < 50) return "#22c55e";
    if (value < 80) return "#facc15";
    return "#ef4444";
  };

  return (
    <Card className={isAlarm ? "alarm-glow" : "border border-slate-700"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <svg width="80" height="200" viewBox="0 0 80 200">
          <rect
            x="35"
            y="20"
            width="10"
            height="160"
            rx="5"
            fill="#020617"
            stroke="#334155"
            strokeWidth="2"
          />

          <rect
            x="35"
            y={180 - barHeight + 20}
            width="10"
            height={barHeight}
            rx="5"
            fill={getBarColor(posAnim)}
            style={{ transition: "height 0.8s ease, y 0.8s ease, fill 0.5s" }}
          />
        </svg>

        <span
          className={`mt-2 text-lg font-bold ${
            isAlarm ? "text-red-400" : "text-slate-200"
          }`}
        >
          {posAnim.toFixed(0)}%
        </span>
      </CardContent>
    </Card>
  );
}
