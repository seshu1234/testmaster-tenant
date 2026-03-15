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
    { title: "Avg Score", value: stats?.avg_score || "0%", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Class Rank", value: stats?.class_rank || "N/A", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Attendance", value: stats?.attendance || "0%", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Study Hours", value: stats?.study_hours || "0h", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      {/* Header & Child Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-zinc-600 font-black tracking-tighter  uppercase">Family Intelligence</h1>
          <p className="text-zinc-600 font-medium">Monitoring academic growth and consistency for your children.</p>
        </div>
        
        {wards.length > 1 && (
          <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm scrollbar-hide overflow-x-auto">
             {wards.map((ward) => (
               <button
                 key={ward.id}
                 className={cn(
                   "flex items-center gap-3 px-6 py-2 rounded-xl transition-all whitespace-nowrap",
                   activeWard?.id === ward.id 
                     ? "bg-zinc-900 text-white shadow-lg" 
                     :  "text-zinc-600 "
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
                       <h2 className="text-zinc-600 font-black uppercase tracking-tighter">{activeWard.name}</h2>
                       {activeWard.rank_percentile >= 90 && (
                        <Badge className="bg-emerald-500 text-zinc-600 border-none text-[8px] font-black uppercase px-3 py-1">TOP {100 - activeWard.rank_percentile}%</Badge>
                       )}
                    </div>
                    <p className="text-xl font-bold text-zinc-600">{activeWard.class_name} • Roll No: {activeWard.roll_no}</p>
                    <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-zinc-600">
                         <Flame className="h-4 w-4" />
                         <span className="text-zinc-600 font-black uppercase ">{activeWard.study_streak} Day Streak</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600">
                         <TrendingUp className="h-4 w-4" />
                         <span className="text-xl font-bold uppercase">+{activeWard.improvement_pct}% Improvement</span>
                      </div>
                    </div>
                 </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-inner flex flex-col items-center gap-4 w-full md:w-auto min-w-[200px]">
                 <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-emerald-500 border-t-zinc-800 animate-[spin_4s_linear_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-zinc-600 font-black ">{activeWard.syllabus_progress}%</span>
                    </div>
                 </div>
                 <div className="text-zinc-600">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Syllabus Progress</p>
                 </div>
              </div>
           </div>
           <Users className="absolute -bottom-10 -right-10 h-64 w-64 text-zinc-600 opacity-5 rotate-12" />
        </Card>
      ) : (
        <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-[3rem] animate-pulse">
          <p className="text-zinc-600 font-black uppercase  tracking-widest">Initialising Guardian Link...</p>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat) => (
          <Card key={stat.title} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all transform duration-300">
            <CardContent className="p-8">
               <div className="flex justify-between items-start mb-6">
                  <div className={cn("p-4 rounded-2xl transition-all group-hover:rotate-12", stat.bg)}>
                     <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{stat.title}</p>
                  <div className="text-zinc-600 font-black  tracking-tight">{stat.value}</div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Recent Performance Details */}
        <Card className="md:col-span-12 lg:col-span-8 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
           <CardHeader className="p-10 border-b bg-zinc-50/50">
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="text-zinc-600 font-black tracking-tighter uppercase ">Academic Transmission</CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase tracking-widest mt-1">Latest assessment outcomes and trends</CardDescription>
                 </div>
                 <Link href="/parent/results">
                   <Button variant="ghost" className="rounded-2xl bg-zinc-100 px-6 font-black text-[10px] uppercase tracking-widest">VIEW FULL HISTORY</Button>
                 </Link>
              </div>
           </CardHeader>
           <CardContent className="p-10">
              <div className="space-y-6">
                 {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 bg-zinc-100 rounded-[2rem] animate-pulse" />
                    ))
                 ) : performance.length > 0 ? (
                   performance.map((item, i) => (
                    <div key={i} className="group flex items-center gap-8 p-6 rounded-[2rem] bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all">
                       <div className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                          item.score >= 85 ? "bg-emerald-50 text-zinc-600" : "bg-amber-50 text-zinc-600"
                       )}>
                          <span className="text-zinc-600 font-black ">{item.score}%</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="font-black text-zinc-600 tracking-tight truncate uppercase ">{item.name}</h4>
                          <div className="flex items-center gap-4 text-[9px] font-black text-zinc-600 uppercase tracking-[0.1em] mt-2">
                             <span>Class Avg: {item.class_avg}%</span>
                             <span className={cn("flex items-center gap-1", item.trend === 'up' ? 'text-emerald-600' : 'text-rose-600')}>
                                {item.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {item.trend === 'up' ? 'Exceeding' : 'Below Avg'}
                             </span>
                          </div>
                       </div>
                       <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white hover:bg-black  transition-all">
                          <ChevronRight className="h-5 w-5" />
                       </Button>
                    </div>
                  ))
                 ) : (
                   <div className="py-20 text-zinc-600">
                     <p className="text-zinc-600 font-black uppercase  tracking-widest">No recent transmission detected.</p>
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
                    <MessageCircle className="h-7 w-7 text-zinc-600" />
                 </div>
                 <h3 className="text-zinc-600 font-black  uppercase tracking-tighter mb-4 leading-none text-zinc-600 ">Teacher Engagement</h3>
                 <p className="text-zinc-600 font-medium leading-relaxed mb-10 opacity-80">
                    Connect with subject experts regarding {activeWard?.name.split(' ')[0] || 'your child'}&apos;s progress.
                 </p>
                 <Link href="/parent/communications">
                   <Button className="w-full bg-white text-zinc-600 font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                      OPEN COMM CENTER
                   </Button>
                 </Link>
              </div>
              <Image 
                 src="https://images.unsplash.com/photo-485-d8c1af93d400?q=80&w=2070&auto=format&fit=crop" 
                 alt="Texture" 
                 className="absolute inset-0 object-cover opacity-10 group-hover:scale-110 transition-transform duration-1000"
                 fill
              />
           </Card>

           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 flex flex-col items-center text-zinc-600 gap-8">
              <div className="h-16 w-16 bg-zinc-50 rounded-[1.5rem] flex items-center justify-center border">
                <Download className="h-6 w-6 text-zinc-600" />
              </div>
              <div>
                 <h4 className="text-zinc-600 font-black  uppercase tracking-tighter ">Growth Report Card</h4>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">LATEST GENERATION READY</p>
              </div>
              <Button variant="outline" className="w-full font-black text-[10px] uppercase h-12 rounded-2xl border-zinc-200">
                 DOWNLOAD COMPLETE PDF
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
