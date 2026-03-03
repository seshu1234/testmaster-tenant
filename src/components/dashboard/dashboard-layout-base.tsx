"use client";

import { ReactNode, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { UserNav } from "./user-nav";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles: ("admin" | "teacher" | "student" | "superadmin" | "parent")[];
}

export function DashboardLayoutBase({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!allowedRoles.includes(user.role)) {
        // Redirect to their own dashboard if they are on a wrong one
        router.push(`/${user.role}`);
      }
    }
  }, [user, isLoading, router, allowedRoles, pathname]);

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent dark:border-zinc-50" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-8 bg-white dark:bg-zinc-950">
          <h2 className="text-xl font-semibold capitalize">
            {pathname.split("/")[1]} Dashboard
          </h2>
          <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
