"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TrendingUp, 
  ArrowUpRight, 
  Target, 
  BrainCircuit, 
  Zap, 
  ArrowRight,
  Flame,
  Gem,
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis 
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface PerformanceData {
  month: string;
  score: number;
  avg: number;
}

interface ConceptualData {
  subject: string;
  value: number;
  fullMark: number;
}

interface SubjectStat {
  subject: string;
  score: number;
  color: string;
  trend: string;
  level: string;
  vsAvg: string;
}

interface Ward {
  id: string;
  name: string;
}

export default function PerformancePage() {
  const { token, tenantSlug } = useAuth();
  const [activeSubject, setActiveSubject] = useState('All Subjects');
  const [wards, setWards] = useState<Ward[]>([]);
  const [activeWardId, setActiveWardId] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [conceptualData, setConceptualData] = useState<ConceptualData[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWards() {
      if (!token) return;
      try {
        const response = await api("/parent/children", {
          token,
          tenant: tenantSlug || undefined
        });
        const fetchedWards = response.data || [];
        setWards(fetchedWards);
        if (fetchedWards.length > 0 && !activeWardId) {
          setActiveWardId(fetchedWards[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch wards:", err);
      }
    }
    fetchWards();
  }, [token, tenantSlug, activeWardId]);

  useEffect(() => {
    async function fetchPerformance() {
      if (!token || !activeWardId) return;
      setIsLoading(true);
      try {
        const response = await api(`/parent/performance/${activeWardId}/overview?subject=${activeSubject}`, {
          token,
          tenant: tenantSlug || undefined
        });
        setPerformanceData(response.data.chart_data);
        setConceptualData(response.data.cognitive_map);
        setSubjectStats(response.data.subject_breakdown);
        setInsight(response.data.ai_observation);
      } catch (err) {
        console.error("Failed to fetch performance data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPerformance();
  }, [token, tenantSlug, activeWardId, activeSubject]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-zinc-600 font-black tracking-tighter  uppercase">Intelligence Metrics</h1>
          <p className="text-zinc-600 font-medium">Deep analytics mapping your child&apos;s academic evolution.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {wards.length > 1 && (
            <div className="flex bg-white p-1 rounded-xl border shadow-sm overflow-x-auto scrollbar-hide">
              {wards.map((ward) => (
                <button
                  key={ward.id}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                    activeWardId === ward.id 
                      ? "bg-primary text-white" 
                      :  "text-zinc-600 "
                  )}
                  onClick={() => setActiveWardId(ward.id)}
                >
                  {ward.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm overflow-x-auto scrollbar-hide">
             {['All Subjects', 'Physics', 'Chemistry', 'Mathematics'].map((s) => (
               <button
                 key={s}
                 className={cn(
                   "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                   activeSubject === s 
                     ? "bg-zinc-900 text-white shadow-lg" 
                     :  "text-zinc-600 "
                 )}
                 onClick={() => setActiveSubject(s)}
               >
                 {s}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Performance Chart */}
        <Card className="lg:col-span-8 border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
           <CardHeader className="p-10 border-b bg-zinc-50/50">
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="text-zinc-600 font-black tracking-tighter uppercase ">Growth Trajectory</CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase tracking-widest mt-1">Consistency vs Grade Benchmark</CardDescription>
                 </div>
                 <Badge className="bg-emerald-500/10 text-zinc-600 border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5">
                    Live Updates
                 </Badge>
              </div>
           </CardHeader>
           <CardContent className="p-10">
              <div className="h-[400px] w-full mt-4">
                {isLoading ? (
                  <div className="h-full w-full bg-zinc-50 rounded-3xl animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                         dataKey="month" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fontWeight: 900 }}
                      />
                      <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fontWeight: 900 }}
                      />
                      <Tooltip 
                         contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                         itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                      />
                      <Line 
                         type="monotone" 
                         dataKey="score" 
                         stroke="#000" 
                         strokeWidth={4} 
                         dot={{ r: 6, fill: '#000', strokeWidth: 2, stroke: '#fff' }}
                         activeDot={{ r: 8 }}
                      />
                      <Line 
                         type="monotone" 
                         dataKey="avg" 
                         stroke="#94A3B8" 
                         strokeWidth={2} 
                         strokeDasharray="5 5" 
                         dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
           </CardContent>
        </Card>

        {/* Aptitude Radar */}
        <Card className="lg:col-span-4 border-none shadow-2xl rounded-[3rem] bg-zinc-950 text-zinc-600 p-10 flex flex-col items-center">
           <div className="text-zinc-600 space-y-2 mb-10 w-full">
              <h3 className="text-zinc-600 font-black  uppercase tracking-tighter">Cognitive Map</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Skill alignment across 5 dimensions</p>
           </div>
           
           <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="h-full w-full bg-white/5 rounded-full animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={conceptualData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#666', fontSize: 8, fontWeight: 900 }} 
                      />
                      <Radar
                        name="Aptitude"
                        dataKey="value"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.4}
                      />
                  </RadarChart>
                </ResponsiveContainer>
              )}
           </div>

           <div className="mt-8 p-6 rounded-[2rem] bg-white/5 border border-white/10 w-full min-h-[120px]">
              <div className="flex items-center gap-4 mb-3">
                 <BrainCircuit className="h-5 w-5 text-zinc-600" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">AI Observation</span>
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
                </div>
              ) : (
                <p className="text-xl font-bold leading-relaxed text-zinc-600">
                  {insight || "Aggregating performance meta-data for conceptual analysis..."}
                </p>
              )}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject-wise Cards */}
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-zinc-100 rounded-[2.5rem] animate-pulse" />
          ))
        ) : (
          subjectStats.map((subject, i) => (
            <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 group hover:scale-[1.05] transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
                      <Target className={cn("h-6 w-6", subject.color)} />
                  </div>
                  <Badge className="bg-zinc-50 text-zinc-600 border-none font-black text-[8px] px-3 py-1 uppercase">{subject.level}</Badge>
                </div>
                <h4 className="text-zinc-600 font-black  uppercase  tracking-tighter mb-2">{subject.subject}</h4>
                <div className="flex items-end gap-3">
                  <div className="text-zinc-600 font-black ">{subject.score}%</div>
                  <div className={cn("text-[10px] font-black uppercase mb-1", subject.trend.startsWith('+') ? 'te' : 'te')}>
                      {subject.trend}
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-600">
                  <span>vs Class Avg: {subject.vsAvg}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
            </Card>
          ))
        )}
      </div>

      {/* AI Performance Insights */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-primary p-12 text-zinc-600 relative overflow-hidden group">
         <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
               <div className="h-16 w-16 rounded-3xl bg-white/20 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-zinc-600" />
               </div>
               <h3 className="text-zinc-600 font-black  uppercase  tracking-tighter leading-none">Executive Insights</h3>
               <p className="te/90 font-medium leading-relaxed max-w-md">
                 Our neural engine monitors score velocity and error mitigation patterns to provide real-time rank predictions.
               </p>
               <div className="flex gap-4">
                  <Button className="bg-white text-zinc-600 font-black h-12 px-8 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                    REQUEST DEEP COUNSELING
                  </Button>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Consistency', value: performanceData.length > 0 ? (performanceData[performanceData.length-1].score > 70 ? 'High' : 'Medium') : 'TBD', icon: Flame },
                 { label: 'Rank Target', value: insight ? 'Top00' : 'TBD', icon: Target },
                 { label: 'Score Alpha', value: performanceData.length > 1 ? `+${(performanceData[performanceData.length-1].score - performanceData[0].score).toFixed(0)}%` : '0%', icon: TrendingUp },
                 { label: 'Confidence', value: insight ? '95%' : 'N/A', icon: Gem }
               ].map((mod, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
                     <mod.icon className="h-5 w-5 mb-3 opacity-60" />
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{mod.label}</p>
                     <p className="text-zinc-600 font-black   uppercase">{mod.value}</p>
                  </div>
               ))}
            </div>
         </div>
         <ArrowRight className="absolute -bottom-20 -right-20 h-96 w-96 text-zinc-600 opacity-5 rotate-45" />
      </Card>
    </div>
  );
}
