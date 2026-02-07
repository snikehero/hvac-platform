import { useEffect, useState } from "react";

interface AirflowCardProps {
  airflow: number; // valor real, por ejemplo 0-1500
  title?: string;
}

export default function AirflowCard({
  airflow,
  title = "Flujo de Aire",
}: AirflowCardProps) {
  const [airAnim, setAirAnim] = useState(airflow);

  useEffect(() => {
    const timeout = setTimeout(() => setAirAnim(airflow), 100);
    return () => clearTimeout(timeout);
  }, [airflow]);

  // función para obtener color de la barra según valor
  const getBarColor = (value: number) => {
    if (value < 600) return "#ef4444"; // rojo intenso
    if (value < 1000) return "#facc15"; // amarillo intenso
    return "#22c55e"; // verde intenso
  };

  // función para obtener color de fondo según valor
  const getBackgroundColor = (value: number) => {
    if (value < 600) return "bg-red-700";
    if (value < 1000) return "bg-yellow-600";
    return "bg-green-700";
  };

  // altura proporcional de la barra (max 160px para 1500)
  const maxValue = 1500;
  const maxHeight = 160;
  const barHeight = Math.min((airAnim / maxValue) * maxHeight, maxHeight);
  const barY = 200 - barHeight; // para que la barra suba desde abajo

  return (
    <div
      className={`flex flex-col items-center p-4 rounded-xl shadow-md transition-colors duration-500 ${getBackgroundColor(
        airAnim,
      )}`}
    >
      <h3 className="mb-2 text-white/75 font-semibold">{title}</h3>

      <svg width="40" height="200" viewBox="0 0 40 200">
        {/* Tubo de fondo */}
        <rect
          x={15}
          y={40}
          width={10}
          height={160}
          rx={5} // redondear bordes
          fill="#020617"
          stroke="#334155"
          strokeWidth={1.5}
        />

        {/* Barra de flujo de aire */}
        <rect
          x={15}
          y={barY}
          width={10}
          height={barHeight}
          rx={5} // redondeada
          fill={getBarColor(airAnim)}
          style={{
            transition: "height 0.8s ease, y 0.8s ease, fill 0.4s",
          }}
        />
      </svg>

      <span className="mt-2 text-lg font-bold text-white">
        {airAnim.toFixed(0)} m³/h
      </span>
    </div>
  );
}
