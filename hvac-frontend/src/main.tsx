import "./index.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import AppLayout from "@/components/layouts/AppLayout"
import HomePage from "@/pages/Homepage"
import Dashboard from "@/components/Dashboard"
import { WebSocketProvider } from "./providers/WebSocketProvider"
ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <BrowserRouter>
    <WebSocketProvider>

      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />

        </Routes>
        </AppLayout>
        </WebSocketProvider>
    </BrowserRouter>
  </React.StrictMode>
)
