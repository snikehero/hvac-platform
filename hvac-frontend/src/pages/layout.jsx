// src/app/layout.jsx
import AppSidebar from "@/components/layout/AppSidebar"
import AppHeader from "@/components/layout/AppHeader"

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  )
}
