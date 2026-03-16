import { Outlet } from "react-router-dom";
import AppLayout from "./AppLayout";

/** Layout route wrapper — renders AppLayout with <Outlet> for nested routes. */
export function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
