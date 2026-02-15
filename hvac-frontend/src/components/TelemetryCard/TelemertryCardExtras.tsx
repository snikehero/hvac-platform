/* eslint-disable @typescript-eslint/no-explicit-any */
import TelemetryCardRow from "./TelemetryCardRow";
import { getPointIcon } from "./Helpers/getPointIcon";

export default function TelemetryCardExtras({
  points,
}: {
  points: [string, any][];
}) {
  return (
    <div className="pt-3 border-t border-white/20 space-y-2">
      <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">
        Datos adicionales
      </div>

      {points.map(([key, point]) => (
        <TelemetryCardRow
          key={key}
          icon={getPointIcon(key, point.value)}
          label={formatLabel(key)}
          value={`${point.value ?? "--"} ${point.unit ?? ""}`}
        />
      ))}
    </div>
  );
}

function formatLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
