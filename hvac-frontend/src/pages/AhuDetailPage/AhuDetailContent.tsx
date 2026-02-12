/* eslint-disable react-hooks/rules-of-hooks */
import { useParams } from "react-router-dom";

import { useTelemetry } from "@/hooks/useTelemetry";
import { useAhuHistory } from "@/hooks/useAhuHistory";

import AhuHeader from "./AhuHeader";
import { AhuHealthSummary } from "@/components/ahu/AhuHealthSummary";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";

import { renderAhuCard } from "@/components/ahu/renderAhuCard";
import { AhuHistoryTemperatureChart } from "@/components/History/AhuHistoryTemperatureCard";
import { AhuHistoryHumidityChart } from "@/components/History/AhuHistoryHumidityChart";
import { useClock } from "@/domain/hooks/useClock";
export default function AhuDetailPage() {
  const { telemetry } = useTelemetry();
  const { ahuId, plantId } = useParams();
  const now = useClock(1000);
  console.log(now)
  const ahu = telemetry.find(
    (t) => t.stationId === ahuId && t.plantId === plantId,
  );

  if (!ahu)
    return <div className="text-muted-foreground">AHU no encontrado</div>;

  const history = useAhuHistory(ahu);

  // ✅ Dominio decide TODO
  const health = getAhuHealth(ahu);

  return (
    <div className="h-screen grid grid-rows-[auto_auto_auto_1fr_auto] gap-2 p-2">
      <AhuHealthSummary
        status={health.status}
        badPoints={health.badPoints}
        lastUpdate={health.lastUpdate}
      />

      {/* Header ahora debe aceptar AhuHealthStatus */}
      <AhuHeader ahu={ahu} status={health.status} />

      {/* ========================= */}
      {/* CONDICIONES AMBIENTALES */}
      {/* ========================= */}
      <section className="space-y-3">
        <section className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Condiciones Ambientales
          </h3>
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-2 text-xs">
            {renderAhuCard("temperature", ahu)}
            {renderAhuCard("humidity", ahu)}
            <AhuHistoryTemperatureChart
              data={history.temperature}
              status={health.status}
            />
          </div>
        </section>

        {/* ========================= */}
        {/* MOVIMIENTO DE AIRE */}
        {/* ========================= */}
        <section className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Movimiento de Aire
          </h3>
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-2 text-xs">
            {renderAhuCard("fan", ahu)}
            {renderAhuCard("airflow", ahu)}
            {renderAhuCard("damper", ahu)}
          </div>
        </section>

        {/* ========================= */}
        {/* ENERGÍA Y FILTRACIÓN */}
        {/* ========================= */}
        <section className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Energía y Filtración
          </h3>
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-2 text-xs">
            {renderAhuCard("power", ahu)}
            {renderAhuCard("filter", ahu)}
            <AhuHistoryHumidityChart
              data={history.humidity}
              status={health.status}
            />
          </div>
        </section>
      </section>

      <div className="text-[10px] text-muted-foreground text-right">
        Última actualización: {health.lastUpdate.toLocaleString()}
      </div>
    </div>
  );
}
