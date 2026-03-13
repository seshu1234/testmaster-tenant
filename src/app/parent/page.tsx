"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  ChevronRight, 
  Target, 
  ShieldCheck, 
  Clock, 
  Flame,
  ArrowUpRight,
  TrendingDown,
  MessageCircle,
  Download
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface Ward {
  id: string;
  name: string;
  class_name: string;
  roll_no: string;
  avatar_url: string;
  rank_percentile: number;
  study_streak: number;
  improvement_pct: number;
  syllabus_progress: number;
}

interface DashboardStats {
  avg_score: string;
  class_rank: string;
  attendance: string;
  study_hours: string;
}

interface PerformanceItem {
  id: string;
  name: string;
  score: number;
  class_avg: number;
  trend: 'up' | 'down';
}

export default function ParentDashboard() {
  const { user, token, tenantSlug } = useAuth();
  const [wards, setWards] = useState<Ward[]>([]);
  const [activeWard, setActiveWard] = useState<Ward | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [performance, setPerformance] = useState<PerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWards() {
      if (!token) return;
      try {
        const response = await api("/parent/children", {
          token,
          tenant: tenantSlug || undefined
        });
        setWards(response.data || []);
        if (response.data?.length > 0) {
          setActiveWard(response.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch wards:", err);
      }
    }
    fetchWards();
  }, [token, tenantSlug]);

  useEffect(() => {
    async function fetchWardDashboard() {
      if (!token || !activeWard) return;
      setIsLoading(true);
      try {
        const response = await api(`/parent/children/${activeWard.id}/dashboard`, {
          token,
          tenant: tenantSlug || undefined
        });
        setStats(response.data.stats);
        setPerformance(response.data.performance);
      } catch (err) {
        console.error("Failed to fetch ward dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWardDashboard();
  }, [token, tenantSlug, activeWard]);

  const kpis = [
    { title: "Avg Score", value: stats?.avg_score || "0%", icon: Target, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "Class Rank", value: stats?.class_rank || "N/A", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Attendance", value: stats?.attendance || "0%", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { title: "Study Hours", value: stats?.study_hours || "0h", icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ];

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      {/* Header & Child Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase">Family Intelligence</h1>
          <p className="text-muted-foreground text-sm font-medium">Monitoring academic growth and consistency for your children.</p>
        </div>
        
        {wards.length > 1 && (
          <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border dark:border-zinc-800 shadow-sm scrollbar-hide overflow-x-auto">
             {wards.map((ward) => (
               <button
                 key={ward.id}
                 className={cn(
                   "flex items-center gap-3 px-6 py-2 rounded-xl transition-all whitespace-nowrap",
                   activeWard?.id === ward.id 
                     ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg" 
                     : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                 )}
                 onClick={() => setActiveWard(ward)}
               >
                 <div className="h-6 w-6 rounded-full overflow-hidden border">
                    <Image src={ward.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ward.name}`} alt={ward.name} width={24} height={24} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">{ward.name.split(' ')[0]}</span>
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Child Summary Card */}
      {activeWard ? (
        <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-950 p-10 relative overflow-hidden group">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-8">
                 <div className="h-32 w-32 rounded-[3.5rem] bg-primary flex items-center justify-center p-1 shadow-2xl overflow-hidden">
                    <Image src={activeWard.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeWard.name}`} alt={activeWard.name} width={128} height={128} className="object-cover" />
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{activeWard.name}</h2>
                       {activeWard.rank_percentile >= 90 && (
                        <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase px-3 py-1">TOP {100 - activeWard.rank_percentile}%</Badge>
                       )}
                    </div>
                    <p className="text-zinc-400 font-bold text-sm">{activeWard.class_name} • Roll No: {activeWard.roll_no}</p>
                    <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-primary">
                         <Flame className="h-4 w-4" />
                         <span className="text-xs font-black uppercase italic">{activeWard.study_streak} Day Streak</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                         <TrendingUp className="h-4 w-4" />
                         <span className="text-xs font-bold uppercase">+{activeWard.improvement_pct}% Improvement</span>
                      </div>
                    </div>
                 </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-inner flex flex-col items-center gap-4 w-full md:w-auto min-w-[200px]">
                 <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-emerald-500 border-t-zinc-800 animate-[spin_4s_linear_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-white text-lg font-black italic">{activeWard.syllabus_progress}%</span>
                    </div>
                 </div>
                 <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Syllabus Progress</p>
                 </div>
              </div>
           </div>
           <Users className="absolute -bottom-10 -right-10 h-64 w-64 text-white opacity-5 rotate-12" />
        </Card>
      ) : (
        <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-[3rem] animate-pulse">
          <p className="text-zinc-500 font-black uppercase italic tracking-widest">Initialising Guardian Link...</p>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat) => (
          <Card key={stat.title} className="border-none shadow-xl bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all transform duration-300">
            <CardContent className="p-8">
               <div className="flex justify-between items-start mb-6">
                  <div className={cn("p-4 rounded-2xl transition-all group-hover:rotate-12", stat.bg)}>
                     <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
        {/* Recent Performance Details */}
        <Card className="md:col-span-12 lg:col-span-8 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-zinc-950">
           <CardHeader className="p-10 border-b bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="text-2xl font-black tracking-tighter uppercase italic">Academic Transmission</CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase tracking-widest mt-1">Latest assessment outcomes and trends</CardDescription>
                 </div>
                 <Link href="/parent/results">
                   <Button variant="ghost" className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 px-6 font-black text-[10px] uppercase tracking-widest">VIEW FULL HISTORY</Button>
                 </Link>
              </div>
           </CardHeader>
           <CardContent className="p-10">
              <div className="space-y-6">
                 {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] animate-pulse" />
                    ))
                 ) : performance.length > 0 ? (
                   performance.map((item, i) => (
                    <div key={i} className="group flex items-center gap-8 p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                       <div className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                          item.score >= 85 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-amber-50 dark:bg-amber-500/10 text-amber-500"
                       )}>
                          <span className="text-xl font-black italic">{item.score}%</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="font-black text-lg tracking-tight truncate uppercase italic">{item.name}</h4>
                          <div className="flex items-center gap-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.1em] mt-2">
                             <span>Class Avg: {item.class_avg}%</span>
                             <span className={cn("flex items-center gap-1", item.trend === 'up' ? 'text-emerald-500' : 'text-rose-500')}>
                                {item.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {item.trend === 'up' ? 'Exceeding' : 'Below Avg'}
                             </span>
                          </div>
                       </div>
                       <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-950 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                          <ChevronRight className="h-5 w-5" />
                       </Button>
                    </div>
                  ))
                 ) : (
                   <div className="py-20 text-center">
                     <p className="text-zinc-500 font-black uppercase italic tracking-widest">No recent transmission detected.</p>
                   </div>
                 )}
              </div>
           </CardContent>
        </Card>

        {/* Action Sidebar */}
        <div className="md:col-span-12 lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl rounded-[3rem] bg-primary text-white p-8 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
                    <MessageCircle className="h-7 w-7 text-white" />
                 </div>
                 <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white italic">Teacher Engagement</h3>
                 <p className="text-primary-foreground/80 text-xs font-medium leading-relaxed mb-10">
                    Connect with subject experts regarding {activeWard?.name.split(' ')[0] || 'your child'}&apos;s progress.
                 </p>
                 <Link href="/parent/communications">
                   <Button className="w-full bg-white text-black font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                      OPEN COMM CENTER
                   </Button>
                 </Link>
              </div>
              <Image 
                 src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop" 
                 alt="Texture" 
                 className="absolute inset-0 object-cover opacity-10 group-hover:scale-110 transition-transform duration-1000"
                 fill
              />
           </Card>

           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 p-10 flex flex-col items-center text-center gap-8">
              <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-900 rounded-[1.5rem] flex items-center justify-center border dark:border-zinc-800">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                 <h4 className="text-xl font-black italic uppercase tracking-tighter italic">Growth Report Card</h4>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">LATEST GENERATION READY</p>
              </div>
              <Button variant="outline" className="w-full font-black text-[10px] uppercase h-12 rounded-2xl border-zinc-200 dark:border-zinc-800">
                 DOWNLOAD COMPLETE PDF
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
