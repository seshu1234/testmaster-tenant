"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, AlertCircle, BookOpen, User, Flame } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import Link from "next/link";

interface StudentOverview {
  total_tests_taken: number;
  average_score: number;
  weakest_subject: string;
  strongest_subject: string;
}

interface SubjectPerformance {
  subject: string;
  correct: number;
  total: number;
  accuracy: number;
}

interface RecentTrend {
  date: string;
  percentage: number;
  test_title: string;
}

interface AnalyticsData {
  overview: StudentOverview;
  subject_performance: SubjectPerformance[];
  recent_trend: RecentTrend[];
  ai_recommendation: string;
}

export default function StudentAnalyticsDashboard() {
  const { user, token, tenantSlug } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/v1/student/analytics/insights`, { token, tenant: tenantSlug || undefined });
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch student analytics:", err);
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

  const { overview, subject_performance, recent_trend, ai_recommendation } = data;

  return (
    <div className="space-y-6 animate-in zoom-in-95 fade-in duration-500 pb-20 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">Personalized analytics to boost your learning efficiency.</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center">
         <div className="h-16 w-16 min-w-[4rem] rounded-full bg-primary/20 text-primary flex items-center justify-center pt-1">
            <User className="h-8 w-8" />
         </div>
         <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center gap-2">
               <Flame className="h-5 w-5 text-orange-500" />
               AI Recommendation
            </h3>
            <p className="text-muted-foreground leading-relaxed">{ai_recommendation}</p>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
           <CardContent className="p-6">
              <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Tests Taken</p>
              <div className="text-3xl font-bold mt-2">{overview.total_tests_taken}</div>
           </CardContent>
        </Card>
        <Card>
           <CardContent className="p-6">
              <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Average Score</p>
              <div className="text-3xl font-bold mt-2">{overview.average_score}%</div>
           </CardContent>
        </Card>
        <Card>
           <CardContent className="p-6">
              <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase leading-tight">Strongest</p>
              <div className="text-lg font-bold mt-2 line-clamp-1 text-green-600 dark:text-green-400">
                {overview.strongest_subject}
              </div>
           </CardContent>
        </Card>
        <Card>
           <CardContent className="p-6">
              <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase leading-tight">Weakest</p>
              <div className="text-lg font-bold mt-2 line-clamp-1 text-red-600 dark:text-red-400">
                {overview.weakest_subject}
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Matrix</CardTitle>
            <CardDescription>Your accuracy mapped across all tested subjects.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {subject_performance && subject_performance.length > 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subject_performance}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--foreground)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Radar name="Accuracy %" dataKey="accuracy" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
               <div className="text-center text-muted-foreground text-sm max-w-xs space-y-3">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
                     <BookOpen className="h-6 w-6 text-zinc-400" />
                  </div>
                  <p>Complete tests in at least 3 different subjects to unlock your skill radar.</p>
               </div>
            )}
          </CardContent>
        </Card>

        {/* Line Chart Component for history */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance Trend</CardTitle>
            <CardDescription>Your scores over the last few attempts.</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
             {recent_trend && recent_trend.length > 1 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={recent_trend} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 11 }} 
                    />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="percentage" name="Score" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 6 }} />
                 </LineChart>
               </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Complete more tests to see your trend over time.
                </div>
             )}
          </CardContent>
          <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 mt-4 border-t px-6 py-4 flex justify-between items-center">
             <p className="text-sm text-muted-foreground">Ready to improve?</p>
             <Button asChild size="sm">
                <Link href="/student/tests" className="gap-2">
                   Take a Test <TrendingUp className="h-4 w-4" />
                </Link>
             </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
