import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AirflowCardProps {
  airflow: number;
  title?: string;
  status?: "OK" | "WARNING" | "ALARM" | "DISCONNECTED";
}

export default function AirflowCard({
  airflow,
  title = "Flujo de Aire",
  status,
}: AirflowCardProps) {
  const [airAnim, setAirAnim] = useState(airflow);

  useEffect(() => {
    const t = setTimeout(() => setAirAnim(airflow), 100);
    return () => clearTimeout(t);
  }, [airflow]);

  const getBarColor = (v: number) => {
    if (v < 600) return "#ef4444";
    if (v < 1000) return "#facc15";
    return "#22c55e";
  };

  const maxValue = 1500;
  const maxHeight = 160;
  const barHeight = Math.min((airAnim / maxValue) * maxHeight, maxHeight);
  const barY = 200 - barHeight;

  return (
    <Card className={cn("transition-all", status === "ALARM" && "alarm-glow")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <svg width="40" height="200" viewBox="0 0 40 200">
          <rect
            x={15}
            y={40}
            width={10}
            height={160}
            rx={5}
            fill="#020617"
            stroke="#334155"
            strokeWidth={1.5}
          />

          <rect
            x={15}
            y={barY}
            width={10}
            height={barHeight}
            rx={5}
            fill={getBarColor(airAnim)}
            style={{
              transition: "height 0.8s ease, y 0.8s ease, fill 0.4s",
            }}
          />
        </svg>
        <CardTitle  className= "text-2xl font-bold" >
           {airAnim.toFixed(0)} m³/h
        </CardTitle>
      </CardContent>
    </Card>
  );
}
