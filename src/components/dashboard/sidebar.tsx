"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  Settings,
  ShieldCheck,
  Rocket,
  Send,
  Calculator,
  Fingerprint,
  FileText,
  HelpCircle,
  Calendar,
  FolderOpen,
  TrendingUp,
  Zap,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

const adminLinks = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Setup Wizard", href: "/admin/onboarding", icon: Rocket },
  { name: "Teachers", href: "/admin/teachers", icon: Users },
  { name: "Students", href: "/admin/students", icon: GraduationCap },
  { name: "Batches", href: "/admin/batches", icon: BookOpen },
  { name: "Test Monitoring", href: "/admin/tests", icon: ShieldCheck },
  { name: "Question Bank", href: "/admin/questions", icon: Fingerprint },
  { name: "Communications", href: "/admin/communications", icon: Send },
  { name: "ROI Calculator", href: "/admin/analytics/financials", icon: Calculator },
  { name: "Analytics", href: "/admin/analytics", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const teacherLinks = [
  { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { name: "My Classes", href: "/teacher/batches", icon: Users },
  { name: "Calendar", href: "/teacher/calendar", icon: Calendar },
  { name: "Question Bank", href: "/teacher/questions", icon: FileText },
  { name: "Test Builder", href: "/teacher/tests", icon: BookOpen },
  { name: "Class Analytics", href: "/teacher/analytics", icon: Activity },
  { name: "Question Insights", href: "/teacher/analytics/question-analytics", icon: TrendingUp },
  { name: "Communications", href: "/teacher/communications", icon: Send },
  { name: "Study Materials", href: "/teacher/resources", icon: FolderOpen },
  { name: "Settings", href: "/teacher/settings", icon: Settings },
];

const studentLinks = [
  { name: "My Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "Tests", href: "/student/tests", icon: BookOpen },
  { name: "Practice Drills", href: "/student/practice", icon: Zap },
  { name: "Resources", href: "/student/resources", icon: FolderOpen },
  { name: "Performance", href: "/student/analytics", icon: TrendingUp },
  { name: "Leaderboards", href: "/student/leaderboard", icon: Activity },
  { name: "Mistake Log", href: "/student/mistakes", icon: HelpCircle },
  { name: "Achievements", href: "/student/achievements", icon: Rocket },
  { name: "Notifications", href: "/student/notifications", icon: Bell },
  { name: "Settings", href: "/student/settings", icon: Settings },
  { name: "Support", href: "/student/support", icon: HelpCircle },
];

const parentLinks = [
  { name: "My Dashboard", href: "/parent", icon: LayoutDashboard },
  { name: "Family Matrix", href: "/parent/family", icon: Users },
  { name: "Performance", href: "/parent/performance", icon: TrendingUp },
  { name: "Test Results", href: "/parent/results", icon: BookOpen },
  { name: "Upcoming Tests", href: "/parent/upcoming", icon: Calendar },
  { name: "Communications", href: "/parent/communications", icon: Send },
  { name: "Settings", href: "/parent/settings", icon: Settings },
  { name: "Support", href: "/parent/support", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, branding } = useAuth();

  if (!user) return null;

  let links = studentLinks;
  if (user.role === "admin" || user.role === "superadmin") links = adminLinks;
  else if (user.role === "teacher") links = teacherLinks;
  else if (user.role === "parent") links = parentLinks;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-zinc-50/50">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          {branding?.logo_url ? (
             <Image src={branding.logo_url} alt="Logo" className="h-8 w-auto" width={500} height={500} />
          ) : (
             <GraduationCap className="h-6 w-6" />
          )}
          <span>{branding?.institute_name || branding?.site_title || "TestMaster"}</span>
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-600 font-medium transition-colors",
                isActive 
                  ? "bg-zinc-200 text-zinc-600" 
                  :  "text-zinc-600 hover:bg-zinc-200/50 "
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
