import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FanCardProps {
  status: "ON" | "OFF";
  title?: string;
}

export default function FanCardIndustrial({
  status,
  title = "Ventilador",
}: FanCardProps) {
  const isAlarm = status === "OFF";
  const imgSrc = status === "ON" ? "/images/fan-on.gif" : "/images/fan-off.png";

  return (
    <Card className={isAlarm ? "alarm-glow" : "border border-slate-700"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <img
          src={imgSrc}
          alt="Ventilador industrial"
          className="w-35 h-35 object-contain"
        />

        <span
          className={`mt-2 text-lg font-bold ${
            isAlarm ? "text-red-400" : "text-green-400"
          }`}
        >
          {status}
        </span>
      </CardContent>
    </Card>
  );
}
