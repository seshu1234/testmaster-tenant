"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import Link from "next/link";
import { 
  Award, 
  BookOpen, 
  Clock, 
  Zap, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight,
  Target,
  Trophy,
  Calendar as CalendarIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StudentDashboardData {
  stats: {
    tests_taken: number;
    avg_score: number;
    rank: number;
    streak: number;
  };
  upcoming_tests: any[];
  achievements: {
    level: number;
    progress: number;
    points: number;
    title: string;
    next_level_points: number;
    insight: string;
  };
  streak_history: number[];
  ai_tip?: string;
  next_goal?: string;
}

export default function StudentDashboard() {
  const { user, token, tenantSlug, branding } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) return;
      try {
        const response = await api("/v1/student/dashboard", {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Student dashboard fetch error:", error);
        // Fallback for dev/demo if API fails
        setData({
          stats: { tests_taken: 14, avg_score: 82, rank: 5, streak: 8 },
          upcoming_tests: [
            { id: 't1', title: 'Mathematics Quiz', type: 'practice', date: '2024-03-24T10:00:00Z', duration: 3600 },
            { id: 't2', title: 'Science Mid-Term', type: 'mock', date: '2024-03-28T14:30:00Z', duration: 7200 },
          ],
          achievements: {
            level: 4,
            progress: 65,
            points: 1250,
            title: "Scholar",
            next_level_points: 2000,
            insight: "Keep it up!"
          },
          streak_history: [4, 5, 2, 8, 3, 5, 8],
          ai_tip: "Focus more on Algebra this week.",
          next_goal: "Complete 5 more practice sets"
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [token, tenantSlug]);

  if (loading) {
     return (
        <div className="p-8 space-y-8 animate-pulse">
           <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem]" />
           <div className="grid grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem]" />)}
           </div>
        </div>
     );
  }

  const dashboard: StudentDashboardData = data || {
    stats: { tests_taken: 0, avg_score: 0, rank: 0, streak: 0 },
    upcoming_tests: [],
    achievements: {
      level: 1,
      progress: 0,
      points: 0,
      title: "Novice",
      next_level_points: 100,
      insight: "Start your first test to gain experience!"
    },
    streak_history: [],
    ai_tip: "",
    next_goal: "Complete your first assessment"
  };

  const kpis = [
    { title: "Tests Taken", value: dashboard.stats.tests_taken, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Avg Score", value: `${dashboard.stats.avg_score}%`, icon: Target, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "Current Rank", value: `#${dashboard.stats.rank || '--'}`, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { title: "Streak", value: `${dashboard.stats.streak} Days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 px-8 py-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-3 max-w-xl">
            <Badge className="w-fit bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-4 py-1.5">
              Goal: {dashboard.next_goal || "Top 10 Percentile"}
            </Badge>
            <h1 className="text-5xl font-black tracking-tighter leading-tight italic">
               {branding?.hero_title || `BOUNCE BACK, ${user?.name?.split(' ')[0] || 'ASPIRANT'}!`}
            </h1>
            <p className="text-zinc-400 text-lg font-medium">
               {branding?.hero_description || "You're 3 practice sets away from your next achievement badge. The academic cycle is heating up—stay focused."}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
               <Link href="/student/practice">
                  <Button className="bg-white text-black font-black px-8 h-14 rounded-2xl shadow-xl hover:scale-105 transition-all group">
                     CONTINUE LEARNING
                     <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </Link>
               <Link href="/student/analytics">
                  <Button variant="outline" className="bg-white/5 border-white/10 backdrop-blur-md text-white px-8 h-14 rounded-2xl font-bold hover:bg-white/10">
                     MY PERFORMANCE
                  </Button>
               </Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-4 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-inner">
             <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-primary border-t-zinc-800 animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                   <span className="text-2xl font-black italic">{dashboard.achievements.progress}%</span>
                </div>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Level {dashboard.achievements.level} Progress</p>
                <p className="text-xs font-bold text-zinc-400">{dashboard.achievements.points} / {dashboard.achievements.next_level_points || 1000} Points</p>
             </div>
          </div>
        </div>
        
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat) => (
          <Card key={stat.title} className="border-none shadow-xl bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all transform duration-300">
            <CardContent className="p-8">
               <div className="flex justify-between items-start mb-6">
                  <div className={cn("p-4 rounded-2xl transition-all group-hover:rotate-12", stat.bg)}>
                     <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.title}</p>
                  <div className="text-3xl font-black italic tracking-tight">{stat.value}</div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Upcoming Assessments */}
        <Card className="md:col-span-12 lg:col-span-8 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-zinc-950">
          <CardHeader className="p-8 border-b bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex justify-between items-center">
               <div>
                  <CardTitle className="text-2xl font-black tracking-tighter uppercase italic">Combat Ready Tests</CardTitle>
                  <CardDescription className="font-bold text-[10px] uppercase tracking-widest mt-1">Scheduled assessments for your current batch</CardDescription>
               </div>
               <Link href="/student/tests">
                  <Button variant="ghost" size="icon" className="rounded-full bg-zinc-100 dark:bg-zinc-800">
                     <CalendarIcon className="h-4 w-4" />
                  </Button>
               </Link>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6">
               {dashboard.upcoming_tests.length > 0 ? dashboard.upcoming_tests.map((test) => (
                  <div key={test.id} className="flex gap-4 group p-1 relative flex items-center gap-6 p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                     <div className="h-20 w-20 rounded-[1.5rem] bg-white dark:bg-zinc-950 shadow-lg flex items-center justify-center flex-col shrink-0 group-hover:scale-105 transition-transform">
                        <span className="text-[10px] font-black uppercase text-zinc-400">{new Date(test.start_time).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                        <span className="text-2xl font-black italic leading-none">{new Date(test.start_time).getDate()}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest h-5 px-2 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">{test.type || 'Assessment'}</Badge>
                           {new Date(test.start_time).getTime() - new Date().getTime() < 3600000 && (
                              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter animate-pulse">Live Shortly</span>
                           )}
                        </div>
                        <h4 className="font-black text-xl tracking-tight truncate">{test.title}</h4>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wide mt-2">
                           <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(test.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                           <div className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {test.questions_count} Questions</div>
                        </div>
                     </div>
                     <Link href={`/student/tests/${test.id}/lobby`}>
                        <Button className="h-12 px-6 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-xs hover:scale-[1.05] transition-transform">
                           ENTER LOBBY
                        </Button>
                     </Link>
                  </div>
               )) : (
                  <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                     <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No Tests Scheduled</p>
                  </div>
               )}
            </div>
            <Link href="/student/tests">
               <Button variant="ghost" className="w-full mt-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors py-6 border-2 border-dashed border-zinc-100 dark:border-zinc-900">
                  View All Scheduled Assessments
               </Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* Personalised Insights & Streak */}
        <div className="md:col-span-12 lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl rounded-[3rem] bg-primary text-white p-8 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                       <Award className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-white/20 text-white border-none text-[8px] font-black">{dashboard.achievements.points} PTS</Badge>
                 </div>
                 <h3 className="text-2xl font-black tracking-tight uppercase italic leading-none mb-2">{dashboard.achievements.title}</h3>
                 <p className="text-primary-foreground/80 text-xs font-medium mb-8">
                    {dashboard.achievements.insight || "Keep pushing to unlock your next milestone."}
                 </p>
                 
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span>Progress to level {dashboard.achievements.level + 1}</span>
                       <span>{dashboard.achievements.progress}%</span>
                    </div>
                    <Progress value={dashboard.achievements.progress} className="h-2 bg-white/10 rounded-full" />
                 </div>
              </div>
              <Image 
                 src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop" 
                 alt="Texture" 
                 className="absolute inset-0 object-cover opacity-10 group-hover:scale-110 transition-transform duration-700"
                 fill
              />
           </Card>

           <Card className="border-none shadow-2xl rounded-[3rem] bg-white dark:bg-zinc-950 p-8">
              <div className="flex items-center gap-4 mb-8">
                 <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-orange-500" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black tracking-tighter uppercase italic leading-none">Fire Streak</h3>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{dashboard.stats.streak} Days Active</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                 {dashboard.streak_history.map((active: number, i: number) => (
                    <div 
                       key={i} 
                       className={cn(
                          "h-8 rounded-lg flex items-center justify-center transition-all",
                          active ? "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "bg-zinc-100 dark:bg-zinc-900"
                       )}
                    >
                       {active === 1 && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                 ))}
              </div>
              
              <div className="mt-8 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                 <div className="flex gap-3">
                    <Zap className="h-5 w-5 text-primary shrink-0" />
                    <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 leading-relaxed">
                       AI Tip: {dashboard.ai_tip || "Students with high streaks are 45% more likely to clear cutoffs. Keep going!"}
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
