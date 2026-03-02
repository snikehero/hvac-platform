import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/renderWithProviders";
import ReportsPage from "@/pages/HVAC/Reports/ReportsPage";

vi.mock("@/api/historyApi", () => ({
  fetchTelemetryHistory: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 500, totalPages: 0 }),
  fetchEvents: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }),
  fetchAggregated: vi.fn().mockResolvedValue([]),
  fetchAuditLog: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }),
  fetchCommands: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }),
  postAuditEntry: vi.fn().mockResolvedValue({}),
}));

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", () => {
    renderWithProviders(<ReportsPage />);
    expect(screen.getByText(/Reports & Export|Reportes y Exportación/i)).toBeInTheDocument();
  });

  it("renders all 4 report template cards", () => {
    renderWithProviders(<ReportsPage />);
    expect(screen.getByText(/Daily Summary|Resumen Diario/i)).toBeInTheDocument();
    expect(screen.getByText(/Alarm Log|Registro de Alarmas/i)).toBeInTheDocument();
    expect(screen.getByText(/Energy Report|Reporte de Energía/i)).toBeInTheDocument();
    expect(screen.getByText(/AHU Performance|Rendimiento AHU/i)).toBeInTheDocument();
  });

  it("shows 'no preview' placeholder before generating", () => {
    renderWithProviders(<ReportsPage />);
    expect(screen.getByText(/Select a template|Selecciona una plantilla/i)).toBeInTheDocument();
  });

  it("selecting a template card marks it as active (ring class)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);
    const alarmCard = screen.getByText(/Alarm Log|Registro de Alarmas/i).closest("[class*='cursor-pointer']");
    if (alarmCard) {
      await user.click(alarmCard);
      expect(alarmCard.className).toContain("ring-2");
    }
  });

  it("clicking Generate calls the API", async () => {
    const { fetchEvents } = await import("@/api/historyApi");
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    // Select alarm-log template first so we call fetchEvents
    const alarmCard = screen.getByText(/Alarm Log|Registro de Alarmas/i).closest("[class*='cursor-pointer']");
    if (alarmCard) {
      await user.click(alarmCard);
    }

    const generateBtn = screen.getByRole("button", { name: /Generate Report|Generar Reporte/i });
    await user.click(generateBtn);

    await waitFor(() => {
      expect(fetchEvents).toHaveBeenCalledTimes(1);
    });
  });

  it("shows report preview after successful generation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    const generateBtn = screen.getByRole("button", { name: /Generate Report|Generar Reporte/i });
    await user.click(generateBtn);

    await waitFor(() => {
      // After generation, the "no preview" placeholder disappears
      expect(screen.queryByText(/Select a template|Selecciona una plantilla/i)).not.toBeInTheDocument();
    });
  });

  it("export buttons appear after report is generated", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    const generateBtn = screen.getByRole("button", { name: /Generate Report|Generar Reporte/i });
    await user.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Export CSV|Exportar CSV/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Export PDF|Exportar PDF/i })).toBeInTheDocument();
    });
  });
});
