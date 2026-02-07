export default function TelemetryCardRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode; // <-- Cambiado de string a ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span className="font-medium text-white">{label}</span>
      </div>

      <div className="font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}
