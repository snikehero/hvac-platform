import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/renderWithProviders";
import AuditLogPage from "@/pages/HVAC/AuditLog/AuditLogPage";
import type { AuditRecord } from "@/types/history-api";
import * as historyApi from "@/api/historyApi";

// Must declare the mock factory without referencing outer variables (vi.mock is hoisted)
vi.mock("@/api/historyApi", () => ({
  fetchAuditLog: vi.fn(),
  fetchAggregated: vi.fn().mockResolvedValue([]),
  fetchTelemetryHistory: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }),
  fetchEvents: vi.fn().mockResolvedValue([]),
  fetchCommands: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }),
  postAuditEntry: vi.fn().mockResolvedValue({}),
}));

const mockRecords: AuditRecord[] = [
  {
    id: "1",
    actionType: "COMMAND_SENT",
    actor: "operator-1",
    details: { command: "fan_status", value: "ON" },
    plantId: "plant-1",
    ahuId: "ahu-1",
    timestamp: "2024-06-15T10:30:00Z",
    createdAt: "2024-06-15T10:30:00Z",
  },
  {
    id: "2",
    actionType: "ALARM_ACKNOWLEDGED",
    actor: "operator-2",
    plantId: "plant-1",
    ahuId: "ahu-2",
    timestamp: "2024-06-15T11:00:00Z",
    createdAt: "2024-06-15T11:00:00Z",
  },
];

const mockResponse = { data: mockRecords, total: 2, page: 1, pageSize: 25, totalPages: 1 };
const emptyResponse = { data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 };

describe("AuditLogPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(historyApi.fetchAuditLog).mockResolvedValue(mockResponse);
  });

  it("renders the page title", async () => {
    renderWithProviders(<AuditLogPage />);
    await waitFor(() => {
      expect(screen.getByText(/Audit Log|Registro de Auditoría/i)).toBeInTheDocument();
    });
  });

  it("calls fetchAuditLog on mount", async () => {
    renderWithProviders(<AuditLogPage />);
    await waitFor(() => {
      expect(historyApi.fetchAuditLog).toHaveBeenCalled();
    });
  });

  it("renders table rows for returned records", async () => {
    renderWithProviders(<AuditLogPage />);
    await waitFor(() => {
      expect(screen.getByText("operator-1")).toBeInTheDocument();
      expect(screen.getByText("operator-2")).toBeInTheDocument();
    });
  });

  it("renders action type badges", async () => {
    renderWithProviders(<AuditLogPage />);
    await waitFor(() => {
      expect(screen.getByText(/Command Sent|Comando Enviado/i)).toBeInTheDocument();
    });
  });

  it("renders plant badges", async () => {
    renderWithProviders(<AuditLogPage />);
    await waitFor(() => {
      expect(screen.getAllByText("plant-1").length).toBeGreaterThan(0);
    });
  });

  it("export CSV button is enabled when records exist", async () => {
    renderWithProviders(<AuditLogPage />);
    await waitFor(() => {
      const exportBtn = screen.getByRole("button", { name: /export csv|exportar csv/i });
      expect(exportBtn).not.toBeDisabled();
    });
  });

  it("shows 'no entries' message when API returns empty", async () => {
    vi.mocked(historyApi.fetchAuditLog).mockResolvedValue(emptyResponse);
    renderWithProviders(<AuditLogPage />);
    await waitFor(() => {
      expect(screen.getByText(/No audit entries|No se encontraron registros/i)).toBeInTheDocument();
    });
  });
});
