import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GlobalSettingsProvider } from "@/context/GlobalSettingsContext";
import { AckProvider } from "@/context/AckContext";
import { TelemetryContext } from "@/providers/WebSocketProvider";
import type { Socket } from "socket.io-client";
import type { DeviceConnectionStatus } from "@/hooks/useDeviceConnectivity";
import type { MachineTelemetry } from "@/types/machine-type";
import type { DeviceEvent } from "@/types/device-event";
import type { DeviceHistoryData } from "@/hooks/useDeviceHistoryManagement";
import type { HistoryPoint } from "@/types/history";

interface TelemetryContextValue {
  connected: boolean;
  socket: Socket | null;
  machineTelemetry: Record<string, MachineTelemetry[]>;
  machineConnectionStatus: Record<string, DeviceConnectionStatus>;
  isMachineConnected: (machineKey: string) => boolean;
  deviceEvents: DeviceEvent[];
  deviceActiveCounts: Record<string, { alarms: number; warnings: number }>;
  totalAlarms: number;
  totalWarnings: number;
  machineHistory: DeviceHistoryData;
  getInstanceHistory: (machineType: string, plantId: string, stationId: string) => Record<string, HistoryPoint[]>;
}

const defaultTelemetryContext: TelemetryContextValue = {
  connected: true,
  socket: null,
  machineTelemetry: {},
  machineConnectionStatus: {},
  isMachineConnected: () => true,
  deviceEvents: [],
  deviceActiveCounts: {},
  totalAlarms: 0,
  totalWarnings: 0,
  machineHistory: {},
  getInstanceHistory: () => ({}),
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
      <GlobalSettingsProvider>
        <AckProvider>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <TelemetryContext.Provider value={contextValue as any}>
            {ui}
          </TelemetryContext.Provider>
        </AckProvider>
      </GlobalSettingsProvider>
    </MemoryRouter>,
  );
}
