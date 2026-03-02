import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { FloorPlanProvider, useFloorPlan } from "@/context/FloorPlanContext";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <FloorPlanProvider>{children}</FloorPlanProvider>;
}

describe("FloorPlanContext", () => {
  beforeEach(() => {
    localStorage.removeItem("hvac-floorplan");
  });

  it("starts with no floors", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    expect(result.current.floors).toHaveLength(0);
    expect(result.current.activeFloorId).toBeNull();
  });

  it("addFloor creates a floor and makes it active", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Ground Floor"));
    expect(result.current.floors).toHaveLength(1);
    expect(result.current.floors[0].name).toBe("Ground Floor");
    expect(result.current.activeFloorId).toBe(result.current.floors[0].id);
  });

  it("addFloor preserves existing active floor when adding a second", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Floor 1"));
    const firstId = result.current.floors[0].id;
    act(() => result.current.addFloor("Floor 2"));
    expect(result.current.floors).toHaveLength(2);
    expect(result.current.activeFloorId).toBe(firstId); // first floor stays active
  });

  it("setActiveFloor switches active floor", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Floor 1"));
    act(() => result.current.addFloor("Floor 2"));
    const secondId = result.current.floors[1].id;
    act(() => result.current.setActiveFloor(secondId));
    expect(result.current.activeFloorId).toBe(secondId);
  });

  it("renameFloor changes only the target floor name", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Old Name"));
    const id = result.current.floors[0].id;
    act(() => result.current.renameFloor(id, "New Name"));
    expect(result.current.floors[0].name).toBe("New Name");
  });

  it("removeFloor deletes the floor and updates active", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Floor 1"));
    act(() => result.current.addFloor("Floor 2"));
    const firstId = result.current.floors[0].id;
    const secondId = result.current.floors[1].id;
    act(() => result.current.setActiveFloor(firstId));
    act(() => result.current.removeFloor(firstId));
    expect(result.current.floors).toHaveLength(1);
    // Active should now be the remaining floor
    expect(result.current.activeFloorId).toBe(secondId);
  });

  it("addMarker places a marker on the specified floor", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Floor 1"));
    const floorId = result.current.floors[0].id;
    act(() =>
      result.current.addMarker(floorId, {
        ahuId: "AHU-01",
        plantId: "plant-1",
        x: 25,
        y: 50,
      }),
    );
    expect(result.current.floors[0].markers).toHaveLength(1);
    expect(result.current.floors[0].markers[0].ahuId).toBe("AHU-01");
  });

  it("addMarker replaces existing marker for same AHU+plant", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Floor 1"));
    const floorId = result.current.floors[0].id;
    act(() => result.current.addMarker(floorId, { ahuId: "AHU-01", plantId: "plant-1", x: 10, y: 10 }));
    act(() => result.current.addMarker(floorId, { ahuId: "AHU-01", plantId: "plant-1", x: 80, y: 80 }));
    expect(result.current.floors[0].markers).toHaveLength(1);
    expect(result.current.floors[0].markers[0].x).toBe(80);
  });

  it("updateMarkerPosition moves the marker", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Floor 1"));
    const floorId = result.current.floors[0].id;
    act(() => result.current.addMarker(floorId, { ahuId: "AHU-01", plantId: "plant-1", x: 20, y: 20 }));
    act(() => result.current.updateMarkerPosition(floorId, "AHU-01", "plant-1", 60, 70));
    expect(result.current.floors[0].markers[0].x).toBe(60);
    expect(result.current.floors[0].markers[0].y).toBe(70);
  });

  it("removeMarker deletes the specific marker", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Floor 1"));
    const floorId = result.current.floors[0].id;
    act(() => result.current.addMarker(floorId, { ahuId: "AHU-01", plantId: "plant-1", x: 50, y: 50 }));
    act(() => result.current.addMarker(floorId, { ahuId: "AHU-02", plantId: "plant-1", x: 75, y: 75 }));
    act(() => result.current.removeMarker(floorId, "AHU-01", "plant-1"));
    expect(result.current.floors[0].markers).toHaveLength(1);
    expect(result.current.floors[0].markers[0].ahuId).toBe("AHU-02");
  });

  it("setFloorImage stores the image data URL", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Floor 1"));
    const floorId = result.current.floors[0].id;
    act(() => result.current.setFloorImage(floorId, "data:image/png;base64,abc123"));
    expect(result.current.floors[0].imageDataUrl).toBe("data:image/png;base64,abc123");
  });

  it("persists state to localStorage", () => {
    const { result } = renderHook(() => useFloorPlan(), { wrapper });
    act(() => result.current.addFloor("Persisted Floor"));
    const stored = JSON.parse(localStorage.getItem("hvac-floorplan") ?? "{}");
    expect(stored.floors[0].name).toBe("Persisted Floor");
  });
});
