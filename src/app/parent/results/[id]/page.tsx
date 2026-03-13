"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  BrainCircuit, 
  ChevronLeft,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis,
  ResponsiveContainer,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface ResultDetail {
  id: string;
  title: string;
  subject: string;
  date: string;
  score: number;
  totalMarks: number;
  percentage: number;
  rank: string;
  percentile: string;
  timeTaken: string;
  accuracy: number;
  subjectBreakdown: { subject: string; score: number; color: string }[];
  questions: {
    id: string;
    text: string;
    correct: boolean;
    yourAnswer: string;
    correctAnswer: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    explanation: string;
    timeSpent: string;
  }[];
  ai_insight: string;
  teacher_feedback?: string;
}

export default function DetailedResultPage() {
  const params = useParams();
  const router = useRouter();
  const { token, tenantSlug } = useAuth();
  const [data, setData] = useState<ResultDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      if (!token || !params.id) return;
      setIsLoading(true);
      try {
        const response = await api(`/parent/results/${params.id}`, {
          token,
          tenant: tenantSlug || undefined
        });
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch result details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [token, tenantSlug, params.id]);

  if (isLoading) {
    return (
      <div className="p-10 space-y-8 animate-pulse">
         <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-[3rem]" />
            <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-[3rem]" />
            <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-[3rem]" />
         </div>
         <div className="h-96 bg-zinc-100 dark:bg-zinc-900 rounded-[3rem]" />
      </div>
    );
  }

  if (!data) return <div className="p-20 text-center font-black uppercase italic tracking-widest text-zinc-400">Analysis Data Not Found</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-zinc-100 dark:bg-zinc-900" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
           </Button>
           <div>
              <h1 className="text-3xl font-black tracking-tighter italic uppercase">{data.title}</h1>
              <p className="text-muted-foreground text-sm font-medium">Post-assessment analytical decryption.</p>
           </div>
        </div>
        
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-2xl border-zinc-200 dark:border-zinc-800 font-black text-[10px] uppercase tracking-widest px-6 h-12">
              <Share2 className="mr-2 h-4 w-4" />
              SHARE RESULTS
           </Button>
           <Button className="rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-widest px-6 h-12 shadow-xl hover:scale-105 transition-all">
              <Download className="mr-2 h-4 w-4" />
              DOWNLOAD PDF
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* KPI Row */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="border-none shadow-xl rounded-[2.5rem] bg-emerald-500 text-white p-8">
              <div className="flex justify-between items-start mb-4">
                 <Target className="h-6 w-6 opacity-60" />
                 <Badge className="bg-white/20 text-white border-none font-black text-[8px] px-2 py-0.5 uppercase">Accuracy</Badge>
              </div>
              <div className="text-4xl font-black italic">{data.accuracy}%</div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Target precision reached</p>
           </Card>

           <Card className="border-none shadow-xl rounded-[2.5rem] bg-zinc-900 dark:bg-zinc-950 text-white p-8">
              <div className="flex justify-between items-start mb-4">
                 <Clock className="h-6 w-6 opacity-60" />
                 <Badge className="bg-white/20 text-white border-none font-black text-[8px] px-2 py-0.5 uppercase">Tempo</Badge>
              </div>
              <div className="text-4xl font-black italic">{data.timeTaken}</div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Total runtime</p>
           </Card>

           <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-8">
              <div className="flex justify-between items-start mb-4">
                 <TrendingUp className="h-6 w-6 opacity-60" />
                 <Badge className="bg-white/20 text-white border-none font-black text-[8px] px-2 py-0.5 uppercase">Rank</Badge>
              </div>
              <div className="text-4xl font-black italic">{data.rank}</div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Current class position</p>
           </Card>
        </div>

        {/* Comparison Radar / Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="border-none shadow-2xl rounded-[3rem] bg-white dark:bg-zinc-900 p-8 flex flex-col items-center">
              <div className="w-full mb-6">
                 <h4 className="text-sm font-black italic uppercase tracking-tighter italic">Score Distribution</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">VS CLASS TOPPERS</p>
              </div>
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.subjectBreakdown}>
                       <XAxis dataKey="subject" hide />
                       <Bar dataKey="score" radius={[10, 10, 10, 10]}>
                          {data.subjectBreakdown.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-6 flex justify-between w-full text-[9px] font-black uppercase tracking-widest">
                 <span>Avg: 72%</span>
                 <span className="text-emerald-500">Child: {data.percentage}%</span>
              </div>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Question Review */}
         <div className="lg:col-span-8 space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter italic mb-4">Tactical Review</h3>
            <div className="space-y-4">
               {data.questions.map((q) => (
                  <Card key={q.id} className="border-none shadow-sm rounded-[2rem] bg-white dark:bg-zinc-900/50 overflow-hidden border dark:border-zinc-800">
                     <div className="p-8 flex gap-6">
                        <div className={cn(
                           "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                           q.correct ? "bg-emerald-500" : "bg-rose-500"
                        )}>
                           {q.correct ? <CheckCircle2 className="h-6 w-6 text-white" /> : <XCircle className="h-6 w-6 text-white" />}
                        </div>
                        <div className="flex-1 space-y-4">
                           <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold leading-relaxed">{q.text}</h4>
                              <Badge className={cn(
                                 "text-[8px] font-black uppercase px-2 h-5 border-none ml-4 whitespace-nowrap",
                                 q.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                              )}>{q.difficulty}</Badge>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800">
                                 <p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Child Answer</p>
                                 <p className="text-xs font-bold">{q.yourAnswer}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800">
                                 <p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Correct Answer</p>
                                 <p className="text-xs font-bold text-emerald-500">{q.correctAnswer}</p>
                              </div>
                           </div>

                           <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                              <div className="flex gap-2 items-center mb-1">
                                 <BrainCircuit className="h-4 w-4 text-primary" />
                                 <span className="text-[9px] font-black uppercase text-primary">AI Explanation</span>
                              </div>
                              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed italic">{q.explanation}</p>
                           </div>
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         </div>

         {/* AI Analysis Sidebar */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-950 text-white p-10 relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="h-16 w-16 rounded-3xl bg-primary/20 flex items-center justify-center mb-8">
                     <BrainCircuit className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase italic tracking-tighter mb-4 leading-none text-primary">Strategic Insight</h3>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-10 italic">
                     &quot;{data.ai_insight}&quot;
                  </p>
                  <Button className="w-full bg-white text-black font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
                     UNPACK FULL META-DATA
                  </Button>
               </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-900 p-8">
               <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Mentor&apos;s Note</h4>
               </div>
               <p className="text-xs font-medium italic text-zinc-500 leading-relaxed">
                  {data.teacher_feedback || "Excellent grasp of core concepts. Speed in section B needs calibration to avoid early fatigue."}
               </p>
            </Card>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-4">Subject Efficiency</h4>
               {data.subjectBreakdown.map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border dark:border-zinc-800 space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase italic italic">{s.subject}</span>
                        <span className="text-xs font-black">{s.score}%</span>
                     </div>
                     <Progress value={s.score} className="h-1.5" />
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
