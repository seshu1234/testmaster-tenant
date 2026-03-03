"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Trophy, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface StudentStats {
  stats: {
    total_tests_taken: number;
    average_score_percentage: number;
  };
  upcoming_tests: {
    id: string;
    title: string;
    duration_seconds: number;
    created_at: string;
  }[];
  recent_results: {
    id: string;
    test: {
      id: string;
      title: string;
    };
    score: number;
    percentage: number;
    created_at: string;
  }[];
}

export default function StudentDashboard() {
  const { token, tenantSlug } = useAuth();
  const [data, setData] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) return;
      try {
        const response = await api("/student/dashboard", {
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
    { title: "Upcoming Tests", value: data?.upcoming_tests.length || 0, icon: Clock, description: "Assigned to you" },
    { title: "Completed Tests", value: data?.stats.total_tests_taken || 0, icon: CheckCircle2, description: "Historic attempts" },
    { title: "Avg. Score", value: `${data?.stats.average_score_percentage || 0}%`, icon: Trophy, description: "Across all tests" },
    { title: "Total Questions", value: "TBD", icon: BookOpen, description: "Practiced so far" },
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
            <CardTitle>Upcoming Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.upcoming_tests.length ? (
              <ul className="space-y-3">
                {data.upcoming_tests.map((test) => (
                  <li key={test.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md">
                    <div>
                      <span className="font-medium text-sm block">{test.title}</span>
                      <span className="text-xs text-muted-foreground">{test.duration_seconds / 60} Minutes</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      Pending
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming tests scheduled.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recent_results.length ? (
              <ul className="space-y-3">
                {data.recent_results.map((result) => (
                  <li key={result.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md">
                    <div>
                      <span className="font-medium text-sm block">{result.test.title}</span>
                      <span className="text-xs text-muted-foreground">{new Date(result.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm font-bold">
                      {Math.round(result.percentage)}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent performance data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
