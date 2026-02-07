import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HumidityCardProps {
  humidity: number; // 0-100%
  title?: string;
}

export default function HumidityCard({
  humidity,
  title = "Humedad",
}: HumidityCardProps) {
  const [humAnim, setHumAnim] = useState(humidity);

  useEffect(() => {
    const timeout = setTimeout(() => setHumAnim(humidity), 100);
    return () => clearTimeout(timeout);
  }, [humidity]);

  const tubeHeight = 160;
  const tubeTopY = 20;
  const clampedHum = Math.min(Math.max(humAnim, 0), 100);
  const percentage = clampedHum / 100;
  const circleY = tubeTopY + tubeHeight * (1 - percentage);

  const isAlarm = clampedHum >= 70;

  return (
    <Card className={isAlarm ? "alarm-glow" : "border border-slate-700"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <svg width="80" height="200" viewBox="0 0 80 200">
          <rect
            x="30"
            y={tubeTopY}
            width="20"
            height={tubeHeight}
            rx="10"
            fill="#020617"
            stroke="#334155"
            strokeWidth="2"
          />

          <circle cx="40" cy={circleY} r="18" fill="url(#gradHum)">
            <animate
              attributeName="cy"
              values={`${circleY};${circleY - 8};${circleY}`}
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>

          <defs>
            <linearGradient id="gradHum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
        </svg>

        <span
          className={`mt-2 text-lg font-bold ${
            isAlarm ? "text-red-400" : "text-slate-200"
          }`}
        >
          {humAnim.toFixed(1)}%
        </span>
      </CardContent>
    </Card>
  );
}
