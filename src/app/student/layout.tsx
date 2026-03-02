import { DashboardLayoutBase } from "@/components/dashboard/dashboard-layout-base";
import { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayoutBase allowedRoles={["student"]}>
      {children}
    </DashboardLayoutBase>
  );
}
