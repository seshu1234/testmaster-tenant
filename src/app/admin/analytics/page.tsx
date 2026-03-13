"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users, FileText, Activity, AlertCircle, TrendingUp, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface AdminOverview {
  active_students: number;
  total_tests: number;
  total_credits_used: number;
  total_attempts: number;
}

interface ActivityData {
  date: string;
  tests_taken: number;
}

interface AnalyticsData {
  overview: AdminOverview;
  activity_chart: ActivityData[];
}

export default function AdminAnalyticsDashboard() {
  const { user, token, tenantSlug } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/v1/admin/analytics/overview`, { token, tenant: tenantSlug || undefined });
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user, token, tenantSlug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
        <p>Could not load analytics data. Please try again later.</p>
      </div>
    );
  }

  const { overview, activity_chart } = data;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">High-level metrics and usage trends across your entire tenant.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.active_students}</div>
            <p className="text-xs text-muted-foreground mt-1">Total registered</p>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_tests}</div>
            <p className="text-xs text-muted-foreground mt-1">Created by teachers</p>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Attempts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_attempts}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed or graded</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm border-emerald-100 bg-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Platform Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Stable</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader>
            <CardTitle>Activity Trend (Last 7 Days)</CardTitle>
            <CardDescription>Daily breakdown of completed test attempts.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {activity_chart && activity_chart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity_chart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12 }} 
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="tests_taken" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorTests)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No activity registered in the last 7 days.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-zinc-400" />
              Notices
            </CardTitle>
            <CardDescription>System notices and platform updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-8 text-center text-muted-foreground text-xs uppercase font-bold tracking-widest">
                No new notices.
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
