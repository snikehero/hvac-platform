import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import HomeGlobal from "./pages/HomeGlobal/HomeGlobal";
import AppLayout from "@/components/layouts/AppLayout";
import HomePageHVAC from "./pages/HVAC/HomePage/HomepageHVAC";
import { WebSocketProvider } from "./providers/WebSocketProvider";
import DashboardHVAC from "@/pages/HVAC/DashboardHVAC/DashboardHVAC";
import AlarmsPage from "./pages/HVAC/Alarms/AlarmsPage";
import DashboardEjecutivoPage from "./pages/HVAC/DashboardEjecutivoPage/DashboardEjecutivoPage";
import { Toaster } from "sonner";
import AhuDetailView from "./pages/HVAC/DashboardEjecutivoPage/3DDetailPage/AhuDetailView";
import { routes } from "@/router/routes";
import AhuDetailPage from "./pages/HVAC/AhuDetailPage/AhuDetailContent";
import SettingsPage from "./pages/HVAC/Settings/SettingsPage";
import { SettingsProvider } from "@/context/SettingsContext";
import { AckProvider } from "@/context/AckContext";
import { MachineTypeProvider } from "@/context/MachineTypeContext";
import MachineDesignerListPage from "./pages/MachineDesigner/MachineDesignerListPage";
import MachineDesignerFormPage from "./pages/MachineDesigner/MachineDesignerFormPage";
import MachineDashboardPage from "./pages/Machine/MachineDashboardPage";
import MachineDetailPage from "./pages/Machine/MachineDetailPage";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AckProvider>
        <MachineTypeProvider>
        <WebSocketProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Toaster position="top-right" richColors expand />

            <AppLayout>
              <Routes>
                {/* ========================= */}
                {/* CORE - Plataforma         */}
                {/* ========================= */}
                <Route path="/" element={<HomeGlobal />} />

                {/* ========================= */}
                {/* HVAC MODULE               */}
                {/* ========================= */}
                <Route path={routes.hvac.home} element={<HomePageHVAC />} />

                <Route path={routes.hvac.dashboard} element={<DashboardHVAC />} />

                <Route path={routes.hvac.alarms} element={<AlarmsPage />} />

                <Route path={routes.hvac.settings} element={<SettingsPage />} />

                <Route
                  path={routes.hvac.ejecutivo}
                  element={<DashboardEjecutivoPage />}
                />

                <Route
                  path={routes.hvac.ahuDetailPattern}
                  element={<AhuDetailPage />}
                />

                <Route
                  path={routes.hvac.ahuDetail3DPattern}
                  element={<AhuDetailView />}
                />

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
                {/* GENERIC MACHINE DASHBOARDS*/}
                {/* ========================= */}
                <Route
                  path={routes.machine.dashboardPattern}
                  element={<MachineDashboardPage />}
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
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
