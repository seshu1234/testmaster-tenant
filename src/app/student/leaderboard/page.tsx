"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronRight, 
  Award,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
  trend: string;
  badges: string[];
  highlighted?: boolean;
}

interface Neighbors {
  target_name?: string;
  target_rank?: number;
  gap?: number;
}

export default function StudentLeaderboardPage() {
  const { token, tenantSlug } = useAuth();
  const [view, setView] = useState<'batch' | 'centre' | 'global'>('batch');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [neighbors, setNeighbors] = useState<Neighbors | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!token) return;
      setLoading(true);
      try {
        const response = await api("/student/leaderboard", {
          token,
          tenant: tenantSlug || undefined,
          params: { view }
        });
        if (response.success) {
          setLeaderboard(response.data.leaderboard);
          setNeighbors(response.data.neighbors);
        }
      } catch (error) {
        console.error("Leaderboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [token, tenantSlug, view]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-rose-500" />;
      default: return <Minus className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return "bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-amber-200 dark:border-amber-900/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]";
      case 2: return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 border-zinc-200 shadow-[0_0_20px_rgba(113,113,122,0.2)]";
      case 3: return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 border-orange-200 shadow-[0_0_20px_rgba(249,115,22,0.2)]";
      default: return "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Champions League</h1>
          <p className="text-muted-foreground text-sm font-medium">Real-time rankings across your batch and centre. Stay competitive.</p>
        </div>
        <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-2xl border dark:border-zinc-800 shadow-sm">
           {['batch', 'centre', 'global'].map((v) => (
             <button
               key={v}
               className={cn(
                 "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                 view === v 
                   ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg" 
                   : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
               )}
                onClick={() => setView(v as 'batch' | 'centre' | 'global')}
             >
               {v}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top 3 Focus */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
           {loading ? (
             [1,2,3].map(i => <div key={i} className="h-64 bg-secondary rounded-2xl animate-pulse" />)
           ) : leaderboard.length > 0 ? (
             leaderboard.slice(0, 3).map((student) => (
                <Card key={student.id} className={cn("border shadow-md rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden group", getRankStyle(student.rank))}>
                   <div className="relative z-10 space-y-4">
                      <div className="h-20 w-20 rounded-2xl bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-center relative mx-auto group-hover:scale-105 transition-transform">
                         <span className="text-3xl font-black">{student.name.charAt(0)}</span>
                         <div className="absolute -top-3 -right-3 h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black animate-bounce shadow-xl">
                            {student.rank}
                         </div>
                      </div>
                      <div>
                         <h3 className="text-xl font-black uppercase tracking-tighter truncate">{student.name}</h3>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Score: {student.score}</p>
                      </div>
                      <div className="flex gap-1 justify-center">
                         {student.badges.map(b => (
                            <div key={b} className="h-6 w-6 rounded-lg bg-zinc-900/10 flex items-center justify-center">
                               <Award className="h-3 w-3" />
                            </div>
                         ))}
                      </div>
                   </div>
                   {student.rank === 1 && <Star className="absolute top-6 right-6 h-12 w-12 text-amber-500/10 rotate-12" />}
                </Card>
             ))
           ) : (
             <div className="col-span-3 text-center py-20 bg-secondary/20 rounded-2xl font-black uppercase tracking-widest text-zinc-400">
                No rankings available yet.
             </div>
           )}
        </div>

        {/* Detailed Leaderboard Table */}
        <Card className="lg:col-span-8 border-none shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-zinc-950">
            <CardHeader className="p-6 border-b bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Ranking Roster</CardTitle>
                  <CardDescription className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Full standings for {view} division</CardDescription>
               </div>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                 <input 
                    type="text" 
                    placeholder="Search student..." 
                    className="pl-9 pr-4 py-2 bg-zinc-100 dark:bg-white/5 rounded-xl border-none text-[10px] font-black uppercase tracking-widest outline-none"
                 />
              </div>
           </CardHeader>
           <CardContent className="p-0">
              <div className="divide-y dark:divide-zinc-800">
                 {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                       <div key={i} className="flex items-center justify-between p-6 px-10 animate-pulse">
                          <div className="flex items-center gap-6">
                             <div className="h-6 w-8 bg-secondary rounded" />
                             <div className="h-12 w-12 rounded-2xl bg-secondary" />
                             <div className="h-4 w-32 bg-secondary rounded" />
                          </div>
                          <div className="h-8 w-24 bg-secondary rounded" />
                       </div>
                    ))
                 ) : leaderboard.map((student) => (
                    <div 
                       key={student.id} 
                       className={cn(
                          "flex items-center justify-between p-6 px-10 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group",
                          student.highlighted && "bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary"
                       )}
                    >
                       <div className="flex items-center gap-6">
                          <span className={cn(
                             "text-lg font-black w-8",
                             student.rank <= 3 ? "text-primary" : "text-zinc-300"
                          )}>
                             {student.rank}
                          </span>
                          <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                             {student.name.charAt(0)}
                          </div>
                          <div>
                             <h4 className="font-black text-sm uppercase tracking-tight">{student.name}</h4>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-zinc-400">#{student.rank} Overall</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-12">
                          <div className="text-right">
                             <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Score</p>
                             <span className="text-lg font-black">{student.score}</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                             <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Trend</p>
                             {getTrendIcon(student.trend)}
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                             <ChevronRight className="h-4 w-4" />
                          </Button>
                       </div>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>

         {/* Neighbors & Personal Insights Sidebar */}
         <div className="lg:col-span-4 space-y-6">
            {neighbors && neighbors.target_name && (
               <Card className="border shadow-md rounded-2xl bg-zinc-900 text-white p-6 overflow-hidden relative group">
                  <div className="relative z-10">
                     <h3 className="text-lg font-black uppercase tracking-tighter mb-4">Next Target</h3>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-xs text-primary animate-pulse">
                              #{neighbors.target_rank}
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Beat {neighbors.target_name}</p>
                              <p className="text-xs font-bold">Gap: {neighbors.gap} PTS <span className="text-[8px] opacity-60">to rank up</span></p>
                           </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                           <p className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-tighter">
                              &quot;You&apos;re closing the gap fast. Prediction: You will overtake soon.&quot;
                           </p>
                        </div>
                        <Button size="sm" className="w-full bg-white text-black font-black rounded-xl h-10 text-[10px]">
                           VIEW CHALLENGE
                        </Button>
                     </div>
                  </div>
               </Card>
            )}
         </div>
      </div>
    </div>
  );
}
