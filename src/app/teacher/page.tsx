"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, GraduationCap, CheckCircle2, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface TeacherStats {
  stats: {
    total_tests_created: number;
    total_questions_banked: number;
    active_student_attempts: number;
  };
  recent_tests: {
    id: string;
    title: string;
    status: string;
    created_at: string;
  }[];
}

export default function TeacherDashboard() {
  const { token, tenantSlug } = useAuth();
  const [data, setData] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) return;
      try {
        const response = await api("/teacher/dashboard", {
          token,
          tenant: tenantSlug || undefined
        });
        setData(response.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [token, tenantSlug]);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const stats = [
    { title: "My Tests", value: data?.stats.total_tests_created || 0, icon: FileText, description: "Total tests created" },
    { title: "Questions Banked", value: data?.stats.total_questions_banked || 0, icon: CheckCircle2, description: "Available for tests" },
    { title: "Active Attempts", value: data?.stats.active_student_attempts || 0, icon: Clock, description: "Students testing now" },
    { title: "Avg. Class Score", value: "TBD", icon: GraduationCap, description: "Requires calculation" },
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
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tests Created</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recent_tests.length ? (
              <ul className="space-y-3">
                {data.recent_tests.map((test) => (
                  <li key={test.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md">
                    <div>
                      <span className="font-medium text-sm block">{test.title}</span>
                      <span className="text-xs text-muted-foreground">{new Date(test.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${test.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {test.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent tests found.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Shortcuts for Test Building and Data import will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
