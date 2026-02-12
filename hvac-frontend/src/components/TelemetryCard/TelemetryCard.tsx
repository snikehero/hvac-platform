import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import type { HvacTelemetry } from "@/types/telemetry";
import { getPointIcon } from "../../Helpers/getPointIcon";

import TelemetryCardHeader from "./TelemetryCardHeader";
import TelemetryCardRow from "./TelemetryCardRow";
import TelemetryCardFan from "./TelemetryCardFan";
import TelemetryCardExtras from "./TelemertryCardExtras";
import TelemetryCardTemperatureAverage from "./TelemetryCardTemperatureAverage";
import TelemetryCardCore from "./TelemetryCardCore";
import { useClock } from "@/domain/hooks/useClock";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";

const CORE_KEYS = ["temperature", "humidity", "fan_status", "status"];

interface TelemetryCardProps {
  ahu: HvacTelemetry;
}

export default function TelemetryCard({ ahu }: TelemetryCardProps) {
  const navigate = useNavigate();
  const { stationId, points, timestamp, plantId } = ahu;
  const now = useClock(1000);
  /* ✅ ÚNICA fuente de verdad */
  console.log(now)
  const health = getAhuHealth(ahu);

  /* 🎨 Overlay basado SOLO en health */
  const overlayClass =
    health.status === "ALARM"
      ? "bg-red-900/70"
      : health.status === "WARNING"
      ? "bg-yellow-900/60"
      : health.status === "DISCONNECTED"
      ? "bg-gray-900/70"
      : "bg-black/50";

  const extraPoints = Object.entries(points).filter(
    ([key]) => !CORE_KEYS.includes(key)
  );

  return (
    <Card
      onClick={() => navigate(`/plants/${plantId}/ahus/${stationId}`)}
      className="relative overflow-hidden cursor-pointer transition hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/ahu-bg.jpg')" }}
      />

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* Content */}
      <div className="relative z-10 text-white">
        <TelemetryCardHeader
          stationId={stationId}
          status={health.status}
        />

        <div className="px-6 pb-6 space-y-4">
          <TelemetryCardCore points={points} />

          <TelemetryCardRow
            icon={getPointIcon("temperature", points.temperature?.value)}
            label="Promedio 60s"
            value={<TelemetryCardTemperatureAverage ahu={ahu} />}
          />

          <TelemetryCardFan fan={points.fan_status} />

          {extraPoints.length > 0 && (
            <TelemetryCardExtras points={extraPoints} />
          )}

          <div className="pt-2 text-xs text-white/60">
            Última actualización:{" "}
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
