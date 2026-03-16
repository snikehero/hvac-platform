import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import HomeGlobal from "./pages/HomeGlobal/HomeGlobal";
import AppLayout from "@/components/layouts/AppLayout";
import { WebSocketProvider } from "./providers/WebSocketProvider";
import { Toaster } from "sonner";
import { routes } from "@/router/routes";
import { GlobalSettingsProvider } from "@/context/GlobalSettingsContext";
import { AckProvider } from "@/context/AckContext";
import { MachineTypeProvider } from "@/context/MachineTypeContext";
import MachineDesignerListPage from "./pages/MachineDesigner/MachineDesignerListPage";
import MachineDesignerFormPage from "./pages/MachineDesigner/MachineDesignerFormPage";
import MachineHomePage from "./pages/Machine/MachineHomePage";
import MachineDashboardPage from "./pages/Machine/MachineDashboardPage";
import MachineDetailPage from "./pages/Machine/MachineDetailPage";
import MachineSettingsPage from "./pages/Machine/MachineSettingsPage";
import MachineAlarmsPage from "./pages/Machine/MachineAlarmsPage";
import UnifiedAlarmsPage from "./pages/Alarms/UnifiedAlarmsPage";
import ExecutiveDashboardPage from "./pages/Machine/Executive/ExecutiveDashboardPage";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalSettingsProvider>
        <AckProvider>
        <MachineTypeProvider>
        <WebSocketProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Toaster position="top-right" richColors expand />

            <AppLayout>
              <Routes>
                {/* ========================= */}
                {/* CORE - Platform           */}
                {/* ========================= */}
                <Route path="/" element={<HomeGlobal />} />
                <Route path={routes.general.alarms} element={<UnifiedAlarmsPage />} />

                {/* ========================= */}
                {/* HVAC LEGACY REDIRECTS     */}
                {/* ========================= */}
                <Route path="/hvac" element={<Navigate to="/machines/hvac" replace />} />
                <Route path="/hvac/dashboard" element={<Navigate to="/machines/hvac/dashboard" replace />} />
                <Route path="/hvac/alarms" element={<Navigate to="/machines/hvac/alarms" replace />} />
                <Route path="/hvac/settings" element={<Navigate to="/machines/hvac/settings" replace />} />
                <Route path="/hvac/ejecutivo" element={<Navigate to="/machines/hvac/executive" replace />} />
                <Route path="/hvac/plants/:plantId/ahus/:ahuId" element={<Navigate to="/machines/hvac" replace />} />
                <Route path="/hvac/plants/:plantId/ahus/:ahuId/detail" element={<Navigate to="/machines/hvac" replace />} />

                {/* ========================= */}
                {/* MACHINE DESIGNER          */}
                {/* ========================= */}
                <Route
                  path={routes.machineDesigner.list}
                  element={<MachineDesignerListPage />}
                />
                <Route
                  path={routes.machineDesigner.create}
                  element={<MachineDesignerFormPage />}
                />
                <Route
                  path={routes.machineDesigner.editPattern}
                  element={<MachineDesignerFormPage />}
                />

                {/* ========================= */}
                {/* GENERIC MACHINE PAGES     */}
                {/* ========================= */}
                <Route
                  path={routes.machine.homePattern}
                  element={<MachineHomePage />}
                />
                <Route
                  path={routes.machine.dashboardPattern}
                  element={<MachineDashboardPage />}
                />
                <Route
                  path={routes.machine.executivePattern}
                  element={<ExecutiveDashboardPage />}
                />
                <Route
                  path={routes.machine.alarmsPattern}
                  element={<MachineAlarmsPage />}
                />
                <Route
                  path={routes.machine.settingsPattern}
                  element={<MachineSettingsPage />}
                />
                <Route
                  path={routes.machine.detailPattern}
                  element={<MachineDetailPage />}
                />
              </Routes>
            </AppLayout>
          </ThemeProvider>
        </WebSocketProvider>
        </MachineTypeProvider>
        </AckProvider>
      </GlobalSettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
