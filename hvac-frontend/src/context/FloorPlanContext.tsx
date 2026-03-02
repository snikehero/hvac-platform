/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { FloorConfig, FloorPlanState, AhuMarkerPosition } from "@/types/floorplan";

interface FloorPlanContextValue {
  floors: FloorConfig[];
  activeFloorId: string | null;
  activeFloor: FloorConfig | null;

  setActiveFloor: (id: string) => void;

  addFloor: (name: string) => void;
  renameFloor: (id: string, name: string) => void;
  removeFloor: (id: string) => void;
  setFloorImage: (id: string, imageDataUrl: string) => void;

  addMarker: (floorId: string, marker: AhuMarkerPosition) => void;
  updateMarkerPosition: (floorId: string, ahuId: string, plantId: string, x: number, y: number) => void;
  removeMarker: (floorId: string, ahuId: string, plantId: string) => void;
}

const FloorPlanContext = createContext<FloorPlanContextValue | null>(null);

const STORAGE_KEY = "hvac-floorplan";

function loadState(): FloorPlanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { floors: [], activeFloorId: null };
    return JSON.parse(raw) as FloorPlanState;
  } catch {
    return { floors: [], activeFloorId: null };
  }
}

function saveState(state: FloorPlanState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function FloorPlanProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FloorPlanState>(loadState);

  const update = useCallback((updater: (prev: FloorPlanState) => FloorPlanState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const activeFloor = state.floors.find((f) => f.id === state.activeFloorId) ?? null;

  const setActiveFloor = useCallback((id: string) => {
    update((prev) => ({ ...prev, activeFloorId: id }));
  }, [update]);

  const addFloor = useCallback((name: string) => {
    const floor: FloorConfig = {
      id: crypto.randomUUID(),
      name,
      imageDataUrl: "",
      markers: [],
    };
    update((prev) => ({
      floors: [...prev.floors, floor],
      activeFloorId: prev.activeFloorId ?? floor.id,
    }));
  }, [update]);

  const renameFloor = useCallback((id: string, name: string) => {
    update((prev) => ({
      ...prev,
      floors: prev.floors.map((f) => (f.id === id ? { ...f, name } : f)),
    }));
  }, [update]);

  const removeFloor = useCallback((id: string) => {
    update((prev) => {
      const floors = prev.floors.filter((f) => f.id !== id);
      const activeFloorId =
        prev.activeFloorId === id
          ? (floors[0]?.id ?? null)
          : prev.activeFloorId;
      return { floors, activeFloorId };
    });
  }, [update]);

  const setFloorImage = useCallback((id: string, imageDataUrl: string) => {
    update((prev) => ({
      ...prev,
      floors: prev.floors.map((f) => (f.id === id ? { ...f, imageDataUrl } : f)),
    }));
  }, [update]);

  const addMarker = useCallback((floorId: string, marker: AhuMarkerPosition) => {
    update((prev) => ({
      ...prev,
      floors: prev.floors.map((f) => {
        if (f.id !== floorId) return f;
        // Replace if same AHU+plant already exists on this floor
        const filtered = f.markers.filter(
          (m) => !(m.ahuId === marker.ahuId && m.plantId === marker.plantId),
        );
        return { ...f, markers: [...filtered, marker] };
      }),
    }));
  }, [update]);

  const updateMarkerPosition = useCallback(
    (floorId: string, ahuId: string, plantId: string, x: number, y: number) => {
      update((prev) => ({
        ...prev,
        floors: prev.floors.map((f) => {
          if (f.id !== floorId) return f;
          return {
            ...f,
            markers: f.markers.map((m) =>
              m.ahuId === ahuId && m.plantId === plantId ? { ...m, x, y } : m,
            ),
          };
        }),
      }));
    },
    [update],
  );

  const removeMarker = useCallback(
    (floorId: string, ahuId: string, plantId: string) => {
      update((prev) => ({
        ...prev,
        floors: prev.floors.map((f) => {
          if (f.id !== floorId) return f;
          return {
            ...f,
            markers: f.markers.filter(
              (m) => !(m.ahuId === ahuId && m.plantId === plantId),
            ),
          };
        }),
      }));
    },
    [update],
  );

  return (
    <FloorPlanContext.Provider
      value={{
        floors: state.floors,
        activeFloorId: state.activeFloorId,
        activeFloor,
        setActiveFloor,
        addFloor,
        renameFloor,
        removeFloor,
        setFloorImage,
        addMarker,
        updateMarkerPosition,
        removeMarker,
      }}
    >
      {children}
    </FloorPlanContext.Provider>
  );
}

export function useFloorPlan() {
  const ctx = useContext(FloorPlanContext);
  if (!ctx) throw new Error("useFloorPlan must be used within a FloorPlanProvider");
  return ctx;
}
