"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const performanceData = [
  { name: "Week 1", score: 65 },
  { name: "Week 2", score: 72 },
  { name: "Week 3", score: 68 },
  { name: "Week 4", score: 85 },
  { name: "Week 5", score: 78 },
  { name: "Week 6", score: 82 },
];

export default function TeacherDashboard() {

  const kpis = [
    { label: "My Classes", value: "4", icon: Users, description: "Active batches" },
    { label: "My Students", value: "148", icon: Activity, description: "Total enrolled" },
    { label: "Tests Created", value: "32", icon: BookOpen, description: "Lifetime total" },
    { label: "Tests to Grade", value: "7", icon: Clock, description: "Manual review pending", urgent: true },
    { label: "Class Avg Score", value: "78%", icon: TrendingUp, description: "Last 30 days" },
    { label: "AI Credits", value: "850", icon: Zap, description: "Remaining this month" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Academic Command</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Welcome back, Prof. Henderson 
            <span className="h-1 w-1 rounded-full bg-zinc-300" />
            Thursday, October 15, 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-zinc-200">
            <Calendar className="h-4 w-4" />
            View Schedule
          </Button>
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
          <Card key={i} className={`border-none shadow-sm backdrop-blur-sm ${
            kpi.urgent ? 'bg-orange-50 dark:bg-orange-900/10' : 'bg-white/50 dark:bg-zinc-900/50'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</CardTitle>
              <kpi.icon className={`h-3 w-3 ${kpi.urgent ? 'text-orange-500' : 'text-primary'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{kpi.value}</div>
              <p className="text-[9px] text-muted-foreground line-clamp-1">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-5 border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Class Performance Trend</CardTitle>
              <CardDescription>Historical average scores across all assigned batches.</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-zinc-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="h-20 w-20" />
            </div>
            <CardHeader>
              <CardTitle className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Pedagogical AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-1">
                <p className="text-sm font-bold">Smart Insights Available</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                  &ldquo;Your JEE Alpha batch is struggling with Entropy. Generate a remediation set?&rdquo;
                </p>
              </div>
              <Link href="/teacher/questions/generate">
                <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-100 gap-2 text-xs h-9 mt-2">
                  <Zap className="h-3 w-3" />
                  Generate Questions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                Quick Actions
                <Activity className="h-3 w-3" />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/teacher/tests">
                <Button variant="ghost" className="w-full justify-between text-xs font-medium h-9 hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
                  Monitor Live Tests
                  <ExternalLink className="h-3 w-3 text-zinc-400" />
                </Button>
              </Link>
              <Link href="/teacher/results">
                <Button variant="ghost" className="w-full justify-between text-xs font-medium h-9 hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
                  Grade Assignments
                  <CheckCircle2 className="h-3 w-3 text-zinc-400" />
                </Button>
              </Link>
              <Link href="/teacher/questions">
                <Button variant="ghost" className="w-full justify-between text-xs font-medium h-9 hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
                  Manage Bank
                  <BookOpen className="h-3 w-3 text-zinc-400" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Assessments</CardTitle>
            <Button variant="link" size="sm" className="text-xs h-auto p-0 flex items-center gap-1 group">
              View All 
              <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-zinc-100">
              {[
                { title: "Weekly Mock: Organic Chemistry", batch: "JEE 2026 Alpha", time: "Tomorrow, 10:00 AM", status: "Ready" },
                { title: "Foundation Quiz: Mechanics", batch: "Grade 10 Foundation", time: "Oct 18, 02:00 PM", status: "Draft" },
                { title: "Revision Test: Calculus", batch: "JEE 2025 Delta", time: "Oct 20, 09:00 AM", status: "Scheduled" },
              ].map((test, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{test.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{test.batch} • {test.time}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${
                    test.status === 'Ready' ? 'bg-green-100 text-green-700' :
                    test.status === 'Draft' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {test.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {[
               { name: "Unit Test 4: Algebra", avg: "82%", high: "98%", status: "Published" },
               { name: "Pre-Board Mock #1", avg: "65%", high: "92%", status: "Grading" },
               { name: "Chap 2: Thermodynamics", avg: "74%", high: "88%", status: "Published" },
             ].map((result, i) => (
               <div key={i} className="p-3 rounded-lg border border-zinc-50 bg-zinc-50/30 flex flex-col gap-1 hover:border-zinc-100 hover:bg-white transition-all">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold line-clamp-1">{result.name}</span>
                    <span className={`text-[8px] font-bold uppercase ${result.status === 'Published' ? 'text-green-600' : 'text-orange-600'}`}>
                      {result.status}
                    </span>
                 </div>
                 <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Avg Score: <strong className="text-zinc-900">{result.avg}</strong></span>
                    <span>High: <strong className="text-primary">{result.high}</strong></span>
                 </div>
               </div>
             ))}
             <Button variant="outline" className="w-full text-xs h-8 border-dashed border-zinc-200">
               Access Full Analytics
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
