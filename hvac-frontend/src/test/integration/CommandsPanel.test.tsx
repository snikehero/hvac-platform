import { describe, it, expect } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandsPanel } from "@/components/CommandsPanel/CommandsPanel";
import { renderWithProviders } from "@/test/renderWithProviders";
import { createMockSocket } from "@/test/socketMock";
import type { CommandResult } from "@/types/command";

// =====================================================================
// Fan Controls
// =====================================================================
describe("CommandsPanel - Fan Controls", () => {
  it("renders Fan ON and OFF buttons", () => {
    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" />,
    );

    expect(screen.getByRole("button", { name: /^ON$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^OFF$/i })).toBeInTheDocument();
  });

  it("Fan ON button is disabled when currentFanStatus is 'ON'", () => {
    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" currentFanStatus="ON" />,
    );

    expect(screen.getByRole("button", { name: /^ON$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^OFF$/i })).not.toBeDisabled();
  });

  it("Fan OFF button is disabled when currentFanStatus is 'OFF'", () => {
    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" currentFanStatus="OFF" />,
    );

    expect(screen.getByRole("button", { name: /^OFF$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^ON$/i })).not.toBeDisabled();
  });

  it("clicking Fan ON emits 'command:execute' with correct payload", async () => {
    const { mockSocket } = createMockSocket();

    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" currentFanStatus="OFF" />,
      { telemetryValue: { socket: mockSocket } },
    );

    await userEvent.click(screen.getByRole("button", { name: /^ON$/i }));

    expect(mockSocket.emit).toHaveBeenCalledWith("command:execute", {
      plantId: "PLANT-A",
      stationId: "AHU-01",
      command: "fan_status",
      value: "ON",
    });
  });

  it("clicking Fan OFF emits 'command:execute' with correct payload", async () => {
    const { mockSocket } = createMockSocket();

    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" currentFanStatus="ON" />,
      { telemetryValue: { socket: mockSocket } },
    );

    // Fan ON is disabled (currentFanStatus=ON), click OFF
    await userEvent.click(screen.getByRole("button", { name: /^OFF$/i }));

    expect(mockSocket.emit).toHaveBeenCalledWith("command:execute", {
      plantId: "PLANT-A",
      stationId: "AHU-01",
      command: "fan_status",
      value: "OFF",
    });
  });

  it("both buttons are disabled while command is pending", async () => {
    const { mockSocket } = createMockSocket();
    // Don't trigger command:result so it stays pending

    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" currentFanStatus="OFF" />,
      { telemetryValue: { socket: mockSocket } },
    );

    await userEvent.click(screen.getByRole("button", { name: /^ON$/i }));

    // After click, both buttons should be disabled (pending state)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^ON$/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /^OFF$/i })).toBeDisabled();
    });
  });
});

// =====================================================================
// Command Status Badge
// =====================================================================
describe("CommandsPanel - Status Badge", () => {
  it("shows 'Success' badge after socket emits command:result with status SUCCESS", async () => {
    const { mockSocket, triggerEvent } = createMockSocket();

    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" currentFanStatus="OFF" />,
      { telemetryValue: { socket: mockSocket } },
    );

    await userEvent.click(screen.getByRole("button", { name: /^ON$/i }));

    const result: CommandResult = {
      commandId: "cmd-001",
      status: "SUCCESS",
      message: "Fan turned ON",
      timestamp: new Date().toISOString(),
    };

    act(() => {
      triggerEvent("command:result", result);
    });

    await waitFor(() => {
      expect(screen.getByText("Success")).toBeInTheDocument();
    });
  });

  it("shows 'Error' badge after socket emits command:result with status ERROR", async () => {
    const { mockSocket, triggerEvent } = createMockSocket();

    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" currentFanStatus="OFF" />,
      { telemetryValue: { socket: mockSocket } },
    );

    await userEvent.click(screen.getByRole("button", { name: /^ON$/i }));

    const result: CommandResult = {
      commandId: "cmd-001",
      status: "ERROR",
      message: "Command failed",
      timestamp: new Date().toISOString(),
    };

    act(() => {
      triggerEvent("command:result", result);
    });

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  it("shows 'Timeout' badge after socket emits command:result with status TIMEOUT", async () => {
    const { mockSocket, triggerEvent } = createMockSocket();

    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" currentFanStatus="OFF" />,
      { telemetryValue: { socket: mockSocket } },
    );

    await userEvent.click(screen.getByRole("button", { name: /^ON$/i }));

    const result: CommandResult = {
      commandId: "cmd-001",
      status: "TIMEOUT",
      message: "No response",
      timestamp: new Date().toISOString(),
    };

    act(() => {
      triggerEvent("command:result", result);
    });

    await waitFor(() => {
      expect(screen.getByText("Timeout")).toBeInTheDocument();
    });
  });
});

// =====================================================================
// Damper Control
// =====================================================================
describe("CommandsPanel - Damper Control", () => {
  it("renders the Set Damper button with the default value", () => {
    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" currentDamperPosition={75} />,
    );

    // currentDamperPosition=75, so initial slider value should be 75
    expect(screen.getByRole("button", { name: /Set Damper to 75%/i })).toBeInTheDocument();
  });

  it("Set Damper button emits 'command:execute' with damper_position command", async () => {
    const { mockSocket } = createMockSocket();

    renderWithProviders(
      <CommandsPanel plantId="PLANT-A" stationId="AHU-01" currentDamperPosition={75} />,
      { telemetryValue: { socket: mockSocket } },
    );

    await userEvent.click(screen.getByRole("button", { name: /Set Damper to 75%/i }));

    expect(mockSocket.emit).toHaveBeenCalledWith("command:execute", {
      plantId: "PLANT-A",
      stationId: "AHU-01",
      command: "damper_position",
      value: 75,
    });
  });
});
