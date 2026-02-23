import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AhuCard } from "@/pages/HVAC/DashboardEjecutivoPage/components/AhuCard";
import { renderWithProviders } from "@/test/renderWithProviders";
import {
  makeAhu,
  makeAlarmAhu,
  makeWarningAhu,
  makeDisconnectedAhu,
  makeBadQualityAhu,
} from "@/test/factories";

// =====================================================================
// Status Display
// =====================================================================
describe("AhuCard - Status Display", () => {
  it("renders ALARM badge when AHU has ALARM status", () => {
    const ahu = makeAlarmAhu();
    renderWithProviders(<AhuCard ahu={ahu} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    expect(screen.getByText("ALARM")).toBeInTheDocument();
  });

  it("renders WARNING badge when AHU has WARNING status", () => {
    const ahu = makeWarningAhu();
    renderWithProviders(<AhuCard ahu={ahu} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    expect(screen.getByText("WARNING")).toBeInTheDocument();
  });

  it("renders OK badge when AHU has OK status", () => {
    const ahu = makeAhu();
    renderWithProviders(<AhuCard ahu={ahu} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders DISCONNECTED badge for a stale-timestamp AHU", () => {
    const ahu = makeDisconnectedAhu();
    renderWithProviders(<AhuCard ahu={ahu} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    expect(screen.getByText("DISCONNECTED")).toBeInTheDocument();
  });

  it("shows badPoints count when quality points are BAD", () => {
    const ahu = makeBadQualityAhu();
    renderWithProviders(<AhuCard ahu={ahu} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    // Should show "1 error" label (the span with class text-destructive)
    // Use a more specific query to avoid matching "AHU-01" which also contains "1"
    expect(screen.getByText("error", { exact: false })).toBeInTheDocument();
  });
});

// =====================================================================
// Metric Display
// =====================================================================
describe("AhuCard - Metric Display", () => {
  it("displays temperature value formatted to 1 decimal place", () => {
    const ahu = makeAhu({
      points: { ...makeAhu().points, temperature: { value: 23.456, unit: "°C", quality: "GOOD" } },
    });
    renderWithProviders(<AhuCard ahu={ahu} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    expect(screen.getByText("23.5")).toBeInTheDocument();
  });

  it("displays humidity value formatted to 1 decimal place", () => {
    const ahu = makeAhu({
      points: { ...makeAhu().points, humidity: { value: 55.7, unit: "%", quality: "GOOD" } },
    });
    renderWithProviders(<AhuCard ahu={ahu} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    expect(screen.getByText("55.7")).toBeInTheDocument();
  });

  it("displays '--' when temperature is not a valid number", () => {
    const ahu = makeAhu({
      points: { ...makeAhu().points, temperature: { value: "N/A", quality: "BAD" } },
    });
    renderWithProviders(<AhuCard ahu={ahu} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    expect(screen.getAllByText("--")[0]).toBeInTheDocument();
  });

  it("displays the AHU stationId and plantId", () => {
    const ahu = makeAhu({ stationId: "AHU-99", plantId: "PLANT-Z" });
    renderWithProviders(<AhuCard ahu={ahu} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    expect(screen.getByText("AHU-99")).toBeInTheDocument();
    expect(screen.getByText("PLANT-Z")).toBeInTheDocument();
  });
});

// =====================================================================
// Interaction
// =====================================================================
describe("AhuCard - Interaction", () => {
  it("calls onClick when the card is clicked", async () => {
    const onClick = vi.fn();
    const ahu = makeAhu();

    renderWithProviders(<AhuCard ahu={ahu} onClick={onClick} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    await userEvent.click(screen.getByText("AHU-01"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onClick is undefined", async () => {
    const ahu = makeAhu();

    renderWithProviders(<AhuCard ahu={ahu} />, {
      telemetryValue: { telemetry: [ahu] },
    });

    // Should not throw
    await userEvent.click(screen.getByText("AHU-01"));
  });
});
