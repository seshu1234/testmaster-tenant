import { DashboardLayoutBase } from "@/components/dashboard/dashboard-layout-base";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayoutBase allowedRoles={["admin", "super_admin"]}>
      {children}
    </DashboardLayoutBase>
  );
}
