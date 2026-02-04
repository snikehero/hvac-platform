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
        Values: <span className="font-semibold">{data.value}</span>{" "}
        {data.unit || ""}
      </p>
      <p>Timestamp: {new Date(data.timestamp).toLocaleTimeString()}</p>
      <p className={qualityColor}>Quality: {data.quality}</p>
    </Card>
  );
}

// import { Card } from "@/components/ui/card";
// import type { TelemetryDto } from "../mockData"; // use mockData types

// interface Props {
//   data: TelemetryDto;
// }

// export function TelemetryCard({ data }: Props) {
//   // Extract topic parts
//   const topicParts = data.topic.split("/");
//   const stationId = topicParts[2] || "Unknown";
//   const pointKey = topicParts[3] || "Unknown";

//   const qualityColor =
//     data.payload.quality === "GOOD"
//       ? "text-green-500"
//       : data.payload.quality === "BAD"
//         ? "text-red-500"
//         : "text-yellow-500";

//   return (
//     <Card className="p-4 rounded-lg shadow-md border">
//       <h2 className="text-lg font-bold">
//         {stationId} - {pointKey}
//       </h2>
//       <p>
//         Value: <span className="font-semibold">{data.payload.value}</span>{" "}
//         {data.payload.unit || ""}
//       </p>
//       <p>Timestamp: {new Date(data.payload.timestamp).toLocaleTimeString()}</p>
//       <p className={qualityColor}>Quality: {data.payload.quality}</p>
//     </Card>
//   );
// }
