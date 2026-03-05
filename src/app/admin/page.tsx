"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface DashboardStats {
  total_teachers: number;
  total_students: number;
  total_tests: number;
  total_attempts: number;
}

export default function AdminDashboard() {
  const { token, tenantSlug } = useAuth();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!token) return;
      
      try {
        const response = await api("/admin/analytics/overview", {
          token,
          tenant: tenantSlug || undefined
        });
        setData(response.data.overview);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [token, tenantSlug]);

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading tenant statistics...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  const stats = [
    { title: "Total Teachers", value: data?.total_teachers || 0, icon: Users, description: "Active educators" },
    { title: "Total Students", value: data?.total_students || 0, icon: GraduationCap, description: "Enrolled learners" },
    { title: "Total Tests Built", value: data?.total_tests || 0, icon: BookOpen, description: "Created across all teachers" },
    { title: "Test Attempts", value: data?.total_attempts || 0, icon: Activity, description: "Total submissions" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Tenant Activity Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">The platform is currently fully operational and serving the local tenant data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
