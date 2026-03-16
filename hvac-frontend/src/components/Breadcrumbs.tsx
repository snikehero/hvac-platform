import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { routes } from "@/router/routes";

interface Segment {
  label: string;
  href?: string;
}

function useSegments(): Segment[] {
  const location = useLocation();
  const { machineType, plantId, stationId } = useParams<{
    machineType?: string;
    plantId?: string;
    stationId?: string;
  }>();
  const { machineTypes } = useMachineTypes();

  return useMemo(() => {
    const path = location.pathname;
    const home: Segment = { label: "FireIIOT", href: "/" };

    // /alarms
    if (path === "/alarms") {
      return [home, { label: "Alarms" }];
    }

    // /machine-designer/*
    if (path.startsWith("/machine-designer")) {
      const base: Segment = { label: "Machine Designer", href: routes.machineDesigner.list };
      if (path.endsWith("/create")) return [home, base, { label: "Create" }];
      if (path.includes("/edit")) return [home, base, { label: "Edit" }];
      return [home, base];
    }

    // /machines/:machineType/*
    if (machineType) {
      const mt = machineTypes.find((m) => m.slug === machineType);
      const typeName = mt?.name ?? machineType.toUpperCase();
      const typeHref = routes.machine.home(machineType);

      const machineSegment: Segment = { label: typeName, href: typeHref };

      if (stationId && plantId) {
        return [
          home,
          machineSegment,
          { label: plantId, href: routes.machine.dashboard(machineType) },
          { label: stationId },
        ];
      }

      if (path.includes("/dashboard")) {
        return [home, machineSegment, { label: "Dashboard" }];
      }
      if (path.includes("/executive")) {
        return [home, machineSegment, { label: "Executive" }];
      }
      if (path.includes("/alarms")) {
        return [home, machineSegment, { label: "Alarms" }];
      }
      if (path.includes("/settings")) {
        return [home, machineSegment, { label: "Settings" }];
      }

      // /machines/:machineType (Home)
      return [home, machineSegment, { label: "Home" }];
    }

    // / (root)
    return [home];
  }, [location.pathname, machineType, plantId, stationId, machineTypes]);
}

export function Breadcrumbs() {
  const segments = useSegments();

  // Mobile: show only "← Back" pointing to parent
  const parent = segments.length > 1 ? segments[segments.length - 2] : null;
  const current = segments[segments.length - 1];

  return (
    <>
      {/* Desktop breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="hidden md:flex items-center gap-1 text-sm text-muted-foreground"
      >
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />}
              {isLast || !seg.href ? (
                <span className={isLast ? "font-medium text-foreground" : ""}>
                  {seg.label}
                </span>
              ) : (
                <Link
                  to={seg.href}
                  className="hover:text-foreground transition-colors"
                >
                  {seg.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Mobile: ← Back + current page */}
      <nav aria-label="breadcrumb" className="flex md:hidden items-center gap-2 text-sm">
        {parent?.href ? (
          <Link
            to={parent.href}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {parent.label}
          </Link>
        ) : (
          <span className="text-muted-foreground">FireIIOT</span>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium text-foreground truncate max-w-[140px]">
          {current.label}
        </span>
      </nav>
    </>
  );
}
