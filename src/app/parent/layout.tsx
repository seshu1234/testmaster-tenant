import { DashboardLayoutBase } from "@/components/dashboard/dashboard-layout-base";
import { ReactNode } from "react";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayoutBase allowedRoles={["parent"]}>
      {children}
    </DashboardLayoutBase>
  );
}
