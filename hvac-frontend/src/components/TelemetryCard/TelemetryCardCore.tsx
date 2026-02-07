/* eslint-disable @typescript-eslint/no-explicit-any */
import TelemetryCardRow from "./TelemetryCardRow";
import { getPointIcon } from "../../Helpers/getPointIcon";

export default function TelemetryCardCore({ points }: { points: any }) {
  return (
    <>
      <TelemetryCardRow
        icon={getPointIcon("temperature", points.temperature?.value)}
        label="Temperatura"
        value={`${points.temperature?.value ?? "--"} ${
          points.temperature?.unit ?? ""
        }`}
      />

      <TelemetryCardRow
        icon={getPointIcon("humidity", points.humidity?.value)}
        label="Humedad"
        value={`${points.humidity?.value ?? "--"} ${
          points.humidity?.unit ?? ""
        }`}
      />
    </>
  );
}
