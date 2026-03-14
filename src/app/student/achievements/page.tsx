"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Award, 
  Zap, 
  Flame, 
  Target, 
  Trophy, 
  Clock, 
  BookOpen, 
  Lock, 
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Star,
  Loader2,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

const iconMap: Record<string, LucideIcon> = {
  Zap, Flame, Target, Trophy, Clock, BookOpen, Star, Award
};

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'earned' | 'locked';
  date?: string;
  progress: number;
}

interface AchievementData {
  badges: BadgeItem[];
  stats: {
    badges_count: number;
    mastery_points: number;
    level: string;
    rank_title: string;
    global_status: string;
  };
  heatmap: { date: string; intensity: number; count: number }[];
}

export default function StudentAchievementsPage() {
  const { token, tenantSlug } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'earned' | 'locked'>('all');
  const [data, setData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      if (!token) return;
      try {
        const response = await api('/student/achievements', {
          token,
          tenant: tenantSlug || undefined
        });
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, [token, tenantSlug]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const filteredBadges = data.badges.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      {/* Achievement Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-8 py-16 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="max-w-xl space-y-4">
              <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5">
                 Hall of Fame
              </Badge>
              <h1 className="text-5xl font-black tracking-tighter uppercase leading-tight">Master the Path</h1>
              <p className="text-zinc-500 text-lg font-medium">
                 Your journey is marked by milestones. Every badge earned is a step towards total mastery.
              </p>
              
              <div className="flex items-center gap-8 mt-8">
                 <div className="text-center">
                    <p className="text-4xl font-black">{data.stats.badges_count}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Badges Earned</p>
                 </div>
                 <div className="h-12 w-[1px] bg-white/10" />
                 <div className="text-center">
                    <p className="text-4xl font-black">{data.stats.mastery_points}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Mastery Points</p>
                 </div>
                 <div className="h-12 w-[1px] bg-white/10" />
                 <div className="text-center">
                    <p className="text-4xl font-black">{data.stats.level}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{data.stats.rank_title}</p>
                 </div>
              </div>
           </div>

           <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-inner flex flex-col items-center gap-6">
              <div className="h-24 w-24 rounded-3xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.3)] animate-pulse">
                 <Star className="h-10 w-10 text-white" />
              </div>
              <div className="text-center space-y-2">
                 <p className="text-xl font-black uppercase">{data.stats.global_status}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Global Status</p>
              </div>
           </div>
        </div>
        
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-125">
           <Award className="h-64 w-64" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border dark:border-zinc-800 shadow-sm w-fit">
         {['all', 'earned', 'locked'].map((t) => (
           <button
             key={t}
             className={cn(
               "px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
               activeTab === t 
                 ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg" 
                 : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
             )}
             onClick={() => setActiveTab(t as 'all' | 'earned' | 'locked')}
           >
             {t}
           </button>
         ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {filteredBadges.map((badge) => {
            const IconComp = iconMap[badge.icon] || Trophy;
            return (
              <Card key={badge.id} className={cn(
                 "border shadow-md rounded-2xl p-8 overflow-hidden relative group transition-all duration-500",
                 badge.status === 'earned' ? "bg-white dark:bg-zinc-950" : "bg-zinc-100 dark:bg-zinc-900 opacity-80"
              )}>
                 <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                       <div className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 bg-primary/5 text-primary"
                        )}>
                          <IconComp className="h-8 w-8" />
                       </div>
                       {badge.status === 'earned' ? (
                          <div className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                             <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          </div>
                       ) : (
                          <div className="h-6 w-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                             <Lock className="h-3 w-3 text-zinc-400" />
                          </div>
                       )}
                    </div>

                    <div className="space-y-2 mb-8">
                       <h3 className="text-xl font-black uppercase tracking-tighter">{badge.title}</h3>
                       <p className="text-xs font-bold text-zinc-400 leading-relaxed">{badge.description}</p>
                    </div>

                    <div className="mt-auto">
                       {badge.status === 'earned' ? (
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 border-t pt-4">
                             <span>Unlocked</span>
                             <span>{badge.date}</span>
                          </div>
                       ) : (
                          <div className="space-y-4 pt-4 border-t border-dashed">
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                <span>Mission Progress</span>
                                <span>{badge.progress}%</span>
                             </div>
                             <Progress value={badge.progress} className="h-2 bg-zinc-200 dark:bg-zinc-800" />
                          </div>
                       )}
                    </div>
                 </div>
                 
                 {badge.status === 'earned' && (
                    <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                 )}
              </Card>
            )
         })}
      </div>

      {/* Motivation Heatmap */}
      <Card className="border-none shadow-xl rounded-3xl bg-white dark:bg-zinc-950 p-10">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter">Study Intensity Heatmap</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Daily consistency over the last 6 months</p>
            </div>
            <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 px-6 py-2.5 rounded-2xl border dark:border-zinc-800">
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Intensity</span>
               <div className="flex gap-1.5">
                  {[0.1, 0.3, 0.6, 0.9].map((v, i) => (
                     <div key={i} className="h-3 w-3 rounded-sm bg-primary" style={{ opacity: v }} />
                  ))}
               </div>
            </div>
         </div>

         <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 min-w-[800px]">
               {/* Regroup data by weeks */}
               {(() => {
                  const weeks = [];
                  for (let i = 0; i < data.heatmap.length; i += 7) {
                    weeks.push(data.heatmap.slice(i, i + 7));
                  }
                  return weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1.5">
                       {week.map((day, dayIndex) => (
                          <div 
                             key={dayIndex} 
                             className={cn(
                                "h-4 w-4 rounded-sm transition-all hover:scale-125 cursor-help",
                                day.intensity === 0 ? "bg-zinc-100 dark:bg-zinc-900" : "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                             )}
                             style={{ opacity: day.intensity > 0 ? day.intensity : 1 }}
                             title={`${day.date}: ${day.count} activities`}
                          />
                       ))}
                    </div>
                  ));
               })()}
            </div>
         </div>
         
         <div className="mt-10 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
               <Flame className="h-7 w-7 text-orange-500" />
            </div>
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 leading-relaxed">
               &quot;The difference between ordinary and extraordinary is that little extra. Your streak is becoming <span className="text-orange-500 font-black">legendary</span>.&quot; 
               <span className="block text-[10px] font-black uppercase tracking-widest mt-2 text-zinc-400">— AI Motivation Engine</span>
            </p>
         </div>
      </Card>

      {/* Rewards & Next Level */}
      <Card className="border-none shadow-2xl rounded-3xl bg-primary p-12 text-white relative overflow-hidden group">
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="max-w-xl space-y-6">
               <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">{data.stats.level} Ascension</h3>
               <p className="text-primary-foreground/80 text-lg font-medium leading-relaxed">
                  Earn more mastery points to reach the next level and unlock custom profile themes and prime badge indicators.
               </p>
               <Button className="bg-white text-black font-black px-10 h-14 rounded-2xl group-hover:scale-105 transition-all">
                  MISSION LOG <ChevronRight className="ml-2 h-5 w-5" />
               </Button>
            </div>
            
            <div className="h-40 w-40 rounded-full border-8 border-white/20 flex items-center justify-center relative">
               <div className="absolute inset-0 rounded-full border-8 border-white border-t-transparent animate-[spin_4s_linear_infinite]" />
               <TrendingUp className="h-12 w-12 text-white" />
            </div>
         </div>
         <Badge className="absolute top-8 right-8 bg-white/10 text-white border-none text-[8px] font-black uppercase tracking-widest px-4 py-2">
            Legendary Rewards Ahead
         </Badge>
      </Card>
    </div>
  );
}
