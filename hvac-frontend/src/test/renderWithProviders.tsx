import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SettingsProvider } from "@/context/SettingsContext";
import { AckProvider } from "@/context/AckContext";
import { AuditProvider } from "@/context/AuditContext";
import { TelemetryContext } from "@/providers/WebSocketProvider";
import type { HvacTelemetry } from "@/types/telemetry";
import type { HvacEvent } from "@/types/event";
import type { HistoryPoint } from "@/types/history";
import type { Socket } from "socket.io-client";

interface AhuConnectionStatus {
  isConnected: boolean;
  lastSeen: number;
}

interface TelemetryContextValue {
  telemetry: HvacTelemetry[];
  events: HvacEvent[];
  history: Record<string, { temperature: HistoryPoint[]; humidity: HistoryPoint[] }>;
  activeCounts: Record<string, { alarms: number; warnings: number }>;
  connected: boolean;
  ahuConnectionStatus: Record<string, AhuConnectionStatus>;
  isAhuConnected: (plantId: string, stationId: string) => boolean;
  setEvents: React.Dispatch<React.SetStateAction<HvacEvent[]>>;
  socket: Socket | null;
}

const defaultTelemetryContext: TelemetryContextValue = {
  telemetry: [],
  events: [],
  history: {},
  activeCounts: {},
  connected: true,
  ahuConnectionStatus: {},
  isAhuConnected: () => true,
  setEvents: () => {},
  socket: null,
};

interface RenderOptions {
  telemetryValue?: Partial<TelemetryContextValue>;
  initialRoute?: string;
}

/**
 * Renders a component wrapped in all required providers.
 * Injects TelemetryContext directly (bypassing WebSocketProvider)
 * so tests don't attempt to open a real socket.io connection.
 */
export function renderWithProviders(
  ui: ReactNode,
  { telemetryValue = {}, initialRoute = "/" }: RenderOptions = {},
) {
  const contextValue: TelemetryContextValue = {
    ...defaultTelemetryContext,
    ...telemetryValue,
  };

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <SettingsProvider>
        <AckProvider>
          <AuditProvider>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <TelemetryContext.Provider value={contextValue as any}>
              {ui}
            </TelemetryContext.Provider>
          </AuditProvider>
        </AckProvider>
      </SettingsProvider>
    </MemoryRouter>,
  );
}
