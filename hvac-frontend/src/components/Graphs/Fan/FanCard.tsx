interface FanCardProps {
  status: "ON" | "OFF";
  title?: string;
}

export default function FanCardIndustrial({
  status,
  title = "Ventilador",
}: FanCardProps) {
  const imgSrc = status === "ON" ? "/images/fan-on.gif" : "/images/fan-off.png";
  const bgColor = status === "ON" ? "bg-green-700" : "bg-red-700";

  return (
    <div
      className={`flex flex-col items-center p-4 ${bgColor} rounded-xl shadow-md`}
    >
      <h3 className="mb-2 text-white/75 font-semibold">{title}</h3>

      {/* Imagen/GIF forzada a 512x512 */}
      <img
        src={imgSrc}
        alt="Ventilador industrial"
        className="w-[300px] h-[300px] object-contain"
      />

      <span className="mt-2 text-lg font-bold text-white">{status}</span>
    </div>
  );
}
