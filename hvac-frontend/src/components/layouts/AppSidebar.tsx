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
import { useTelemetry } from "@/hooks/useTelemetry";
import { useEffect, useState, useMemo } from "react";
import { useAhuHealth } from "@/hooks/useAhuHealth";
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
  const { telemetry, ahuConnectionStatus, totalAlarms, totalWarnings } = useTelemetry();
  const navigate = useNavigate();
  const getHealth = useAhuHealth();
  const { t } = useTranslation();
  const { machineTypes } = useMachineTypes();

  const totalUnifiedAlerts = totalAlarms + totalWarnings;

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

    const hvacCategory = {
      name: "HVAC",
      items: [
        { to: routes.hvac.home, label: t.nav.homeHvac, icon: Home },
        {
          to: routes.hvac.ejecutivo,
          label: t.nav.generalDashboard,
          icon: LayoutDashboard,
        },
        {
          to: routes.hvac.dashboard,
          label: t.nav.activeHvac,
          icon: AirVent,
        },
        {
          to: routes.hvac.alarms,
          label: t.nav.alarms,
          icon: Bell,
        },
        {
          to: routes.hvac.settings,
          label: t.nav.settings,
          icon: Settings,
        },
      ],
    };

    const dynamicCategories = machineTypes.map((mt) => ({
      name: mt.name,
      items: [
        {
          to: routes.machine.dashboard(mt.slug),
          label: `Dashboard`,
          icon: getIconComponent(mt.icon),
        },
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

    return [generalCategory, hvacCategory, ...dynamicCategories, designerCategory];
  }, [t, machineTypes]);

  const activeAlarms = useMemo(() => {
    return telemetry.reduce((acc, ahu) => {
      const key = `${ahu.plantId}-${ahu.stationId}`;
      const isConnected = ahuConnectionStatus[key]?.isConnected ?? false;

      // Don't count alarms from disconnected AHUs
      if (!isConnected) return acc;

      const health = getHealth(ahu);
      return acc + (health.status === "ALARM" ? 1 : 0);
    }, 0);
  }, [telemetry, ahuConnectionStatus, getHealth]);

  const [prevCount, setPrevCount] = useState(activeAlarms);

  useEffect(() => {
    if (activeAlarms !== prevCount) {
      setPrevCount(activeAlarms);
    }
  }, [activeAlarms, prevCount]);

  const [openCategories, setOpenCategories] = useState<string[]>([
    t.nav.generalSection ?? "General",
    "HVAC",
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
                        end={to === routes.hvac.home || to === routes.general.overview}
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
                            {to === routes.hvac.alarms && activeAlarms > 0 && (
                              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                                {activeAlarms}
                              </span>
                            )}
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
