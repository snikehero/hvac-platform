interface PowerCardProps {
  status: "ON" | "OFF";
  title?: string;
}

export default function PowerCard({
  status,
  title = "Energía",
}: PowerCardProps) {
  const imgSrc =
    status === "ON" ? "/images/Energy-on.gif" : "/images/Energy-off.png";
  const bgColor = status === "ON" ? "bg-green-700" : "bg-red-700";

  return (
    <div
      className={`flex flex-col items-center p-4 ${bgColor} rounded-xl shadow-md`}
    >
      <h3 className="mb-2 text-white/75 font-semibold">{title}</h3>

      {/* Imagen/GIF forzada a 512x512 */}
      <img
        src={imgSrc}
        alt="Estado de energía"
        className="w-[300px] h-[300px] object-contain"
      />

      <span className="mt-2 text-lg font-bold text-white">{status}</span>
    </div>
  );
}
