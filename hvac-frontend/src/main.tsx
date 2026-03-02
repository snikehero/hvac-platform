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
import { AuditProvider } from "@/context/AuditContext";
import { FloorPlanProvider } from "@/context/FloorPlanContext";
import EnergyPage from "./pages/HVAC/Energy/EnergyPage";
import AuditLogPage from "./pages/HVAC/AuditLog/AuditLogPage";
import ReportsPage from "./pages/HVAC/Reports/ReportsPage";
import FloorPlanPage from "./pages/HVAC/FloorPlan/FloorPlanPage";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AckProvider>
          <AuditProvider>
            <FloorPlanProvider>
            <WebSocketProvider>
              <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <Toaster position="top-right" richColors expand />

                <AppLayout>
                  <Routes>
                    {/* ========================= */}
                    {/* 🔹 CORE - Plataforma     */}
                    {/* ========================= */}
                    <Route path="/" element={<HomeGlobal />} />

                    {/* ========================= */}
                    {/* 🔹 HVAC MODULE            */}
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
                    {/* 🔹 PHASE 2 MODULES       */}
                    {/* ========================= */}
                    <Route path={routes.hvac.energy} element={<EnergyPage />} />
                    <Route path={routes.hvac.audit} element={<AuditLogPage />} />
                    <Route path={routes.hvac.reports} element={<ReportsPage />} />

                    {/* ========================= */}
                    {/* 🔹 PHASE 4 MODULES       */}
                    {/* ========================= */}
                    <Route path={routes.hvac.floorPlan} element={<FloorPlanPage />} />
                  </Routes>
                </AppLayout>
              </ThemeProvider>
            </WebSocketProvider>
            </FloorPlanProvider>
          </AuditProvider>
        </AckProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
