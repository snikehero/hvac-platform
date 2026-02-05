import { NavLink } from "react-router-dom"
import { Home, LayoutDashboard, Bell, Settings, AirVent } from "lucide-react"

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboards", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboardHVAC", label: "HVAC",  icon: AirVent},
  { to: "/alarms", label: "Alarmas", icon: Bell },
  { to: "/settings", label: "Configuración", icon: Settings },
]

export default function AppSidebar() {
  return (
    <aside className="w-64 bg-background border-r">
      <div className="p-4 font-bold text-lg">
        FireIIOT Platform
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition
               ${isActive ? "bg-muted font-medium" : "hover:bg-muted"}`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
