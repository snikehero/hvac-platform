import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TemperatureCardProps {
  temperature: number;
  title?: string;
  minTemp?: number;
  maxTemp?: number;
}

export default function TemperatureCard({
  temperature,
  title = "Temperatura",
  minTemp = 0,
  maxTemp = 40,
}: TemperatureCardProps) {
  const tubeHeight = 240;
  const tubeTopY = 40;

  const [tempAnim, setTempAnim] = useState(temperature);

  useEffect(() => {
    const t = setTimeout(() => setTempAnim(temperature), 100);
    return () => clearTimeout(t);
  }, [temperature]);

  const clampedTemp = Math.min(Math.max(tempAnim, minTemp), maxTemp);
  const percentage = (clampedTemp - minTemp) / (maxTemp - minTemp);
  const mercuryHeight = tubeHeight * percentage;
  const mercuryY = tubeTopY + (tubeHeight - mercuryHeight);

  /* =======================
     Estados / colores
  ======================= */
  const isWarning = tempAnim >= 24.1 && tempAnim < 29;
  const isAlarm = tempAnim >= 29;

  const borderClass = isAlarm ? "alarm-glow" : "border-border";

  const mercuryColor = isAlarm ? "#ef4444" : isWarning ? "#facc15" : "#22c55e";

  return (
    <Card
      className={`
        border transition-all duration-300
        ${borderClass}
      `}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground text-center">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center p-2">
        <svg width="80" height="320" viewBox="0 0 120 360">
          {/* Tubo */}
          <rect
            x="55"
            y={tubeTopY}
            width="20"
            height={tubeHeight}
            rx="10"
            fill="#020617"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Mercurio */}
          <rect
            x="57"
            y={mercuryY}
            width="16"
            height={mercuryHeight}
            rx="8"
            fill={mercuryColor}
            style={{
              transition: "height 0.8s ease, y 0.8s ease, fill 0.4s",
            }}
          />

          {/* Bulbo */}
          <circle
            cx="65"
            cy="300"
            r="22"
            fill="#020617"
            stroke="#334155"
            strokeWidth="2"
          />
          <circle
            cx="65"
            cy="300"
            r="16"
            fill={mercuryColor}
            style={{ transition: "fill 0.4s" }}
          />

          {/* Valor */}
          <text
            x="60"
            y="340"
            textAnchor="middle"
            fill="#e5e7eb"
            fontSize="14"
            fontWeight="bold"
          >
            {tempAnim.toFixed(1)} °C
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}
