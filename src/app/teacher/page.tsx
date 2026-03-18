"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Zap,
  Plus,
  Sparkles,
  Activity,
  ChevronRight,
  Calendar,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import Link from "next/link";


interface UpcomingAssessment {
  title: string;
  batch_name: string;
  start_time: string;
  status: string;
}

interface RecentResult {
  name: string;
  status: string;
  avg_score: number;
  high_score: number;
}

interface TeacherDashboardData {
  kpis: {
    my_classes: number;
    my_students: number;
    tests_created: number;
    tests_to_grade: number;
    avg_score: number;
    ai_credits: number;
  };
  performance_trend: { name: string; score: number }[];
  upcoming_assessments: UpcomingAssessment[];
  recent_results: RecentResult[];
  ai_insight?: string;
}

export default function TeacherDashboard() {
  const { user, token, tenantSlug } = useAuth();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) return;
      try {
        const response = await api("/teacher/dashboard", {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Teacher dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [token, tenantSlug]);

  if (loading) return <div className="p-8 text-zinc-600 animate-pulse font-bold text-zinc-600">Loading Academic Command...</div>;

  const dashboard: TeacherDashboardData = data || {
    kpis: { my_classes: 0, my_students: 0, tests_created: 0, tests_to_grade: 0, avg_score: 0, ai_credits: 0 },
    performance_trend: [],
    upcoming_assessments: [],
    recent_results: [],
    ai_insight: ""
  };

  const kpis = [
    { label: "My Classes", value: dashboard.kpis.my_classes, icon: Users, description: "Active batches" },
    { label: "My Students", value: dashboard.kpis.my_students, icon: Activity, description: "Total enrolled" },
    { label: "Tests Created", value: dashboard.kpis.tests_created, icon: BookOpen, description: "Lifetime total" },
    { label: "Tests to Grade", value: dashboard.kpis.tests_to_grade, icon: Clock, description: "Manual review pending", urgent: dashboard.kpis.tests_to_grade > 0 },
    { label: "Class Avg Score", value: `${dashboard.kpis.avg_score}%`, icon: TrendingUp, description: "Last 30 days" },
    { label: "AI Credits", value: dashboard.kpis.ai_credits, icon: Zap, description: "Remaining this month" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Academic Command</h1>
          <p className="text-zinc-600 flex items-center gap-2">
            Welcome back, {user?.name || 'Instructor'} 
            <span className="h-1 w-1 rounded-full bg-zinc-300" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/teacher/calendar">
            <Button variant="outline" className="gap-2 border-zinc-200">
               <Calendar className="h-4 w-4" />
               View Schedule
            </Button>
          </Link>
          <Link href="/teacher/tests/new">
            <Button className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800">
              <Plus className="h-4 w-4" />
              Compose Test
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className={`border shadow-sm backdrop-blur-sm ${
            kpi.urgent ? 'bg-orange-50' : 'bg-white/50'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{kpi.label}</CardTitle>
              <kpi.icon className={`h-3 w-3 ${kpi.urgent ? 'text-red-600' : 'text-zinc-600'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{kpi.value}</div>
              <p className="text-[9px] text-zinc-600 line-clamp-1">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-5 border shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Class Performance Trend</CardTitle>
              <CardDescription>Historical average scores across all assigned batches.</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-zinc-600">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.performance_trend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#181b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#181b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#181b" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm bg-zinc-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="h-20 w-20" />
            </div>
            <CardHeader>
              <CardTitle className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Pedagogical AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-1">
                <p className="text-xl font-bold">Smart Insights Available</p>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  &ldquo;{dashboard.ai_insight || "Analyzing class performance..."}&rdquo;
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/teacher/questions/generate?pool=assessment">
                  <Button className="w-full bg-white text-zinc-600 hover:bg-zinc-100 gap-2 text-zinc-600 h-9">
                    <Zap className="h-3 w-3" />
                    Generate Questions
                  </Button>
                </Link>
                <Link href="/teacher/questions/generate?pool=practice">
                  <Button className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 gap-2 h-9">
                    <Sparkles className="h-3 w-3" />
                    Generate Practice Drills
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold uppercase tracking-wider text-zinc-600 flex items-center justify-between">
                Quick Actions
                <Activity className="h-3 w-3" />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/teacher/tests">
                <Button variant="ghost" className="w-full justify-between text-zinc-600 font-medium h-9 hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
                  Monitor Live Tests
                  <ExternalLink className="h-3 w-3 text-zinc-600" />
                </Button>
              </Link>
              <Link href="/teacher/results">
                <Button variant="ghost" className="w-full justify-between text-zinc-600 font-medium h-9 hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
                  Grade Assignments
                  <CheckCircle2 className="h-3 w-3 text-zinc-600" />
                </Button>
              </Link>
               <Link href="/teacher/questions">
                <Button variant="ghost" className="w-full justify-between text-zinc-600 font-medium h-9 hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
                  Manage Bank
                  <BookOpen className="h-3 w-3 text-zinc-600" />
                </Button>
              </Link>
              <Link href="/teacher/questions?bank=practice">
                <Button variant="ghost" className="w-full justify-between text-primary font-medium h-9 hover:bg-primary/5 border border-transparent hover:border-primary/10">
                  Review Practice Pool
                  <Sparkles className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Assessments</CardTitle>
            <Link href="/teacher/tests">
               <Button variant="link" size="sm" className="text-zinc-600 h-auto p-0 flex items-center gap-1 group">
               View All 
               <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
               </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-zinc-100">
              {dashboard.upcoming_assessments.length > 0 ? dashboard.upcoming_assessments.map((test, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600 group-hover:bg-primary/5 transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold truncate">{test.title}</p>
                    <p className="text-[10px] text-zinc-600 uppercase">{test.batch_name} • {new Date(test.start_time).toLocaleString()}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${
                    test.status === 'Ready' || test.status === 'published' ? 'bg-green-100 text-green-700' :
                    test.status === 'Draft' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {test.status}
                  </div>
                </div>
              )) : (
                 <p className="text-zinc-600 py-8 text-zinc-600 font-medium">No upcoming assessments scheduled.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {dashboard.recent_results.length > 0 ? dashboard.recent_results.map((result, i) => (
               <div key={i} className="p-3 rounded-lg border border-zinc-50 bg-zinc-50/30 flex flex-col gap-1 hover:border-zinc-100 hover:bg-white transition-all">
                 <div className="flex justify-between items-center">
                    <span className="text-xl font-bold line-clamp-1">{result.name}</span>
                    <span className={`text-[8px] font-bold uppercase ${result.status === 'Published' || result.status === 'published' ? 'text-green-600' : 'text-zinc-600'}`}>
                      {result.status}
                    </span>
                 </div>
                 <div className="flex justify-between text-[10px] text-zinc-600">
                    <span>Avg Score: <strong className="text-zinc-600">{result.avg_score}%</strong></span>
                    <span>High: <strong className="text-zinc-600">{result.high_score}%</strong></span>
                 </div>
               </div>
             )) : (
                <p className="text-zinc-600 py-8 text-zinc-600 font-medium">No recent results found.</p>
             )}
             <Link href="/teacher/results" className="w-full block">
               <Button variant="outline" className="w-full text-zinc-600 h-8 border-dashed border-zinc-200">
                  Access Full Analytics
               </Button>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
