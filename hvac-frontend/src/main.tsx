import "./index.css";

import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayoutWrapper } from "@/components/layouts/AppLayoutWrapper";
import { routes } from "@/router/routes";
import { Providers } from "./Providers";

// Eagerly loaded (critical path)
import HomeGlobal from "./pages/HomeGlobal/HomeGlobal";

// Lazy loaded pages (code-split)
const MachineDesignerListPage = lazy(() => import("./pages/MachineDesigner/MachineDesignerListPage"));
const MachineDesignerFormPage = lazy(() => import("./pages/MachineDesigner/MachineDesignerFormPage"));
const MachineHomePage = lazy(() => import("./pages/Machine/MachineHomePage"));
const MachineDashboardPage = lazy(() => import("./pages/Machine/MachineDashboardPage"));
const MachineDetailPage = lazy(() => import("./pages/Machine/MachineDetailPage"));
const MachineSettingsPage = lazy(() => import("./pages/Machine/MachineSettingsPage"));
const MachineAlarmsPage = lazy(() => import("./pages/Machine/MachineAlarmsPage"));
const UnifiedAlarmsPage = lazy(() => import("./pages/Alarms/UnifiedAlarmsPage"));
const ExecutiveDashboardPage = lazy(() => import("./pages/Machine/Executive/ExecutiveDashboardPage"));
const AnalyticsDashboardPage = lazy(() => import("./pages/Machine/Analytics/AnalyticsDashboardPage"));
const KioskPage = lazy(() => import("./pages/Kiosk/KioskPage"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Providers>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* ========================= */}
          {/* KIOSK — no sidebar/header */}
          {/* ========================= */}
          <Route path={routes.kiosk.pattern} element={<KioskPage />} />

          {/* ========================= */}
          {/* ALL OTHER ROUTES w/ layout*/}
          {/* ========================= */}
          <Route element={<AppLayoutWrapper />}>
            {/* Core */}
            <Route path="/" element={<HomeGlobal />} />
            <Route path={routes.general.alarms} element={<UnifiedAlarmsPage />} />

            {/* HVAC Legacy Redirects */}
            <Route path="/hvac" element={<Navigate to="/machines/hvac" replace />} />
            <Route path="/hvac/dashboard" element={<Navigate to="/machines/hvac/dashboard" replace />} />
            <Route path="/hvac/alarms" element={<Navigate to="/machines/hvac/alarms" replace />} />
            <Route path="/hvac/settings" element={<Navigate to="/machines/hvac/settings" replace />} />
            <Route path="/hvac/ejecutivo" element={<Navigate to="/machines/hvac/executive" replace />} />
            <Route path="/hvac/plants/:plantId/ahus/:ahuId" element={<Navigate to="/machines/hvac" replace />} />
            <Route path="/hvac/plants/:plantId/ahus/:ahuId/detail" element={<Navigate to="/machines/hvac" replace />} />

            {/* Machine Designer */}
            <Route path={routes.machineDesigner.list} element={<MachineDesignerListPage />} />
            <Route path={routes.machineDesigner.create} element={<MachineDesignerFormPage />} />
            <Route path={routes.machineDesigner.editPattern} element={<MachineDesignerFormPage />} />

            {/* Generic Machine Pages */}
            <Route path={routes.machine.homePattern} element={<MachineHomePage />} />
            <Route path={routes.machine.dashboardPattern} element={<MachineDashboardPage />} />
            <Route path={routes.machine.executivePattern} element={<ExecutiveDashboardPage />} />
            <Route path={routes.machine.analyticsPattern} element={<AnalyticsDashboardPage />} />
            <Route path={routes.machine.alarmsPattern} element={<MachineAlarmsPage />} />
            <Route path={routes.machine.settingsPattern} element={<MachineSettingsPage />} />
            <Route path={routes.machine.detailPattern} element={<MachineDetailPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Providers>
  </React.StrictMode>,
);
