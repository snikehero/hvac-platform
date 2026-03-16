import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { GlobalSettingsProvider } from "@/context/GlobalSettingsContext";
import { AckProvider } from "@/context/AckContext";
import { MachineTypeProvider } from "@/context/MachineTypeContext";
import { TelemetryProvider } from "@/providers/TelemetryProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Full provider tree for the application.
 * Extracted from main.tsx to improve HMR stability — provider changes
 * no longer force a full re-mount of the entire app.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <GlobalSettingsProvider>
        <AckProvider>
          <MachineTypeProvider>
            <TelemetryProvider>
              <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <Toaster position="top-right" richColors expand />
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </ThemeProvider>
            </TelemetryProvider>
          </MachineTypeProvider>
        </AckProvider>
      </GlobalSettingsProvider>
    </BrowserRouter>
  );
}
