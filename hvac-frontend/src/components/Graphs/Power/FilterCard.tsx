import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FilterCardProps {
  dp: number; // ΔP Filtros
  title?: string;
  maxDP?: number;
}

export default function FilterCard({
  dp,
  title = "ΔP Filtros",
  maxDP = 300,
}: FilterCardProps) {
  const [dpAnim, setDpAnim] = useState(dp);

  useEffect(() => {
    const timeout = setTimeout(() => setDpAnim(dp), 100);
    return () => clearTimeout(timeout);
  }, [dp]);

  const tubeHeight = 160;
  const tubeTopY = 20;

  const clampedDP = Math.min(Math.max(dpAnim, 0), maxDP);
  const percentage = clampedDP / maxDP;
  const barHeight = tubeHeight * percentage;

  // 🔴 Estado crítico
  const isAlarm = clampedDP >= maxDP * 0.8;

  const getBarColor = (value: number) => {
    if (value < maxDP * 0.5) return "#22c55e"; // verde
    if (value < maxDP * 0.8) return "#facc15"; // amarillo
    return "#ef4444"; // rojo
  };

  return (
    <Card
      className={`transition-all duration-300
        ${isAlarm ? "alarm-glow" : "border border-slate-700"}
      `}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <svg width="80" height="200" viewBox="0 0 80 200">
          {/* Tubo */}
          <rect
            x="35"
            y={tubeTopY}
            width="10"
            height={tubeHeight}
            rx="5"
            fill="#020617"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Barra ΔP */}
          <rect
            x="35"
            y={tubeTopY + tubeHeight - barHeight}
            width="10"
            height={barHeight}
            rx="5"
            fill={getBarColor(clampedDP)}
            style={{
              transition: "height 0.8s ease, y 0.8s ease, fill 0.5s",
            }}
          />
        </svg>
        <CardTitle  className={` text-2xl font-bold ${
            isAlarm ? "text-red-400" : "text-slate-200"
          }`}>
            {dpAnim.toFixed(1)} Pa
        </CardTitle>
      </CardContent>
    </Card>
  );
}
