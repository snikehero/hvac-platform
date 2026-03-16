/* eslint-disable react-hooks/set-state-in-effect */
import { NavLink } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Bell,
  Settings,
  AirVent,
  ChevronDown,
  Cpu,
  Wrench,
  Cog,
  Gauge,
  Zap,
  Thermometer,
  Fan,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useMachineTelemetry } from "@/hooks/useMachineTelemetry";
import { useState, useMemo } from "react";
import { routes } from "@/router/routes";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useMachineTypes } from "@/context/MachineTypeContext";

/** Map of icon names to lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  Cpu,
  Wrench,
  Cog,
  Gauge,
  Zap,
  Thermometer,
  Fan,
  Activity,
  AirVent,
  Settings,
  LayoutDashboard,
};

function getIconComponent(iconName?: string): LucideIcon {
  if (!iconName) return Cpu;
  return ICON_MAP[iconName] ?? Cpu;
}

export default function AppSidebar() {
  const { deviceActiveCounts } = useMachineTelemetry();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { machineTypes } = useMachineTypes();

  // Total unified alerts across all machine types
  const totalUnifiedAlerts = useMemo(() => {
    let total = 0;
    for (const val of Object.values(deviceActiveCounts)) {
      total += val.alarms + val.warnings;
    }
    return total;
  }, [deviceActiveCounts]);

  // Build dynamic categories from machine types
  const categories = useMemo(() => {
    const generalCategory = {
      name: t.nav.generalSection ?? "General",
      items: [
        { to: routes.general.overview, label: t.nav.overview ?? "Overview", icon: Home },
        {
          to: routes.general.alarms,
          label: t.nav.unifiedAlarms ?? "Alarms",
          icon: Bell,
        },
      ],
    };

    const dynamicCategories = machineTypes.map((mt) => ({
      name: mt.name,
      items: [
        { to: routes.machine.home(mt.slug), label: t.nav.home ?? "Home", icon: Home },
        {
          to: routes.machine.dashboard(mt.slug),
          label: t.machineDashboard?.dashboard ?? "Dashboard",
          icon: getIconComponent(mt.icon),
        },
        { to: routes.machine.alarms(mt.slug), label: t.nav.alarms ?? "Alarms", icon: Bell },
        { to: routes.machine.settings(mt.slug), label: t.nav.settings ?? "Settings", icon: Settings },
      ],
    }));

    const designerCategory = {
      name: t.machineDesigner?.title ?? "Machine Designer",
      items: [
        {
          to: routes.machineDesigner.list,
          label: t.machineDesigner?.manage ?? "Manage Types",
          icon: Wrench,
        },
      ],
    };

    return [generalCategory, ...dynamicCategories, designerCategory];
  }, [t, machineTypes]);

  // Per-machine-type alarm counts
  const machineTypeAlarmCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const mt of machineTypes) {
      let total = 0;
      for (const [key, val] of Object.entries(deviceActiveCounts)) {
        if (key.startsWith(`${mt.slug}-`)) {
          total += val.alarms + val.warnings;
        }
      }
      counts[mt.slug] = total;
    }
    return counts;
  }, [machineTypes, deviceActiveCounts]);

  const [openCategories, setOpenCategories] = useState<string[]>([
    t.nav.generalSection ?? "General",
  ]);

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  };

  return (
    <aside className="w-64 border-r border-border bg-background">
      <div
        onClick={() => navigate(routes.home)}
        className="p-4 text-xl font-semibold tracking-tight cursor-pointer hover:text-primary transition-colors"
      >
        Fire<span className="text-red-500">IIOT</span>
      </div>

      <div className="h-px bg-border" />

      <nav className="flex flex-col gap-2 px-2">
        {categories.map((category) => {
          const isOpen = openCategories.includes(category.name);

          return (
            <div key={category.name}>
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition"
              >
                {category.name}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-1 pt-1">
                  {category.items.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground italic">
                      {t.nav.comingSoon}
                    </div>
                  ) : (
                    category.items.map(({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end
                        className={({ isActive }) =>
                          `relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200
     ${
       isActive
         ? "bg-muted font-medium text-primary"
         : "text-muted-foreground hover:bg-muted hover:text-foreground"
     }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary" />
                            )}
                            <Icon
                              className={`h-4 w-4 transition-colors ${
                                isActive ? "text-primary" : ""
                              }`}
                            />
                            <span className="flex-1">{label}</span>

                            {to === routes.general.alarms && totalUnifiedAlerts > 0 && (
                              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                                {totalUnifiedAlerts}
                              </span>
                            )}
                            {machineTypes.map((mt) => {
                              const alarmRoute = routes.machine.alarms(mt.slug);
                              const count = machineTypeAlarmCounts[mt.slug] ?? 0;
                              return to === alarmRoute && count > 0 ? (
                                <span key={mt.slug} className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                                  {count}
                                </span>
                              ) : null;
                            })}
                          </>
                        )}
                      </NavLink>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
