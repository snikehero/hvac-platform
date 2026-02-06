import "./index.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import AppLayout from "@/components/layouts/AppLayout"
import HomePage from "@/pages/Homepage"
import { WebSocketProvider } from "./providers/WebSocketProvider"
import AhuDetailPage from "./pages/AhuDetailPage/AhuDetailPage"
import DashboardHVAC from "@/pages/DashboardHVAC"
ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <BrowserRouter>
    <WebSocketProvider>

      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboardHVAC" element={<DashboardHVAC />} />
          <Route path="/plants/:plantId/ahus/:ahuId" element={<AhuDetailPage />}
/>
        </Routes>
        </AppLayout>
        </WebSocketProvider>
    </BrowserRouter>
  </React.StrictMode>
)
