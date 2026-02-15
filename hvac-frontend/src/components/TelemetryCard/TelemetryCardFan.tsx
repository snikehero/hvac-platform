import { Badge } from "@/components/ui/badge";
import type { HvacPoint } from "@/types/telemetry";
import { getPointIcon } from "./Helpers/getPointIcon";

interface Props {
  fan?: HvacPoint;
}

export default function TelemetryCardFan({ fan }: Props) {
  // Narrowing seguro del valor
  const fanValue =
    fan?.value === "ON" || fan?.value === "OFF" ? fan.value : undefined;

  const isOn = fanValue === "ON";

  return (
    <div className="flex items-center justify-between">
      {/* Label + Icon */}
      <div className="flex items-center gap-2 text-sm font-medium">
        {getPointIcon("fan_status", fanValue)}
        Ventilador
      </div>

      {/* Estado */}
      <Badge
        className={isOn ? "bg-green-600 text-white" : "bg-gray-600 text-white"}
      >
        {fanValue ?? "--"}
      </Badge>
    </div>
  );
}
