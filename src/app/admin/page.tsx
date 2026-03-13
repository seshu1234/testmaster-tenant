"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  ShieldCheck,
  Settings,
  Plus,
  Clock,
  BarChart3,
  Lock,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
interface DashboardData {
  stats: {
    total_students: number;
    active_tests: number;
    avg_performance: number;
    revenue: number;
  };
  revenue_data: { name: string; students: number; tests: number }[];
  recent_activity: { user: string; action: string; time: string }[];
  upcoming_events: { title: string; date: string; time: string }[];
}

export default function AdminDashboard() {
  const { token, tenantSlug } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDashboard() {
      if (!token) return;
      try {
        const response = await api("/v1/admin/dashboard", {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setData(response.data);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Admin dashboard fetch error:", error);
        // We should ideally show an error state to the user
      } finally {
        setLoading(false);
      }
    }
    getDashboard();
  }, [token, tenantSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Initializing Strategic Overview...</p>
        </div>
      </div>
    );
  }

  const dashboard = data!;

  const kpis = [
    { label: "Total Students", value: dashboard.stats.total_students, icon: Users, trend: "+12.5%", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Tests", value: dashboard.stats.active_tests, icon: BookOpen, trend: "+3", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Avg Performance", value: `${dashboard.stats.avg_performance}%`, icon: Activity, trend: "+5.2%", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Centre Health", value: "Optimal", icon: ShieldCheck, trend: "Status: OK", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Strategic Overview</h1>
          <p className="text-muted-foreground font-medium">Monitoring platform health and performance metrics for {tenantSlug || 'Global'}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/settings">
            <Button variant="outline" className="gap-2 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 rounded-xl px-5">
               <Settings className="h-4 w-4" />
               Configuration
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl px-5 shadow-lg shadow-zinc-200 dark:shadow-none">
              <Plus className="h-4 w-4" />
              Generate Report
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 bg-white dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</CardTitle>
              <div className={`${kpi.bg} ${kpi.color} p-2 rounded-xl group-hover:scale-110 transition-transform dark:bg-zinc-800`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{kpi.value}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase">{kpi.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
             <BarChart3 className="h-64 w-64 rotate-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">Analytical Insights</CardTitle>
              <CardDescription>Visualizing student engagement and performance trends.</CardDescription>
            </div>
            <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
               <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold rounded-lg bg-white dark:bg-zinc-700 shadow-sm">30D</Button>
               <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold rounded-lg">90D</Button>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.revenue_data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                <Tooltip
                   contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                   cursor={{ fill: '#f8fafc', opacity: 0.5 }}
                />
                <Bar dataKey="students" fill="#18181b" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="tests" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                 <CardTitle className="text-xl font-bold tracking-tight">Recent Activity</CardTitle>
                 <Activity className="h-4 w-4 text-zinc-400 animate-pulse" />
              </div>
              <CardDescription>Live feed of platform interactions across your centre.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto max-h-[400px] scrollbar-hide">
              <div className="space-y-6">
                {dashboard.recent_activity.length > 0 ? dashboard.recent_activity.map((activity, i) => (
                  <div key={i} className="flex gap-4 group cursor-default">
                    <div className="relative">
                       <div className="h-10 w-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700 group-hover:bg-zinc-100 transition-colors">
                          <Users className="h-5 w-5 text-zinc-500" />
                       </div>
                       {i !== dashboard.recent_activity.length - 1 && (
                          <div className="absolute top-11 left-5 w-[1px] h-6 bg-zinc-100 dark:bg-zinc-800" />
                       )}
                    </div>
                    <div className="space-y-1 py-1">
                      <p className="text-[13px] font-bold leading-none group-hover:text-primary transition-colors text-zinc-900 dark:text-white">{activity.user || 'System user'}</p>
                      <p className="text-[11px] text-muted-foreground">{activity.action}</p>
                      <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">{activity.time}</p>
                    </div>
                  </div>
                )) : (
                   <p className="text-xs text-center py-8 text-zinc-400 font-bold uppercase tracking-widest">No recent activity detected.</p>
                )}
              </div>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
               <Link href="/admin/activity" className="block w-full">
                  <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-11 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 group">
                     View All Activity
                     <ChevronRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </Link>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="lg:col-span-2 border-none shadow-sm bg-zinc-900 text-white overflow-hidden relative group rounded-3xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover:scale-125 transition-transform duration-1000">
               <ShieldCheck className="h-48 w-48" />
            </div>
            <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-primary/10 rounded-full blur-3xl" />
            
            <CardHeader>
               <CardTitle className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Security & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative">
               <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                     <Lock className="h-7 w-7 text-white" />
                  </div>
                  <div>
                     <p className="text-lg font-bold">Proctoring Protocols: Active</p>
                     <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">Systems Optimal</p>
                     </div>
                  </div>
               </div>
               <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                  Advanced integrity systems are monitoring active sessions across your designated centres. Neural proctoring and browser-lock protocols are currently enforced without anomalies.
               </p>
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden flex flex-col">
            <CardHeader className="pb-4">
               <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-xl font-bold">Milestones</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-auto max-h-[250px] scrollbar-hide">
               {dashboard.upcoming_events.length > 0 ? dashboard.upcoming_events.map((event, i) => (
                  <div key={i} className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-800/50 space-y-2 border-zinc-100 dark:border-zinc-800 shadow-sm first:border-l-4 first:border-l-zinc-900 dark:first:border-l-zinc-100 group hover:bg-zinc-50 transition-colors">
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] font-bold group-hover:text-primary transition-colors text-zinc-900 dark:text-white">{event.title}</span>
                        <ChevronRight className="h-3 w-3 text-zinc-300" />
                     </div>
                     <div className="flex gap-2 items-center">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{event.date} • {event.time}</span>
                     </div>
                  </div>
               )) : (
                  <p className="text-xs text-center py-8 text-zinc-400 font-bold uppercase tracking-widest">No milestones found.</p>
               )}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
