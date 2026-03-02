import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/renderWithProviders";
import EnergyPage from "@/pages/HVAC/Energy/EnergyPage";

// Mock the history API so we don't make real HTTP requests
vi.mock("@/api/historyApi", () => ({
  fetchAggregated: vi.fn().mockResolvedValue([]),
  fetchTelemetryHistory: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }),
  fetchEvents: vi.fn().mockResolvedValue([]),
  fetchAuditLog: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }),
  fetchCommands: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }),
  postAuditEntry: vi.fn().mockResolvedValue({}),
}));

describe("EnergyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", async () => {
    renderWithProviders(<EnergyPage />);
    // Wait for async data fetch to settle
    await waitFor(() => {
      expect(screen.getByText(/Energy Analytics|Analítica Energética/i)).toBeInTheDocument();
    });
  });

  it("shows period selector with options", async () => {
    renderWithProviders(<EnergyPage />);
    await waitFor(() => {
      // The select trigger should exist
      expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0);
    });
  });

  it("renders aggregation tabs (hourly / daily)", async () => {
    renderWithProviders(<EnergyPage />);
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /hourly|hora/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /daily|diario/i })).toBeInTheDocument();
    });
  });

  it("shows chart-type tabs (bar / line)", async () => {
    renderWithProviders(<EnergyPage />);
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /bar/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /line/i })).toBeInTheDocument();
    });
  });

  it("shows 'no data' message in chart when API returns empty", async () => {
    renderWithProviders(<EnergyPage />);
    await waitFor(() => {
      expect(screen.getByText(/no power data|sin datos de energía/i)).toBeInTheDocument();
    });
  });

  it("calls fetchAggregated on mount", async () => {
    const { fetchAggregated } = await import("@/api/historyApi");
    renderWithProviders(<EnergyPage />);
    await waitFor(() => {
      expect(fetchAggregated).toHaveBeenCalled();
    });
  });

  it("refresh button triggers a new fetch", async () => {
    const { fetchAggregated } = await import("@/api/historyApi");
    const user = userEvent.setup();
    renderWithProviders(<EnergyPage />);
    await waitFor(() => expect(fetchAggregated).toHaveBeenCalledTimes(2)); // initial call (current + previous)

    const refreshBtn = screen.getByTitle(/refresh/i);
    await user.click(refreshBtn);

    await waitFor(() => {
      expect(fetchAggregated).toHaveBeenCalledTimes(4); // 2 more calls
    });
  });
});
