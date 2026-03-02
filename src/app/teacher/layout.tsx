import { DashboardLayoutBase } from "@/components/dashboard/dashboard-layout-base";
import { ReactNode } from "react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayoutBase allowedRoles={["teacher"]}>
      {children}
    </DashboardLayoutBase>
  );
}
