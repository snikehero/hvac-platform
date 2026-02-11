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
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";
import { getAhuOperationalStatus } from "@/domain/ahu/ahuSelectors";
const CORE_KEYS = ["temperature", "humidity", "fan_status", "status"];

interface TelemetryCardProps {
  ahu: HvacTelemetry;
}

export default function TelemetryCard({ ahu }: TelemetryCardProps) {
  const navigate = useNavigate();
  const { stationId, points, timestamp, plantId } = ahu;

  // ✅ Status validado correctamente
const health = getAhuHealth(ahu)
const operationalStatus = getAhuOperationalStatus(ahu)

const overlayClass =
  operationalStatus === "ALARM"
    ? "bg-red-900/70"
    :  operationalStatus === "WARNING"
      ? "bg-yellow-900/60"
      :  operationalStatus === "DISCONNECTED"
        ? "bg-gray-900/70"
        : "bg-black/50";

  const extraPoints = Object.entries(points).filter(
    ([key]) => !CORE_KEYS.includes(key),
  );


  return (
    <Card
      onClick={() => navigate(`/plants/${plantId}/ahus/${stationId}`)}
      className="relative overflow-hidden cursor-pointer transition hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* ---------- Background ---------- */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/ahu-bg.jpg')" }}
      />

      {/* ---------- Overlay ---------- */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* ---------- Content ---------- */}
      <div className="relative z-10 text-white">
        <TelemetryCardHeader stationId={stationId} status={health.status} />

        <div className="px-6 pb-6 space-y-4">
          {/* ---------- Core Points ---------- */}
          <TelemetryCardCore points={points} />
          {/* ---------- Temperatura promedio 60s ---------- */}
          <TelemetryCardRow
            icon={getPointIcon("temperature", points.temperature?.value)}
            label="Promedio 60s"
            value={<TelemetryCardTemperatureAverage ahu={ahu} />}
          />

          {/* ---------- Fan ---------- */}
          <TelemetryCardFan fan={points.fan_status} />

          {/* ---------- Extras ---------- */}
          {extraPoints.length > 0 && (
            <TelemetryCardExtras points={extraPoints} />
          )}

          {/* ---------- Última actualización ---------- */}
          <div className="pt-2 text-xs text-white/60">
            Última actualización: {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
