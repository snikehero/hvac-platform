import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PowerCardProps {
  status: "ON" | "OFF";
  title?: string;
}

export default function PowerCard({
  status,
  title = "Energía",
}: PowerCardProps) {
  const isAlarm = status === "OFF";

  const imgSrc =
    status === "ON" ? "/images/Energy-on.gif" : "/images/Energy-off.png";

  return (
    <Card className={isAlarm ? "alarm-glow" : "border border-slate-700"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <img
          src={imgSrc}
          alt="Estado de energía"
          className="w-75 h-75 object-contain"
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
