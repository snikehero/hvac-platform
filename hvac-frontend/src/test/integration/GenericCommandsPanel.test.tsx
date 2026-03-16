import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { GenericCommandsPanel } from "@/components/GenericCommandsPanel/GenericCommandsPanel";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { MachineCommand } from "@/types/machine-type";

const toggleCommand: MachineCommand = {
  id: "c1",
  key: "fan_status",
  label: "Fan Control",
  commandType: "toggle",
  config: { onValue: "ON", offValue: "OFF" },
  displayOrder: 1,
};

const rangeCommand: MachineCommand = {
  id: "c2",
  key: "damper_position",
  label: "Damper Position",
  commandType: "range",
  config: { min: 0, max: 100, step: 5, unit: "%" },
  displayOrder: 2,
};

const selectCommand: MachineCommand = {
  id: "c3",
  key: "mode",
  label: "Operating Mode",
  commandType: "select",
  config: { options: ["auto", "manual", "off"] },
  displayOrder: 3,
};

const baseProps = {
  machineType: "hvac",
  plantId: "PLANT-A",
  stationId: "AHU-01",
};

describe("GenericCommandsPanel", () => {
  it("renders toggle command with ON/OFF buttons", () => {
    renderWithProviders(
      <GenericCommandsPanel
        {...baseProps}
        commands={[toggleCommand]}
        currentPoints={{ fan_status: { value: "ON" } }}
      />,
    );

    expect(screen.getByText("Fan Control")).toBeInTheDocument();
    // ON and OFF buttons
    const buttons = screen.getAllByRole("button");
    const buttonTexts = buttons.map((b) => b.textContent);
    expect(buttonTexts).toContain("ON");
    expect(buttonTexts).toContain("OFF");
  });

  it("renders range command with a slider input", () => {
    renderWithProviders(
      <GenericCommandsPanel
        {...baseProps}
        commands={[rangeCommand]}
        currentPoints={{ damper_position: { value: 75 } }}
      />,
    );

    expect(screen.getByText("Damper Position")).toBeInTheDocument();
    const rangeInput = screen.getByRole("slider");
    expect(rangeInput).toBeInTheDocument();
  });

  it("renders select command with dropdown", () => {
    renderWithProviders(
      <GenericCommandsPanel
        {...baseProps}
        commands={[selectCommand]}
        currentPoints={{ mode: { value: "auto" } }}
      />,
    );

    expect(screen.getByText("Operating Mode")).toBeInTheDocument();
    // Check select element exists with options
    const selectEl = screen.getByRole("combobox");
    expect(selectEl).toBeInTheDocument();
  });

  it("shows 'no commands' message when commands list is empty", () => {
    renderWithProviders(
      <GenericCommandsPanel
        {...baseProps}
        commands={[]}
        currentPoints={{}}
      />,
    );

    expect(
      screen.getByText(/no hay comandos|no commands/i),
    ).toBeInTheDocument();
  });

  it("renders the panel title 'Comandos'", () => {
    renderWithProviders(
      <GenericCommandsPanel
        {...baseProps}
        commands={[toggleCommand]}
        currentPoints={{}}
      />,
    );

    // Default language is "es", so title is "Comandos"
    expect(screen.getByText("Comandos")).toBeInTheDocument();
  });
});
