"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { Target, Brain } from "lucide-react";

interface AnalyticsData {
    rank: string | number;
    rank_percentile?: number;
    trends: Array<{ test: string; score: number; avg: number }>;
    mastery: Array<{ subject: string; A: number }>;
    focus_areas: Array<{ area: string; reason: string; action: string }>;
}

export default function StudentAnalytics() {
  const { user, token, tenantSlug } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !token) return;
      try {
        const response = await api("/v1/student/analytics", {
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

  if (loading) return <div>Loading your performance insights...</div>;
  if (!data) return <div>No analytics available at the moment.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Personal Performance</h1>
        <p className="text-muted-foreground">Deep dive into your strengths, weaknesses, and progress over time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{data.rank || "-"}</div>
            {data.rank_percentile && <p className="text-xs text-muted-foreground">Top {data.rank_percentile}% in your batch</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Score Progress</CardTitle>
            <CardDescription>Your performance trend across the last 10 tests</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="h-[300px] w-full">
               {data.trends?.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={data.trends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="test" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} name="My Score" />
                      <Line type="monotone" dataKey="avg" stroke="#94a3b8" strokeDasharray="5 5" name="Batch Avg" />
                   </LineChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-muted-foreground">No test data yet</div>
               )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Subject Mastery</CardTitle>
            <CardDescription>Strength analysis across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {data.mastery?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.mastery}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <Radar name="Mastery" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Take more tests for analysis</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {data.focus_areas?.length > 0 && (
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
           <CardHeader>
              <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle>AI Personalized Focus Areas</CardTitle>
              </div>
           </CardHeader>
           <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                 {data.focus_areas.map((item, i) => (
                   <div key={i} className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <h4 className="font-bold text-primary">{item.area}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                      <button className="mt-3 text-xs font-bold uppercase tracking-wider text-primary hover:underline">{item.action}</button>
                   </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      )}
    </div>
  );
}
