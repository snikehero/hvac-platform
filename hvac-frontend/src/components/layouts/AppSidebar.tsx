/* eslint-disable react-hooks/set-state-in-effect */
import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, Bell, Settings, AirVent } from "lucide-react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboards", label: "DashboardOverviewPage", icon: LayoutDashboard },
  { to: "/dashboardHVAC", label: "HVAC", icon: AirVent },
  { to: "/alarms", label: "Alarmas", icon: Bell },
  { to: "/settings", label: "Configuración", icon: Settings },
];

export default function AppSidebar() {
  const { telemetry } = useTelemetry();

  // Contador de alarmas activas
  const activeAlarms = telemetry.reduce((acc, ahu) => {
    return acc + (ahu.points.status?.value === "ALARM" ? 1 : 0);
  }, 0);

  // Estado para trigger de animación
  const [animate, setAnimate] = useState(false);
  const [prevCount, setPrevCount] = useState(activeAlarms);

  useEffect(() => {
    if (activeAlarms !== prevCount) {
      setAnimate(true);
      setPrevCount(activeAlarms);
      const timer = setTimeout(() => setAnimate(false), 300); // duración animación
      return () => clearTimeout(timer);
    }
  }, [activeAlarms, prevCount]);

  return (
    <aside className="w-64 bg-background border-r">
      <div className="p-4 font-bold text-lg">FireIIOT Platform</div>

      <nav className="flex flex-col gap-1 px-2">
        {links.map(({ to, label, icon: Icon }) => {
          const isAlarmLink = to === "/alarms";
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition
                 ${isActive ? "bg-muted font-medium" : "hover:bg-muted"}`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>

              {isAlarmLink && activeAlarms > 0 && (
                <Badge
                  variant="destructive"
                  className={`ml-auto transition-transform duration-300 ${
                    animate ? "animate-pulse" : ""
                  }`}
                >
                  {activeAlarms}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
