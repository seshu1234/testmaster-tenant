"use client";

import { useState, useEffect } from "react";
import { 
  Users,
  TrendingUp,
  Zap,
  Gem
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

interface ComparisonData {
  category: string;
  child1: number;
  child2: number;
}

interface ChildSummary {
  id: string;
  name: string;
  avatar: string;
  avgScore: number;
  testsTaken: number;
  streak: number;
  rank: string;
}

export default function FamilyDashboardPage() {
  const { token, tenantSlug } = useAuth();
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [comparison, setComparison] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFamilyData() {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await api("/parent/family/comparison", {
          token,
          tenant: tenantSlug || undefined
        });
        setChildren(response.data.children || []);
        setComparison(response.data.chart_data || []);
      } catch (err) {
        console.error("Failed to fetch family data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFamilyData();
  }, [token, tenantSlug]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div>
         <h1 className="text-3xl font-black tracking-tighter italic uppercase">Family Intelligence Matrix</h1>
         <p className="text-muted-foreground text-sm font-medium">Side-by-side performance telemetry for multi-ward synchronization.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-[3rem] animate-pulse" />
           <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-[3rem] animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {children.map((child, i) => (
              <Card key={child.id} className={cn(
                 "border-none shadow-2xl rounded-[3rem] p-10 overflow-hidden relative group transition-all hover:scale-[1.02]",
                 i === 0 ? "bg-zinc-900 text-white" : "bg-white dark:bg-zinc-900"
              )}>
                 <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="h-32 w-32 rounded-[3.5rem] bg-primary p-1 shadow-2xl shrink-0">
                       <Image 
                          src={child.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`} 
                          alt={child.name} 
                          width={128} height={128}
                          className="h-full w-full object-cover rounded-[3.3rem]"
                       />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                          <Badge className="bg-primary text-white border-none font-black text-[8px] px-3 py-1 uppercase tracking-widest">G-Level Optimized</Badge>
                          <Badge variant="outline" className="text-[8px] font-black uppercase px-3 py-1 border-white/20">Term 2 Active</Badge>
                       </div>
                       <h2 className="text-4xl font-black italic uppercase italic tracking-tighter leading-none mb-4">{child.name}</h2>
                       <div className="grid grid-cols-3 gap-6">
                          <div>
                             <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Avg Score</p>
                             <p className="text-2xl font-black italic">{child.avgScore}%</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Streak</p>
                             <p className="text-2xl font-black italic text-emerald-500">{child.streak}🔥</p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Rank</p>
                             <p className="text-2xl font-black italic">{child.rank}</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 {i === 0 && <Users className="absolute -bottom-10 -right-10 h-48 w-48 text-white opacity-5 rotate-12" />}
              </Card>
           ))}
        </div>
      )}

      {/* Cross-Comparison Chart */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white dark:bg-zinc-950 p-12">
         <div className="flex justify-between items-center mb-12">
            <div>
               <h3 className="text-2xl font-black italic uppercase italic tracking-tighter">Correlation Analysis</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">CROSS-WARD COMPETENCY MAPPING</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-zinc-900 dark:bg-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{children[0]?.name}</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{children[1]?.name}</span>
               </div>
            </div>
         </div>

         <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={comparison} barGap={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                     dataKey="category" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fontWeight: 900 }}
                  />
                  <YAxis hide />
                  <Tooltip 
                     cursor={{ fill: 'transparent' }}
                     contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                     itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                  />
                  <Bar dataKey="child1" fill="#000" radius={[12, 12, 12, 12]} />
                  <Bar dataKey="child2" fill="#3B82F6" radius={[12, 12, 12, 12]} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </Card>

      {/* Strategic Synergy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
           { label: 'Combined Points', value: '18.4k', icon: Gem, color: 'text-amber-500' },
           { label: 'Weekly Velocity', value: '+22%', icon: TrendingUp, color: 'text-emerald-500' },
           { label: 'Global Ranking', value: 'Top 2%', icon: Zap, color: 'text-primary' }
         ].map((stat, i) => (
            <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-900 p-8 flex items-center justify-between group hover:border-primary transition-all">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-black italic uppercase italic tracking-tighter">{stat.value}</p>
               </div>
               <div className={cn("p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950", stat.color)}>
                  <stat.icon className="h-6 w-6" />
               </div>
            </Card>
         ))}
      </div>
    </div>
  );
}
