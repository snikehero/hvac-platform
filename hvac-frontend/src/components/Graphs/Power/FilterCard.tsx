import { useEffect, useState } from "react";

interface FilterCardProps {
  dp: number; // ΔP Filtros
  title?: string;
  maxDP?: number; // valor máximo para normalizar
}

export default function FilterCard({
  dp,
  title = "ΔP Filtros",
  maxDP = 300,
}: FilterCardProps) {
  const [dpAnim, setDpAnim] = useState(dp);

  useEffect(() => {
    const timeout = setTimeout(() => setDpAnim(dp), 100);
    return () => clearTimeout(timeout);
  }, [dp]);

  const tubeHeight = 160;
  const tubeTopY = 20;
  const clampedDP = Math.min(Math.max(dpAnim, 0), maxDP);
  const percentage = clampedDP / maxDP;
  const barHeight = tubeHeight * percentage;

  // Color de la barra según rango
  const getBarColor = (value: number) => {
    if (value < maxDP * 0.5) return "#22c55e"; // verde
    if (value < maxDP * 0.8) return "#facc15"; // amarillo
    return "#ef4444"; // rojo
  };

  // Color de fondo dinámico
  const getBackgroundColor = (value: number) => {
    if (value < maxDP * 0.5) return "bg-green-700";
    if (value < maxDP * 0.8) return "bg-yellow-600";
    return "bg-red-700";
  };

  return (
    <div
      className={`flex flex-col items-center p-4 rounded-xl shadow-md transition-colors duration-500 ${getBackgroundColor(
        clampedDP,
      )}`}
    >
      <h3 className="mb-2 text-white/75 font-semibold">{title}</h3>

      <svg width="80" height="200" viewBox="0 0 80 200">
        {/* Tubo */}
        <rect
          x="35"
          y={tubeTopY}
          width="10"
          height={tubeHeight}
          rx="5"
          fill="#020617"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Barra animada */}
        <rect
          x="35"
          y={tubeTopY + tubeHeight - barHeight}
          width="10"
          height={barHeight}
          rx="5"
          fill={getBarColor(clampedDP)}
          style={{ transition: "height 0.8s ease, y 0.8s ease, fill 0.5s" }}
        />
      </svg>

      <span className="mt-2 text-lg font-bold text-white">
        {dpAnim.toFixed(1)}
      </span>
    </div>
  );
}
