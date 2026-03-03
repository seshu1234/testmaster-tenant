"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  GraduationCap,
  FileText,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const adminLinks = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Teachers", href: "/admin/teachers", icon: Users },
  { name: "Students", href: "/admin/students", icon: GraduationCap },
  { name: "Batches", href: "/admin/batches", icon: BookOpen },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const teacherLinks = [
  { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { name: "Questions", href: "/teacher/questions", icon: FileText },
  { name: "Tests", href: "/teacher/tests", icon: BookOpen },
  { name: "Results", href: "/teacher/results", icon: GraduationCap },
];

const studentLinks = [
  { name: "My Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "Tests", href: "/student/tests", icon: BookOpen },
  { name: "Results", href: "/student/results", icon: FileText },
  { name: "Support", href: "/student/support", icon: HelpCircle },
];

const parentLinks = [
  { name: "Wards Overview", href: "/parent", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  let links = studentLinks;
  if (user.role === "admin" || user.role === "superadmin") links = adminLinks;
  else if (user.role === "teacher") links = teacherLinks;
  else if (user.role === "parent") links = parentLinks;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <GraduationCap className="h-6 w-6" />
          <span>TestMaster</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" 
                  : "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
