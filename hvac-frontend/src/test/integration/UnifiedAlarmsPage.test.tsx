import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/renderWithProviders";
import { makeMachineInstance, makeAlarmInstance, makeWarningInstance, makeMachineType } from "@/test/factories";
import UnifiedAlarmsPage from "@/pages/Alarms/UnifiedAlarmsPage";

// Mock useMachineTypes to avoid API calls
vi.mock("@/context/MachineTypeContext", () => ({
  useMachineTypes: () => ({
    machineTypes: [makeMachineType()],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

beforeEach(() => {
  localStorage.clear();
});

function connectedStatus(keys: string[]) {
  const status: Record<string, { isConnected: boolean; lastSeen: number }> = {};
  for (const key of keys) {
    status[key] = { isConnected: true, lastSeen: Date.now() };
  }
  return status;
}

describe("UnifiedAlarmsPage", () => {
  it("renders the page title", () => {
    renderWithProviders(<UnifiedAlarmsPage />, {
      telemetryValue: {
        machineTelemetry: { hvac: [makeMachineInstance()] },
        isMachineConnected: () => true,
        machineConnectionStatus: connectedStatus(["PLANT-A-AHU-01"]),
      },
    });

    expect(
      screen.getByText("Sistema de Alarmas Unificado"),
    ).toBeInTheDocument();
  });

  it("shows 'all systems normal' when all instances are OK", () => {
    renderWithProviders(<UnifiedAlarmsPage />, {
      telemetryValue: {
        machineTelemetry: { hvac: [makeMachineInstance()] },
        isMachineConnected: () => true,
        machineConnectionStatus: connectedStatus(["PLANT-A-AHU-01"]),
      },
    });

    expect(
      screen.getByText(/todos los sistemas|all systems/i),
    ).toBeInTheDocument();
  });

  it("renders alarm cards for instances in ALARM state", () => {
    renderWithProviders(<UnifiedAlarmsPage />, {
      telemetryValue: {
        machineTelemetry: {
          hvac: [makeAlarmInstance({ stationId: "AHU-ALARM" })],
        },
        isMachineConnected: () => true,
        machineConnectionStatus: connectedStatus(["PLANT-A-AHU-ALARM"]),
      },
    });

    expect(screen.getByText("AHU-ALARM")).toBeInTheDocument();
  });

  it("renders warning cards for instances in WARNING state", () => {
    renderWithProviders(<UnifiedAlarmsPage />, {
      telemetryValue: {
        machineTelemetry: {
          hvac: [makeWarningInstance({ stationId: "AHU-WARN" })],
        },
        isMachineConnected: () => true,
        machineConnectionStatus: connectedStatus(["PLANT-A-AHU-WARN"]),
      },
    });

    expect(screen.getByText("AHU-WARN")).toBeInTheDocument();
  });

  it("shows both alarm and warning instances, hides OK instances", () => {
    renderWithProviders(<UnifiedAlarmsPage />, {
      telemetryValue: {
        machineTelemetry: {
          hvac: [
            makeAlarmInstance({ stationId: "ALARM-01" }),
            makeWarningInstance({ stationId: "WARN-01" }),
            makeMachineInstance({ stationId: "OK-01" }),
          ],
        },
        isMachineConnected: () => true,
        machineConnectionStatus: connectedStatus([
          "PLANT-A-ALARM-01",
          "PLANT-A-WARN-01",
          "PLANT-A-OK-01",
        ]),
      },
    });

    expect(screen.getByText("ALARM-01")).toBeInTheDocument();
    expect(screen.getByText("WARN-01")).toBeInTheDocument();
    // OK instance should NOT appear in the alarm list
    expect(screen.queryByText("OK-01")).not.toBeInTheDocument();
  });
});
