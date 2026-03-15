"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Trophy,
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Download,
  Share2,
  BookOpen,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

interface ResultData {
  obtained_marks: number;
  total_marks: number;
  percentage: number;
  rank?: number;
  percentile?: number;
  accuracy?: number;
  time_spent_seconds: number;
  status: string;
  test?: {
    title: string;
    subject: string;
  };
  answers: Array<{
    id: number;
    question_id: string;
    status: 'correct' | 'incorrect' | 'unattempted';
    marks_obtained: number;
    user_answer: string;
    question: {
      content: string;
      answer: string;
      explanation: string;
      subject: string;
      topic: string;
    }
  }>;
}

export default function StudentTestResultPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt");
  const { token, tenantSlug } = useAuth();
  const router = useRouter();

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      if (!token || !attemptId) {
        setLoading(false);
        return;
      }
      try {
        const response = await api(`/student/attempts/${attemptId}/result`, {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setResult(response.data);
        }
      } catch (err) {
        console.error("Result fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [token, attemptId, tenantSlug]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-600" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Synchronizing Assessment Outcome...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 p-12 text-zinc-600">
        <AlertCircle className="h-16 w-16 text-zinc-600" />
        <h2 className="text-zinc-600 font-black uppercase tracking-tight">Outcome Not Found</h2>
        <p className="text-zinc-600 max-w-md font-medium">We couldn&apos;t retrieve the diagnostics for this assessment. It may still be in the neural grading queue.</p>
        <Button onClick={() => router.back()} className="rounded-xl px-10 h-12 bg-black text-zinc-600 font-black">RETURN TO BASE</Button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Helper to calculate subject breakdown from answers
  const subjectBreakdown = result.answers.reduce((acc, answer) => {
    const subjectName = answer.question.subject;
    if (!acc[subjectName]) {
      acc[subjectName] = { score: 0, total: 0, correctCount: 0, totalQuestions: 0 };
    }
    acc[subjectName].score += answer.marks_obtained;
    acc[subjectName].total += 1; // Assuming mark per question for total as a base calculation
    if (answer.status === 'correct') {
      acc[subjectName].correctCount += 1;
    }
    acc[subjectName].totalQuestions += 1;
    return acc;
  }, {} as Record<string, { score: number; total: number; correctCount: number; totalQuestions: number }>);

  const subjectsFormatted = Object.entries(subjectBreakdown).map(([name, data]) => ({
    name,
    score: data.score,
    total: data.totalQuestions, // Using totalQuestions as total for now
    accuracy: data.totalQuestions > 0 ? Math.round((data.correctCount / data.totalQuestions) * 100) : 0,
    color: 'text-primary'
  }));


  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      {/* Hero Score Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border-b px-8 py-16 text-zinc-600 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex flex-col gap-4 text-zinc-600 md:te">
              <Badge className="w-fit bg-emerald-500/20 text-zinc-600 border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 mx-auto md:mx-0">
                 {result.percentage >= 80 ? "Excellent Performance" : result.percentage >= 60 ? "Good Performance" : "Requires Improvement"}
              </Badge>
              <h1 className="text-zinc-600 font-black tracking-tighter uppercase leading-none">
                 {result.percentage >= 80 ? "Victory!" : "Result Card"}
              </h1>
              <p className="text-zinc-600 font-medium max-w-md">
                 {result.test?.title} • {result.test?.subject} • {formatTime(result.time_spent_seconds)}
              </p>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                 <Button 
                   onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/student/attempts/${attemptId}/result/pdf`, '_blank')}
                   className="bg-white text-zinc-600 font-black px-8 h-12 rounded-xl"
                  >
                    <Download className="h-4 w-4 mr-2" /> PDF REPORT
                 </Button>
                 <Button variant="outline" className="bg-white/5 border-white/10 text-zinc-600 px-8 h-12 rounded-xl">
                    <Share2 className="h-4 w-4 mr-2" /> SHARE
                 </Button>
              </div>
           </div>

           <div className="flex items-center gap-12 bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-inner">
              <div className="text-zinc-600 space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Final Score</p>
                 <div className="text-zinc-600 font-black tracking-tighter text-zinc-600">
                    {result.obtained_marks}<span className="text-zinc-600 font-normal">/{result.total_marks}</span>
                 </div>
              </div>
              <div className="h-16 w-[1px] bg-white/10" />
              <div className="text-zinc-600 space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Percentile</p>
                 <div className="text-zinc-600 font-black tracking-tighter">
                    {result.percentile?.toFixed(1) || result.percentage.toFixed(1)}<span className="text-zinc-600 font-normal">%</span>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
           <Trophy className="h-64 w-64" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2">
         {['overview', 'review'].map((tab) => (
            <button 
               key={tab}
               className={cn(
                  "px-6 py-3 text-zinc-600 font-black uppercase tracking-widest transition-all relative",
                   activeTab === tab ? "text-primary" :  "text-zinc-600 "
               )}
               onClick={() => setActiveTab(tab as 'overview' | 'review')}
            >
               {tab}
               {activeTab === tab && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-primary rounded-full transition-all" />}
            </button>
         ))}
      </div>

      {activeTab === 'overview' ? (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               {/* Subject Breakdown */}
               <Card className="border shadow-md rounded-2xl bg-white p-6">
                  <h3 className="text-zinc-600 font-black uppercase mb-8 tracking-tighter">Subject Insights</h3>
                  <div className="grid gap-6">
                     {subjectsFormatted.map((sub) => (
                        <div key={sub.name} className="space-y-3">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h4 className="font-black text-zinc-600 uppercase">{sub.name}</h4>
                                 <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Efficiency: {sub.accuracy}%</p>
                              </div>
                               <div className="text-zinc-600 font-black">
                                 {sub.score}<span className="text-zinc-600 font-normal">/{sub.total}</span>
                              </div>
                           </div>
                           <Progress value={sub.total > 0 ? (sub.score/sub.total)*100 : 0} className="h-2 bg-zinc-100" />
                        </div>
                     ))}
                  </div>
               </Card>

               <Card className="border shadow-md rounded-2xl bg-zinc-950 p-8 text-zinc-600 relative overflow-hidden group">
                  <div className="relative z-10 text-zinc-600 md :text-zinc-600 space-y-4">
                     <h4 className="text-zinc-600 font-black uppercase tracking-widest text-zinc-600">Global Standing</h4>
                     <div className="text-zinc-600 font-black tracking-tighter mb-2">#{result.rank || 'TBD'}</div>
                     <p className="text-[10px] font-bold text-zinc-600 leading-relaxed uppercase tracking-widest max-w-sm">
                        You are positioned among the elite performers in this assessment cycle. Keep pushing for the #1 spot.
                     </p>
                     <Button className="mt-4 bg-primary text-white font-black rounded-xl px-8 h-10 text-[10px] hover:scale-105 transition-transform">
                        VIEW LEADERBOARD
                     </Button>
                  </div>
                  <TrendingUp className="absolute -bottom-10 -right-10 h-40 w-40 opacity-10 rotate-[-15deg]" />
               </Card>
            </div>

            <div className="space-y-8">
               <Card className="border shadow-md rounded-2xl bg-white p-6">
                  <h4 className="text-zinc-600 font-black uppercase tracking-widest text-zinc-600 mb-6">Performance Analytics</h4>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center bg-zinc-50 border p-4 rounded-2xl">
                        <span className="text-[10px] font-black uppercase">Correct</span>
                        <Badge className="bg-emerald-500 text-zinc-600 border-none">{result.answers.filter(a => a.status === 'correct').length}</Badge>
                     </div>
                     <div className="flex justify-between items-center bg-zinc-50 border p-4 rounded-2xl">
                        <span className="text-[10px] font-black uppercase">Incorrect</span>
                        <Badge className="bg-rose-500 text-zinc-600 border-none">{result.answers.filter(a => a.status === 'incorrect').length}</Badge>
                     </div>
                     <div className="flex justify-between items-center bg-zinc-50 border p-4 rounded-2xl">
                        <span className="text-[10px] font-black uppercase">Skipped</span>
                        <Badge className="bg-zinc-200 text-zinc-600 border-none">{result.answers.filter(a => a.status === 'unattempted').length}</Badge>
                     </div>
                  </div>
               </Card>
               
               <Card className="border shadow-md rounded-2xl bg-zinc-950 p-6 text-zinc-600">
                  <h4 className="text-zinc-600 font-black uppercase tracking-widest text-zinc-600 mb-6">AI Growth Engine</h4>
                  <div className="space-y-4">
                     <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xl font-bold leading-relaxed">
                           Strategic Focus: Revisit questions from <span className="text-zinc-600">Topic Diagnostics</span>. Accuracy in {result.test?.subject} can be improved by targeting specific weak pillars.
                        </p>
                     </div>
                     <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                        GENERATE PRACTICE PLAN
                        <ArrowUpRight className="h-3 w-3" />
                     </Button>
                  </div>
               </Card>
            </div>
         </div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {result.answers.map((ans, i) => (
                  <Card key={ans.id} className="border shadow-md rounded-2xl bg-white overflow-hidden group">
                     <div className="flex min-h-[250px]">
                        <div className={cn(
                           "w-2 shrink-0",
                           ans.status === 'correct' ? "bg-emerald-500" : ans.status === 'incorrect' ? "bg-rose-500" : "bg-zinc-200"
                        )} />
                        <div className="flex-1 p-8 space-y-8">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                 <Badge className="bg-zinc-100 text-zinc-600 border-none text-[10px] font-black px-3 py-1">Q {i + 1}</Badge>
                                 <Badge className={cn(
                                    "border-none text-[8px] font-black uppercase px-3 py-1",
                                    ans.status === 'correct' ? "bg-emerald-500/10 text-zinc-600" : ans.status === 'incorrect' ? "bg-rose-500/10 text-zinc-600" : "bg-zinc-500/10 text-zinc-600"
                                 )}>
                                    {ans.status}
                                 </Badge>
                                 <Badge variant="outline" className="text-[7px] border-zinc-200 text-xl font-bold uppercase">{ans.question?.topic}</Badge>
                              </div>
                              <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                                 <BookOpen className="h-4 w-4 text-zinc-600" />
                              </div>
                           </div>

                           <div className="text-xl font-bold leading-relaxed text-zinc-600">
                              {ans.question?.content.split('$').map((part, idx) => 
                                 idx % 2 === 0 ? part : <InlineMath key={idx} math={part} />
                              )}
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-2xl bg-zinc-50 border">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Your Selected Answer</p>
                                   <div className={cn( "text-zinc-600 font-black", ans.status === 'correct' ? "text-emerald-600" : "text-rose-600")}>{ans.user_answer || 'SKIPPED'}</div>
                              </div>
                              <div className="p-4 rounded-2xl bg-zinc-50 border">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Authenticated Correct Answer</p>
                                  <div className="text-zinc-600 font-black text-zinc-600">{ans.question?.answer}</div>
                              </div>
                           </div>

                           {ans.question?.explanation && (
                              <div className="p-6 rounded-3xl bg-zinc-50 border border-dashed">
                                 <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" /> Step-by-Step Logic
                                 </h5>
                                 <p className="text-xl font-bold leading-relaxed text-zinc-600">
                                    {ans.question.explanation.split('$').map((part, idx) => 
                                       idx % 2 === 0 ? part : <InlineMath key={idx} math={part} />
                                    )}
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  </Card>
               ))}
            </div>

            <div className="space-y-8">
               <Card className="border shadow-md rounded-2xl bg-white p-6">
                  <h4 className="text-zinc-600 font-black uppercase tracking-tight mb-6">Diagnostic Filters</h4>
                  <div className="grid gap-4">
                     {[
                        { label: 'All Queries', count: result.answers.length, icon: BookOpen },
                         { label: 'Correct', count: result.answers.filter(a => a.status === 'correct').length, icon: CheckCircle2, color: 'text-emerald-500' },
                         { label: 'Incorrect', count: result.answers.filter(a => a.status === 'incorrect').length, icon: XCircle, color: 'text-rose-500' },
                         { label: 'Unattempted', count: result.answers.filter(a => a.status === 'unattempted').length, icon: AlertCircle, color: 'text-zinc-400' }
                     ].map((f) => (
                        <button key={f.label} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 hover:scale-[1.02] transition-transform group text-zinc-600">
                           <div className="flex items-center gap-3">
                               <f.icon className={cn("h-4 w-4", f.color || "text-zinc-600")} />
                              <span className="text-[11px] font-black uppercase tracking-tight">{f.label}</span>
                           </div>
                           <Badge variant="ghost" className="bg-white font-black text-zinc-600 h-7 w-7 rounded-lg flex items-center justify-center p-0">{f.count}</Badge>
                        </button>
                     ))}
                  </div>
               </Card>
            </div>
         </div>
      )}
    </div>
  );
}
