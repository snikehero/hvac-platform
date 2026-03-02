import { useRef, useCallback } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { AhuMarker } from "./AhuMarker";
import { FloorPlanUploader } from "./FloorPlanUploader";
import type { FloorConfig, AhuMarkerPosition } from "@/types/floorplan";
import type { HvacTelemetry } from "@/types/telemetry";
import { getAhuHealth, type AhuHealthStatus } from "@/domain/ahu/getAhuHealth";

interface FloorPlanCanvasProps {
  floor: FloorConfig;
  telemetryMap: Map<string, HvacTelemetry>;
  connectionMap: Map<string, boolean>;
  editMode: boolean;
  selectedMarkerId: string | null;
  onMarkerClick: (marker: AhuMarkerPosition) => void;
  onMarkerMove: (ahuId: string, plantId: string, x: number, y: number) => void;
  onImageUploaded: (dataUrl: string) => void;
  onCanvasClick: () => void;
}

function getStatus(
  marker: AhuMarkerPosition,
  telemetryMap: Map<string, HvacTelemetry>,
  connectionMap: Map<string, boolean>,
): AhuHealthStatus {
  const key = `${marker.plantId}-${marker.ahuId}`;
  const isConnected = connectionMap.get(key) ?? false;
  if (!isConnected) return "DISCONNECTED";
  const tel = telemetryMap.get(key);
  if (!tel) return "DISCONNECTED";
  return getAhuHealth(tel).status;
}

/** Dot-grid pattern for empty canvas background */
const GRID_BG: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

export function FloorPlanCanvas({
  floor,
  telemetryMap,
  connectionMap,
  editMode,
  selectedMarkerId,
  onMarkerClick,
  onMarkerMove,
  onImageUploaded,
  onCanvasClick,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      if (!delta || !canvasRef.current) return;

      const [plantId, ahuId] = (active.id as string).split("::");
      const marker = floor.markers.find(
        (m) => m.ahuId === ahuId && m.plantId === plantId,
      );
      if (!marker) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const newX = Math.min(100, Math.max(0, marker.x + (delta.x / rect.width) * 100));
      const newY = Math.min(100, Math.max(0, marker.y + (delta.y / rect.height) * 100));

      onMarkerMove(ahuId, plantId, newX, newY);
    },
    [floor.markers, onMarkerMove],
  );

  if (!floor.imageDataUrl) {
    return (
      <div
        className="flex-1 rounded-lg border border-border overflow-hidden"
        style={GRID_BG}
      >
        <div className="flex h-full items-center justify-center p-6">
          <FloorPlanUploader onImageLoaded={onImageUploaded} />
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        ref={canvasRef}
        className="relative flex-1 overflow-hidden rounded-lg border border-border bg-muted/10 select-none"
        style={{ minHeight: 400 }}
        onClick={onCanvasClick}
      >
        {/* Floor plan image */}
        <img
          src={floor.imageDataUrl}
          alt="Floor plan"
          draggable={false}
          className="w-full h-full object-contain pointer-events-none"
          style={{ display: "block" }}
        />

        {/* AHU Markers */}
        {floor.markers.map((marker) => {
          const markerId = `${marker.plantId}::${marker.ahuId}`;
          const key = `${marker.plantId}-${marker.ahuId}`;
          const status = getStatus(marker, telemetryMap, connectionMap);
          const tel = telemetryMap.get(key);

          return (
            <AhuMarker
              key={markerId}
              ahuId={marker.ahuId}
              plantId={marker.plantId}
              label={marker.label ?? marker.ahuId}
              x={marker.x}
              y={marker.y}
              status={status}
              editMode={editMode}
              selected={selectedMarkerId === markerId}
              onClick={() => onMarkerClick(marker)}
              temperature={typeof tel?.points.temperature?.value === "number" ? tel.points.temperature.value : undefined}
              temperatureUnit={tel?.points.temperature?.unit ?? "°C"}
              humidity={typeof tel?.points.humidity?.value === "number" ? tel.points.humidity.value : undefined}
              humidityUnit={tel?.points.humidity?.unit ?? "%"}
            />
          );
        })}

        {/* Edit mode overlay hint */}
        {editMode && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground pointer-events-none shadow">
            Drag markers to reposition · Click to select
          </div>
        )}
      </div>
    </DndContext>
  );
}
