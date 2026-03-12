"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Award, Brain } from "lucide-react";

interface TeacherAnalyticsData {
    overall_avg: string;
    score_change?: string;
    active_students: string | number;
    participation_rate?: string;
    subject_performance: Array<{ name: string; avg: number }>;
    trends: Array<{ month: string; score: number }>;
    ai_analysis: {
        critical: Array<{ title: string; description: string }>;
        optimal: Array<{ title: string; description: string }>;
    };
}

export default function TeacherAnalytics() {
  const { user, token, tenantSlug } = useAuth();
  const [data, setData] = useState<TeacherAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !token) return;
      try {
        const response = await api("/v1/teacher/analytics", {
          token,
          tenant: tenantSlug || undefined,
        });
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user, token, tenantSlug]);

  if (loading) return <div>Loading analytics...</div>;
  if (!data) return <div>No analytics available at the moment.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground">Monitor student progress and test performance across all batches.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm h-full bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overall_avg || "0%"}</div>
            {data.score_change && <p className="text-xs text-muted-foreground">{data.score_change} from last month</p>}
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm h-full bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.active_students || "0"}</div>
            {data.participation_rate && <p className="text-xs text-muted-foreground">{data.participation_rate} participation rate</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Subject-wise Average</CardTitle>
            <CardDescription>Performance comparison across different subjects</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="h-[300px] w-full">
              {data.subject_performance?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.subject_performance}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="avg" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Score Trends</CardTitle>
            <CardDescription>Overall performance trend over time</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="h-[300px] w-full">
               {data.trends?.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={data.trends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} />
                   </LineChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
               )}
            </div>
          </CardContent>
        </Card>
      </div>

      {data.ai_analysis && (
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
           <CardHeader>
              <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle>AI Question Bank Analysis</CardTitle>
              </div>
              <CardDescription>AI recommendations based on student response patterns</CardDescription>
           </CardHeader>
           <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                 {data.ai_analysis.critical?.map((item, i) => (
                   <div key={`crit-${i}`} className="p-4 rounded-xl border border-red-100 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/20">
                      <h4 className="font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
                         🚩 Critical: {item.title}
                      </h4>
                      <p className="text-sm text-red-700/80 dark:text-red-400/80 mt-2">
                         {item.description}
                      </p>
                   </div>
                 ))}
                 {data.ai_analysis.optimal?.map((item, i) => (
                   <div key={`opt-${i}`} className="p-4 rounded-xl border border-green-100 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/20">
                      <h4 className="font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
                         ✅ Optimal: {item.title}
                      </h4>
                      <p className="text-sm text-green-700/80 dark:text-green-400/80 mt-2">
                         {item.description}
                      </p>
                   </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      )}
    </div>
  );
}
