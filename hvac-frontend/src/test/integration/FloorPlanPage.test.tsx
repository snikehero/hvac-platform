import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/renderWithProviders";
import FloorPlanPage from "@/pages/HVAC/FloorPlan/FloorPlanPage";

describe("FloorPlanPage", () => {
  beforeEach(() => {
    localStorage.removeItem("hvac-floorplan");
  });

  it("renders the page title", () => {
    renderWithProviders(<FloorPlanPage />);
    expect(screen.getByText(/Floor Plan|Plano de Planta/i)).toBeInTheDocument();
  });

  it("shows empty state when no floors are configured", () => {
    renderWithProviders(<FloorPlanPage />);
    expect(screen.getByText(/No floors configured|Sin pisos configurados/i)).toBeInTheDocument();
  });

  it("shows Add Floor button", () => {
    renderWithProviders(<FloorPlanPage />);
    expect(screen.getAllByRole("button", { name: /Add Floor|Agregar Piso/i }).length).toBeGreaterThan(0);
  });

  it("opens the Add Floor dialog when clicking Add Floor", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FloorPlanPage />);
    const addBtn = screen.getAllByRole("button", { name: /Add Floor|Agregar Piso/i })[0];
    await user.click(addBtn);
    expect(screen.getByPlaceholderText(/Ground Floor|Planta Baja/i)).toBeInTheDocument();
  });

  it("creates a floor from the dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FloorPlanPage />);

    const addBtn = screen.getAllByRole("button", { name: /Add Floor|Agregar Piso/i })[0];
    await user.click(addBtn);

    const input = screen.getByPlaceholderText(/Ground Floor|Planta Baja/i);
    await user.type(input, "Level 1");

    const createBtn = screen.getByRole("button", { name: /Create|Crear/i });
    await user.click(createBtn);

    // Floor tab should now appear
    expect(screen.getByText("Level 1")).toBeInTheDocument();
  });

  it("shows Edit Mode button after a floor is created", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FloorPlanPage />);

    const addBtn = screen.getAllByRole("button", { name: /Add Floor|Agregar Piso/i })[0];
    await user.click(addBtn);
    await user.type(screen.getByPlaceholderText(/Ground Floor|Planta Baja/i), "Floor A");
    await user.click(screen.getByRole("button", { name: /Create|Crear/i }));

    expect(screen.getByRole("button", { name: /Edit Mode|Modo Edición/i })).toBeInTheDocument();
  });

  it("switches between View and Edit mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FloorPlanPage />);

    // Create a floor first
    await user.click(screen.getAllByRole("button", { name: /Add Floor|Agregar Piso/i })[0]);
    await user.type(screen.getByPlaceholderText(/Ground Floor|Planta Baja/i), "Test Floor");
    await user.click(screen.getByRole("button", { name: /Create|Crear/i }));

    // Should start in View mode
    const toggleBtn = screen.getByRole("button", { name: /Edit Mode/i });
    await user.click(toggleBtn);

    // Should now show "View Mode" button
    expect(screen.getByRole("button", { name: /View Mode/i })).toBeInTheDocument();
  });
});
