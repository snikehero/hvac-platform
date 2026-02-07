import { useEffect, useState } from "react";

interface DamperCardProps {
  position: number; // 0-100%
  title?: string;
}

export default function DamperCard({
  position,
  title = "Compuerta",
}: DamperCardProps) {
  const [posAnim, setPosAnim] = useState(position);

  useEffect(() => {
    const timeout = setTimeout(() => setPosAnim(position), 100);
    return () => clearTimeout(timeout);
  }, [position]);

  const barHeight = 160 * (posAnim / 100);

  // Color de la barra según porcentaje
  const getBarColor = (value: number) => {
    if (value < 50) return "#22c55e"; // verde
    if (value < 80) return "#facc15"; // amarillo
    return "#ef4444"; // rojo
  };

  // Color de fondo dinámico
  const getBackgroundColor = (value: number) => {
    if (value < 50) return "bg-green-700";
    if (value < 80) return "bg-yellow-600";
    return "bg-red-700";
  };

  return (
    <div
      className={`flex flex-col items-center p-4 rounded-xl shadow-md transition-colors duration-500 ${getBackgroundColor(
        posAnim,
      )}`}
    >
      <h3 className="mb-2 text-white/75 font-semibold">{title}</h3>

      <svg width="80" height="200" viewBox="0 0 80 200">
        {/* Tubo */}
        <rect
          x="35"
          y="20"
          width="10"
          height="160"
          rx="5"
          fill="#020617"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Posición de la compuerta */}
        <rect
          x="35"
          y={180 - barHeight + 20}
          width="10"
          height={barHeight}
          rx="5"
          fill={getBarColor(posAnim)}
          style={{ transition: "height 0.8s ease, y 0.8s ease, fill 0.5s" }}
        />
      </svg>

      <span className="mt-2 text-lg font-bold text-white">
        {posAnim.toFixed(0)}%
      </span>
    </div>
  );
}
