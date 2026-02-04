import { Card } from "@/components/ui/card";
import type { TelemetryDto } from "../hooks/useTelemetry";

interface Props {
  data: TelemetryDto;
}

export function TelemetryCard({ data }: Props) {
  const qualityColor =
    data.quality === "GOOD"
      ? "text-green-500"
      : data.quality === "BAD"
        ? "text-red-500"
        : "text-yellow-500";

  return (
    <Card className="p-4 rounded-lg shadow-md border">
      <h2 className="text-lg font-bold">
        {data.stationId} - {data.pointKey}
      </h2>
      <p>
        Value: <span className="font-semibold">{data.value}</span>{" "}
        {data.unit || ""}
      </p>
      <p>Timestamp: {new Date(data.timestamp).toLocaleTimeString()}</p>
      <p className={qualityColor}>Quality: {data.quality}</p>
    </Card>
  );
}
