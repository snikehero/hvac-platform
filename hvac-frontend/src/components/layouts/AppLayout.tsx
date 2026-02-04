import type { ReactNode } from "react"
import AppSidebar from "@/components/layouts/AppSidebar"
import AppHeader from "@/components/layouts/AppHeader"

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />

      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-muted/40 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
