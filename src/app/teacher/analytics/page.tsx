"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, FileText, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface AnalyticsOverview {
  tests_created: number;
  average_class_score: number;
  attempts_needing_grading: number;
}

interface TopPerformer {
  name: string;
  percentage: number;
  test_title: string;
}

interface SubjectPerformance {
  subject: string;
  correct: number;
  total: number;
  accuracy: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  top_performers: TopPerformer[];
  subject_performance: SubjectPerformance[];
}

export default function TeacherAnalyticsDashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/v1/teacher/analytics/overview`, { token, tenant: user.tenant_id });
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, token]);

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

  const { overview, top_performers, subject_performance } = data;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Class Analytics</h1>
        <p className="text-muted-foreground">Monitor performance, identify trends, and grade upcoming attempts.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.tests_created}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active tests in the platform
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Class Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.average_class_score}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all tests you created
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Grading</CardTitle>
            <CheckCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.attempts_needing_grading}</div>
            <p className="text-xs text-muted-foreground mt-1 text-amber-500 font-medium">
              Pending manual review
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject Performance Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Accuracy percentage grouped by subject area.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {subject_performance && subject_performance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subject_performance} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="subject" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12 }} 
                    domain={[0, 100]} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {subject_performance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`var(--primary)`} fillOpacity={0.8 + (index * 0.05)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No subject data available yet. Data populates as students complete tests.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Highest scoring students across recent tests.</CardDescription>
          </CardHeader>
          <CardContent>
             {top_performers && top_performers.length > 0 ? (
               <div className="space-y-6">
                 {top_performers.map((student, i) => (
                   <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {student.name.charAt(0)}
                       </div>
                       <div>
                         <p className="text-sm font-medium leading-none">{student.name}</p>
                         <p className="text-sm text-muted-foreground mt-1 line-clamp-1 max-w-[200px]">{student.test_title}</p>
                       </div>
                     </div>
                     <div className="font-bold text-lg bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-3 py-1 rounded-full">
                       {student.percentage}%
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  No top performers identified yet. 
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
