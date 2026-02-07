import React, { useEffect, useState } from "react";

interface TemperatureCardProps {
  temperature: number;
  title?: string;
  minTemp?: number;
  maxTemp?: number;
}

const TemperatureCard: React.FC<TemperatureCardProps> = ({
  temperature,
  title = "Temperatura",
  minTemp = 0,
  maxTemp = 40,
}) => {
  const tubeHeight = 240;
  const tubeTopY = 40;

  const [tempAnim, setTempAnim] = useState(temperature);

  useEffect(() => {
    const timeout = setTimeout(() => setTempAnim(temperature), 100);
    return () => clearTimeout(timeout);
  }, [temperature]);

  const clampedTemp = Math.min(Math.max(tempAnim, minTemp), maxTemp);
  const percentage = (clampedTemp - minTemp) / (maxTemp - minTemp);
  const mercuryHeight = tubeHeight * percentage;
  const mercuryY = tubeTopY + (tubeHeight - mercuryHeight);

  // Color del mercurio según temperatura
  const getColor = (temp: number) => {
    if (temp < 24.1) return "#22c55e"; // verde
    if (temp < 29) return "#facc15"; // amarillo
    return "#ef4444"; // rojo
  };
  const mercuryColor = getColor(tempAnim);

  // Color de fondo de la tarjeta según temperatura
  const getBackgroundColor = (temp: number) => {
    if (temp < 24.1) return "bg-green-700";
    if (temp < 29) return "bg-yellow-600";
    return "bg-red-700";
  };

  return (
    <div
      className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-500 ${getBackgroundColor(
        tempAnim,
      )}`}
    >
      {title && <span className="text-white/75 mb-2 text-sm">{title}</span>}

      <svg width="80" height="320" viewBox="0 0 120 360">
        {/* Tubo de fondo */}
        <rect
          x="55"
          y={tubeTopY}
          width="20"
          height={tubeHeight}
          rx="10"
          fill="#020617"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Mercurio */}
        <rect
          x="57"
          y={mercuryY}
          width="16"
          height={mercuryHeight}
          rx="8"
          fill={mercuryColor}
          style={{ transition: "height 0.8s ease, y 0.8s ease, fill 0.4s" }}
        />

        {/* Base redonda */}
        <circle
          cx="65"
          cy="300"
          r="22"
          fill="#020617"
          stroke="#334155"
          strokeWidth="2"
        />
        <circle
          cx="65"
          cy="300"
          r="16"
          fill={mercuryColor}
          style={{ transition: "fill 0.4s" }}
        />

        {/* Valor */}
        <text
          x="60"
          y="340"
          textAnchor="middle"
          fill="#e5e7eb"
          fontSize="14"
          fontWeight="bold"
        >
          {tempAnim.toFixed(1)} °C
        </text>
      </svg>
    </div>
  );
};

export default TemperatureCard;
