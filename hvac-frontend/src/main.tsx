import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import HomeGlobal from "./pages/HomeGlobal/HomeGlobal";
import AppLayout from "@/components/layouts/AppLayout";
import HomePageHVAC from "./pages/HVAC/HomePage/HomepageHVAC";
import { WebSocketProvider } from "./providers/WebSocketProvider";
import AhuDetailTabs from "./pages/HVAC/AhuDetailPage/Tabs/AhuDetailTabs";
import DashboardHVAC from "@/pages/HVAC/DashboardHVAC/DashboardHVAC";
import AlarmsPage from "./pages/HVAC/Alarms/AlarmsPage";
import DashboardEjecutivoPage from "./pages/HVAC/DashboardEjecutivoPage/DashboardEjecutivoPage";
import { Toaster } from "sonner";
import AhuDetailView from "./pages/HVAC/DashboardEjecutivoPage/3DDetailPage/AhuDetailView";
import { routes } from "@/router/routes";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
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

              <Route
                path={routes.hvac.ejecutivo}
                element={<DashboardEjecutivoPage />}
              />

              <Route
                path={routes.hvac.ahuDetailPattern}
                element={<AhuDetailTabs />}
              />

              <Route
                path={routes.hvac.ahuDetail3DPattern}
                element={<AhuDetailView />}
              />
            </Routes>
          </AppLayout>
        </ThemeProvider>
      </WebSocketProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
