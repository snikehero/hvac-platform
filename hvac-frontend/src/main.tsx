import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

import AppLayout from "@/components/layouts/AppLayout";
import HomePage from "./pages/HomePage/Homepage";
import { WebSocketProvider } from "./providers/WebSocketProvider";
import AhuDetailTabs from "./pages/Tabs/AhuDetailTabs";
import DashboardHVAC from "@/pages/DashboardHVAC/DashboardHVAC";
import AlarmsPage from "./pages/Alarms/AlarmsPage";
import DashboardOverviewPage from "./pages/Dashboard/DashboardOverviewPage";
//import FanViewerPage from "./pages/Dashboard/3DDetailPage/FanViewerPage";
import AhuDetailView from "./pages/Dashboard/3DDetailPage/AhuDetailView";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <WebSocketProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboardHVAC" element={<DashboardHVAC />} />
              <Route
                path="/plants/:plantId/ahus/:ahuId"
                element={<AhuDetailTabs />}
              />
              <Route
                  path="/plants/:plantId/ahus/:ahuId/detail"
                element={<AhuDetailView/>}
              />
              <Route path="/alarms" element={<AlarmsPage />} />
              <Route path="/dashboards" element={<DashboardOverviewPage />} />
              {/* <Route path ="/fan" element = {<FanViewerPage/>}/> */}
            </Routes>
          </AppLayout>
        </ThemeProvider>
      </WebSocketProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
