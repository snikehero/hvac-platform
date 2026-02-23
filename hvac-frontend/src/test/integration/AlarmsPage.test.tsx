import { describe, it, expect } from "vitest";
import { screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AlarmsPage from "@/pages/HVAC/Alarms/AlarmsPage";
import { renderWithProviders } from "@/test/renderWithProviders";
import { makeAhu, makeAlarmAhu, makeWarningAhu } from "@/test/factories";

// AlarmsPage uses useTelemetry which requires connected = true AND
// ahuConnectionStatus showing each AHU as connected for counters to work
function makeConnectionStatus(ahus: ReturnType<typeof makeAhu>[]) {
  const status: Record<string, { isConnected: boolean; lastSeen: number }> = {};
  ahus.forEach((ahu) => {
    status[`${ahu.plantId}-${ahu.stationId}`] = {
      isConnected: true,
      lastSeen: Date.now(),
    };
  });
  return status;
}

// =====================================================================
// AHU Display
// =====================================================================
describe("AlarmsPage - AHU Display", () => {
  it("shows the page title", () => {
    renderWithProviders(<AlarmsPage />, {
      telemetryValue: { telemetry: [] },
    });

    // The page title is "Sistema de Alarmas" (default language = es)
    expect(screen.getByText("Sistema de Alarmas")).toBeInTheDocument();
  });

  it("shows an alarming AHU card when telemetry has ALARM status", () => {
    const ahu = makeAlarmAhu({ stationId: "AHU-ALARM-01" });
    renderWithProviders(<AlarmsPage />, {
      telemetryValue: {
        telemetry: [ahu],
        ahuConnectionStatus: makeConnectionStatus([ahu]),
      },
    });

    expect(screen.getByText("AHU-ALARM-01")).toBeInTheDocument();
    // Check the ALARM badge
    expect(screen.getByText("ALARM")).toBeInTheDocument();
  });

  it("shows a warning AHU card when telemetry has WARNING status", () => {
    const ahu = makeWarningAhu({ stationId: "AHU-WARN-01" });
    renderWithProviders(<AlarmsPage />, {
      telemetryValue: {
        telemetry: [ahu],
        ahuConnectionStatus: makeConnectionStatus([ahu]),
      },
    });

    expect(screen.getByText("AHU-WARN-01")).toBeInTheDocument();
    expect(screen.getByText("WARNING")).toBeInTheDocument();
  });

  it("does NOT show an AHU card when status is OK", () => {
    const ahu = makeAhu({ stationId: "AHU-OK-01" });
    renderWithProviders(<AlarmsPage />, {
      telemetryValue: {
        telemetry: [ahu],
        ahuConnectionStatus: makeConnectionStatus([ahu]),
      },
    });

    expect(screen.queryByText("AHU-OK-01")).not.toBeInTheDocument();
  });

  it("shows the 'all systems normal' message when no active alarms or warnings", () => {
    const ahu = makeAhu();
    renderWithProviders(<AlarmsPage />, {
      telemetryValue: {
        telemetry: [ahu],
        ahuConnectionStatus: makeConnectionStatus([ahu]),
      },
    });

    // "Todos los sistemas están operando normalmente" in Spanish
    expect(screen.getByText("Todos los sistemas están operando normalmente")).toBeInTheDocument();
  });
});

// =====================================================================
// Acknowledgment Flow
// =====================================================================
describe("AlarmsPage - Acknowledgment Flow", () => {
  it("clicking Ack button moves the card to the ACKNOWLEDGED tab", async () => {
    const ahu = makeAlarmAhu({ stationId: "AHU-ACK-01" });

    renderWithProviders(<AlarmsPage />, {
      telemetryValue: {
        telemetry: [ahu],
        ahuConnectionStatus: makeConnectionStatus([ahu]),
      },
    });

    // AHU should be in the active list initially
    expect(screen.getByText("AHU-ACK-01")).toBeInTheDocument();

    // Find and click the Ack button ("Reconocer" in Spanish)
    const ackButton = screen.getByRole("button", { name: /Reconocer/i });
    await userEvent.click(ackButton);

    // After ack, the card should disappear from the active (ALL) tab
    // since it's now acknowledged
    await waitFor(() => {
      // The card should be gone from active tab
      expect(screen.queryByText("AHU-ACK-01")).not.toBeInTheDocument();
    });
  });

  it("ACKNOWLEDGED tab shows the ack'd AHU after acknowledgment", async () => {
    const ahu = makeAlarmAhu({ stationId: "AHU-ACK-02" });

    renderWithProviders(<AlarmsPage />, {
      telemetryValue: {
        telemetry: [ahu],
        ahuConnectionStatus: makeConnectionStatus([ahu]),
      },
    });

    // Click Ack
    const ackButton = screen.getByRole("button", { name: /Reconocer/i });
    await userEvent.click(ackButton);

    // Switch to ACKNOWLEDGED tab
    const acknowledgedTab = screen.getByRole("tab", { name: /Reconocidas/i });
    await userEvent.click(acknowledgedTab);

    // The AHU should now appear in the ACKNOWLEDGED tab
    await waitFor(() => {
      expect(screen.getByText("AHU-ACK-02")).toBeInTheDocument();
    });
  });

  it("shows 'No hay alarmas reconocidas' empty state when ACKNOWLEDGED tab has nothing", async () => {
    renderWithProviders(<AlarmsPage />, {
      telemetryValue: { telemetry: [] },
    });

    const acknowledgedTab = screen.getByRole("tab", { name: /Reconocidas/i });
    await userEvent.click(acknowledgedTab);

    await waitFor(() => {
      expect(screen.getByText("No hay alarmas reconocidas")).toBeInTheDocument();
    });
  });
});

// =====================================================================
// Filter Tabs
// =====================================================================
describe("AlarmsPage - Filter Tabs", () => {
  it("ALARM tab shows only ALARM AHUs (not warnings)", async () => {
    const alarmAhu = makeAlarmAhu({ stationId: "AHU-ALARM-ONLY" });
    const warningAhu = makeWarningAhu({ stationId: "AHU-WARNING-ONLY" });

    renderWithProviders(<AlarmsPage />, {
      telemetryValue: {
        telemetry: [alarmAhu, warningAhu],
        ahuConnectionStatus: makeConnectionStatus([alarmAhu, warningAhu]),
      },
    });

    // Switch to ALARM tab
    const alarmTab = screen.getByRole("tab", { name: /Alarmas/i });
    await userEvent.click(alarmTab);

    await waitFor(() => {
      expect(screen.getByText("AHU-ALARM-ONLY")).toBeInTheDocument();
      expect(screen.queryByText("AHU-WARNING-ONLY")).not.toBeInTheDocument();
    });
  });

  it("WARNING tab shows only WARNING AHUs (not alarms)", async () => {
    const alarmAhu = makeAlarmAhu({ stationId: "AHU-ALARM-FILTERED" });
    const warningAhu = makeWarningAhu({ stationId: "AHU-WARNING-SHOWN" });

    renderWithProviders(<AlarmsPage />, {
      telemetryValue: {
        telemetry: [alarmAhu, warningAhu],
        ahuConnectionStatus: makeConnectionStatus([alarmAhu, warningAhu]),
      },
    });

    // Switch to WARNING tab
    const warningTab = screen.getByRole("tab", { name: /Warnings/i });
    await userEvent.click(warningTab);

    await waitFor(() => {
      expect(screen.getByText("AHU-WARNING-SHOWN")).toBeInTheDocument();
      expect(screen.queryByText("AHU-ALARM-FILTERED")).not.toBeInTheDocument();
    });
  });
});

// =====================================================================
// Search
// =====================================================================
describe("AlarmsPage - Search", () => {
  it("search by stationId filters the displayed AHU cards", async () => {
    const ahu1 = makeAlarmAhu({ stationId: "VENTILATOR-01" });
    const ahu2 = makeWarningAhu({ stationId: "COOLER-02" });

    renderWithProviders(<AlarmsPage />, {
      telemetryValue: {
        telemetry: [ahu1, ahu2],
        ahuConnectionStatus: makeConnectionStatus([ahu1, ahu2]),
      },
    });

    // Type in the search field
    const searchInput = screen.getByPlaceholderText(/Buscar AHU o planta/i);
    await userEvent.type(searchInput, "VENTILATOR");

    await waitFor(() => {
      expect(screen.getByText("VENTILATOR-01")).toBeInTheDocument();
      expect(screen.queryByText("COOLER-02")).not.toBeInTheDocument();
    });
  });

  it("empty search shows all active alarms", async () => {
    const ahu1 = makeAlarmAhu({ stationId: "UNIT-01" });
    const ahu2 = makeWarningAhu({ stationId: "UNIT-02" });

    renderWithProviders(<AlarmsPage />, {
      telemetryValue: {
        telemetry: [ahu1, ahu2],
        ahuConnectionStatus: makeConnectionStatus([ahu1, ahu2]),
      },
    });

    const searchInput = screen.getByPlaceholderText(/Buscar AHU o planta/i);
    await userEvent.type(searchInput, "UNIT");
    await userEvent.clear(searchInput);

    await waitFor(() => {
      expect(screen.getByText("UNIT-01")).toBeInTheDocument();
      expect(screen.getByText("UNIT-02")).toBeInTheDocument();
    });
  });
});
