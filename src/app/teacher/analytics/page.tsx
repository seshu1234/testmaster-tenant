"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, FileText, CheckCircle, TrendingUp, AlertCircle, Brain, Target, Zap } from "lucide-react";
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
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";

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

interface WeaknessArea {
  topic: string;
  score: number;
  fullMark: number;
  recommendation: string;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  top_performers: TopPerformer[];
  subject_performance: SubjectPerformance[];
  weakness_analysis: WeaknessArea[];
}

export default function TeacherAnalyticsDashboard() {
  const { user, token, tenantSlug } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/teacher/analytics/overview`, { token, tenant: tenantSlug || undefined });
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

  const { overview, top_performers, subject_performance, weakness_analysis } = data;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-20">
      <div className="flex justify-between items-end border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Class Intelligence</h1>
          <p className="text-muted-foreground">AI-driven insights into your student performance and growth areas.</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">AI Engine Active</span>
           </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border shadow-md bg-white dark:bg-zinc-900/50">
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
        
        <Card className="border shadow-md bg-white dark:bg-zinc-900/50">
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
        
        <Card className="border shadow-md bg-white dark:bg-zinc-900/50">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Performance Chart */}
        <Card className="lg:col-span-2 border shadow-md bg-white dark:bg-zinc-900">
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
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
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
                No subject data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weakness Radar Chart */}
        <Card className="border shadow-md bg-zinc-900 text-white overflow-hidden">
           <CardHeader className="bg-zinc-800/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <Target className="h-4 w-4 text-primary" />
                 Weakness Radar
              </CardTitle>
           </CardHeader>
           <CardContent className="h-[300px] flex items-center justify-center pt-6">
              {weakness_analysis && weakness_analysis.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={weakness_analysis}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="topic" tick={{ fill: '#999', fontSize: 10 }} />
                      <Radar
                        name="Class Score"
                        dataKey="score"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        fillOpacity={0.6}
                      />
                   </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-zinc-500 text-xs text-center px-8">
                   Insufficient data for radar mapping. Continue publishing tests to enable AI analysis.
                </div>
              )}
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Top Performers */}
         <Card className="border shadow-md bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Highest scoring students across recent tests.</CardDescription>
          </CardHeader>
          <CardContent>
             {top_performers && top_performers.length > 0 ? (
               <div className="space-y-6">
                 {top_performers.map((student, i) => (
                   <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {student.name.charAt(0)}
                       </div>
                       <div>
                         <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">{student.name}</p>
                         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{student.test_title}</p>
                       </div>
                     </div>
                     <div className="font-black text-lg text-emerald-600 dark:text-emerald-400">
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

        {/* AI Growth Recommendations */}
        <Card className="border shadow-md bg-white dark:bg-zinc-900">
           <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <Zap className="h-4 w-4 text-amber-500" />
                 Growth Recommendations
              </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              {weakness_analysis && weakness_analysis.length > 0 ? weakness_analysis.slice(0, 3).map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black uppercase tracking-tighter text-zinc-400">{item.topic}</span>
                      <Badge className="bg-amber-100 text-amber-700 border-none text-[8px] font-bold">Action Required</Badge>
                   </div>
                   <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.recommendation}</p>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                   AI is currently analyzing response patterns. Recommendations will appear shortly.
                </div>
              )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
