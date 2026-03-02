export interface AhuMarkerPosition {
  /** Horizontal position as a percentage of the canvas width (0–100) */
  x: number;
  /** Vertical position as a percentage of the canvas height (0–100) */
  y: number;
  /** AHU identifier — matches HvacTelemetry.stationId */
  ahuId: string;
  /** Plant identifier — matches HvacTelemetry.plantId */
  plantId: string;
  /** Optional display label (defaults to ahuId) */
  label?: string;
}

export interface FloorConfig {
  id: string;
  name: string;
  /** Base64-encoded image (data: URL) or empty string when no image uploaded */
  imageDataUrl: string;
  markers: AhuMarkerPosition[];
}

export interface FloorPlanState {
  floors: FloorConfig[];
  activeFloorId: string | null;
}
