import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { DashboardWidgetConfig } from "@/context/SettingsContext";

interface DashboardWidgetRowProps {
  widget: DashboardWidgetConfig;
  label: string;
  visibleLabel: string;
  onToggle: (id: DashboardWidgetConfig["id"], visible: boolean) => void;
}

export function DashboardWidgetRow({
  widget,
  label,
  visibleLabel,
  onToggle,
}: DashboardWidgetRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-3"
    >
      {/* Drag handle */}
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus-visible:outline-none"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Label */}
      <span className="flex-1 text-sm font-medium">{label}</span>

      {/* Visibility toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{visibleLabel}</span>
        <Switch
          checked={widget.visible}
          onCheckedChange={(checked) => onToggle(widget.id, checked)}
        />
      </div>
    </div>
  );
}
