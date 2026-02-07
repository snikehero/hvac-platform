import { useEffect, useState } from "react";

interface HumidityCardProps {
  humidity: number; // 0-100%
  title?: string;
}

export default function HumidityCard({
  humidity,
  title = "Humedad",
}: HumidityCardProps) {
  const [humAnim, setHumAnim] = useState(humidity);

  // Animación suave al cambiar valor
  useEffect(() => {
    const timeout = setTimeout(() => setHumAnim(humidity), 100);
    return () => clearTimeout(timeout);
  }, [humidity]);

  const tubeHeight = 160; // altura del tubo
  const tubeTopY = 20; // margen superior
  const clampedHum = Math.min(Math.max(humAnim, 0), 100);
  const percentage = clampedHum / 100;
  const circleY = tubeTopY + tubeHeight * (1 - percentage);

  // Color de fondo dinámico según humedad
  const getBackgroundColor = (value: number) => {
    if (value < 50) return "bg-green-700"; // bueno
    if (value < 70) return "bg-yellow-600"; // intermedio
    return "bg-red-700"; // malo
  };

  return (
    <div
      className={`flex flex-col items-center p-4 rounded-xl shadow-md transition-colors duration-500 ${getBackgroundColor(
        clampedHum,
      )}`}
    >
      <h3 className="mb-2 text-white/75 font-semibold">{title}</h3>

      <svg width="80" height="200" viewBox="0 0 80 200">
        {/* Tubo de referencia */}
        <rect
          x="30"
          y={tubeTopY}
          width="20"
          height={tubeHeight}
          rx="10"
          fill="#020617"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Gota animada */}
        <circle cx="40" cy={circleY} r="20" fill="url(#gradHum)">
          <animate
            attributeName="cy"
            values={`${circleY};${circleY - 8};${circleY}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Gradiente azul */}
        <defs>
          <linearGradient id="gradHum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>

      {/* Valor numérico */}
      <span className="mt-2 text-lg font-bold text-white">
        {humAnim.toFixed(1)}%
      </span>
    </div>
  );
}
