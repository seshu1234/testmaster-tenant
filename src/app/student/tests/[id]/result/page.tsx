"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  BarChart3, 
  Download, 
  ChevronRight, 
  Flame,
  Award,
  BookOpen,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultData {
  score: number;
  max_score: number;
  percentage: number;
  rank: number;
  percentile: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  breakdown?: Record<string, { correct: number, total: number }>;
  answers?: AnswerData[];
}

interface AnswerData {
  id: string;
  is_correct: boolean;
  selected_option: string | string[];
  question: {
    subject: string;
    topic: string;
    content: { text?: string } | string;
    options?: string[];
    answer: string | string[];
    explanation?: string;
  };
}

interface LeaderboardItem {
  rank: number;
  name: string;
  score: number;
  student_id: string;
}

export default function StudentResultPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, token, tenantSlug } = useAuth();
  
  const testId = params.id as string;
  const attemptId = searchParams.get("attempt");

  const [result, setResult] = useState<ResultData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'grading' | 'ready' | 'error'>('loading');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    if (!user || !token || !testId) return;
    try {
      const response = await api(`/student/tests/${testId}/leaderboard`, { token, tenant: tenantSlug || undefined });
      if (response.success) {
        setLeaderboard(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    }
  }, [testId, user, token, tenantSlug]);

  const fetchResult = useCallback(async () => {
    if (!user || !token || !attemptId) return;
    try {
      const response = await api(`/student/attempts/${attemptId}/result`, { token, tenant: tenantSlug || undefined });
      
      if (response.status === 'grading_in_progress') {
        setStatus('grading');
      } else if (response.success && response.data) {
        setResult(response.data);
        setStatus('ready');
        fetchLeaderboard();
      }
    } catch (err) {
      console.error("Failed to fetch result:", err);
      setStatus('error');
    }
  }, [attemptId, user, token, tenantSlug, fetchLeaderboard]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResult();
    
    // Poll if grading is in progress
    let interval: NodeJS.Timeout;
    if (status === 'grading') {
        interval = setInterval(fetchResult, 3000);
    }
    return () => clearInterval(interval);
  }, [fetchResult, status]);

  const handleDownloadPdf = async () => {
      // PDF generation logic stub
      window.print();
  };

  if (status === 'loading' || status === 'grading') {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-zinc-800 dark:text-zinc-100 uppercase">
                    Analyzing Your Performance
                </h2>
                <p className="text-zinc-500 max-w-md mx-auto text-lg leading-relaxed">
                    Our AI-powered grading engine is processing your responses and calculating your rank. 
                    Hang tight, your future is loading!
                </p>
              </div>
              <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full border">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1.5" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Real-time Grading Active</span>
              </div>
          </div>
      );
  }

  if (status === 'error' || !result) {
      return (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-rose-500/20 max-w-lg mx-auto mt-20">
              <Flame className="h-16 w-16 text-rose-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Handshake Error</h2>
              <p className="text-zinc-500 mb-8">We couldn&apos;t retrieve your result at this moment. This might be due to a sync issue or a temporary connectivity drop.</p>
              <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
              </Button>
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700 pb-20">
      {/* 1. HERO HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-zinc-900 p-8 rounded-3xl border shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <Trophy className="h-48 w-48 text-indigo-600" />
        </div>
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none py-1.5 px-4 rounded-full font-bold uppercase tracking-widest text-[10px]">
                Test Competed Successfully
            </Badge>
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
            <span className="text-zinc-400 font-bold text-xs uppercase tracking-tighter">ID: {attemptId?.slice(0, 8)}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">
            Great Work, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-zinc-500 text-xl font-medium max-w-xl">
            You&apos;ve completed the assessment. Your effort and consistency bring you closer to your goal every day.
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Button onClick={handleDownloadPdf} variant="outline" className="h-14 rounded-2xl px-6 font-bold border-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 group">
            <Download className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
            Export PDF
          </Button>
          <Button onClick={() => router.push('/student/tests')} className="h-14 rounded-2xl px-8 font-black bg-primary text-white shadow-xl shadow-primary/20 border-none flex items-center gap-2 group">
            Next Challenge
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* 2. CORE METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SCORE CARD */}
        <Card className="col-span-1 md:col-span-1 border-none shadow-xl bg-primary text-primary-foreground overflow-hidden relative group">
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Target className="h-40 w-40" />
            </div>
            <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] opacity-80">Total Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
                <div className="text-8xl font-black tracking-tighter mb-2">{result.score}</div>
                <div className="text-primary-foreground/60 font-bold text-lg uppercase">Out of {result.max_score}</div>
                <div className="mt-8 flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full border border-white/20">
                    <Award className="h-5 w-5" />
                    <span className="font-bold">{result.percentage}% Accuracy</span>
                </div>
            </CardContent>
        </Card>

        {/* STATS ANALYTICS */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatsCard 
                icon={<Trophy className="text-amber-500" />} 
                label="Global Rank" 
                value={`#${result.rank}`}
                subValue="Among active peers"
            />
            <StatsCard 
                icon={<Flame className="text-rose-500" />} 
                label="Percentile" 
                value={`${result.percentile.toFixed(1)}th`}
                subValue="Better than others"
            />
            <StatsCard 
                icon={<BarChart3 className="text-indigo-500" />} 
                label="Efficiency" 
                value={`${result.correct_count} / ${result.correct_count + result.incorrect_count}`}
                subValue="Correct attempts"
            />
        </div>
      </div>

      {/* 3. DUAL PANEL: BREAKDOWN & LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TOPIC ANALYSIS */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-3 uppercase tracking-tight">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Subject Mastery
                </h3>
            </div>
            
            <Card className="rounded-3xl border-none shadow-xl overflow-hidden bg-white dark:bg-zinc-900 border">
                <CardContent className="p-0">
                    <div className="p-8 grid gap-8">
                        {result.breakdown ? Object.entries(result.breakdown).map(([subject, data], idx) => (
                            <div key={subject} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-zinc-400 uppercase tracking-widest">Category {idx + 1}</div>
                                        <div className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{subject}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-primary">{Math.round((data.correct / data.total) * 100)}%</span>
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase">{data.correct}/{data.total} Correct</div>
                                    </div>
                                </div>
                                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                                        style={{ width: `${(data.correct / data.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-zinc-400 italic font-medium">No subject breakdown available for this assessment.</div>
                        )}
                    </div>
                    
                    {/* AI ANALYTICS BUTTON */}
                    <div className="p-6 bg-indigo-500/5 border-t border-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-100">AI Weakness Detection</h4>
                                <p className="text-xs text-indigo-500 font-medium">Discover tailored strategies based on your errors.</p>
                            </div>
                        </div>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-12 font-bold shadow-lg shadow-indigo-600/20"
                            onClick={() => setIsGeneratingAi(true)}
                        >
                            {isGeneratingAi ? "Scanning Data..." : "Generate AI Insights"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* LEADERBOARD SIDEBAR */}
        <div className="space-y-6">
            <h3 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-3 uppercase tracking-tight">
                <Award className="h-6 w-6 text-amber-500" />
                Champions List
            </h3>
            <Card className="rounded-3xl border-none shadow-2xl overflow-hidden bg-white dark:bg-zinc-900 border group">
                <CardContent className="p-0">
                    <div className="bg-[#f8f9fa] dark:bg-zinc-800/50 p-6 flex justify-between items-center border-b">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Top Performers</span>
                        <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Updates</span>
                        </div>
                    </div>
                    <div className="divide-y dark:divide-zinc-800">
                        {leaderboard.length > 0 ? leaderboard.map((item, idx) => (
                            <div 
                                key={item.student_id} 
                                className={cn(
                                    "p-6 flex items-center gap-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                                    item.student_id === user?.id ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-primary" : ""
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border text-white",
                                    idx === 0 ? "bg-amber-500 scale-110 shadow-amber-500/20" : 
                                    idx === 1 ? "bg-zinc-400" : 
                                    idx === 2 ? "bg-amber-700" : "bg-zinc-100 dark:bg-zinc-700 text-zinc-400"
                                )}>
                                    {item.rank}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-zinc-800 dark:text-zinc-100 truncate flex items-center gap-2">
                                        {item.name}
                                        {item.student_id === user?.id && <Badge className="bg-primary/10 text-primary border-none scale-75 h-4">YOU</Badge>}
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Candidate Profile Secured</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-primary">{item.score}</div>
                                    <div className="text-[9px] font-bold text-zinc-400 uppercase">Points</div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-20 text-center text-zinc-400 italic">No competitors yet.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      {/* 4. PERFORMANCE REVIEW (DETAILED QUESTIONS) */}
      <div className="space-y-6">
          <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-3 uppercase tracking-tight">
                  <Target className="h-6 w-6 text-primary" />
                  Performance Review
              </h3>
          </div>

          <div className="grid gap-6">
              {result.answers?.map((answer: AnswerData, idx: number) => (
                  <Card key={answer.id} className={cn(
                      "rounded-3xl border shadow-lg overflow-hidden transition-all",
                      answer.is_correct ? "border-emerald-500/20 bg-emerald-50/10" : "border-rose-500/20 bg-rose-50/10"
                  )}>
                      <CardHeader className="flex flex-row items-start justify-between p-6">
                          <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="font-bold">Q{idx + 1}</Badge>
                                  <Badge className={cn(
                                      "font-bold uppercase tracking-widest text-[10px]",
                                      answer.is_correct ? "bg-emerald-500" : "bg-rose-500"
                                  )}>
                                      {answer.is_correct ? "Correct" : "Incorrect"}
                                  </Badge>
                                  <span className="text-xs text-zinc-400 font-bold uppercase">{answer.question.subject} / {answer.question.topic}</span>
                              </div>
                              <div className="text-lg font-bold text-zinc-800 dark:text-zinc-100 prose prose-zinc dark:prose-invert max-w-none" 
                                   dangerouslySetInnerHTML={{ __html: (typeof answer.question.content === 'object' && answer.question.content.text) ? answer.question.content.text : (answer.question.content as string) }} />
                          </div>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 space-y-4">
                          {/* Options if they exist */}
                          {answer.question.options && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {answer.question.options.map((option: string, oIdx: number) => {
                                      const isSelected = answer.selected_option === option || (Array.isArray(answer.selected_option) && answer.selected_option.includes(option));
                                      const isCorrect = answer.question.answer === option || (Array.isArray(answer.question.answer) && answer.question.answer.includes(option));
                                      
                                      return (
                                          <div key={oIdx} className={cn(
                                              "p-4 rounded-2xl border-2 font-medium text-sm transition-all",
                                              isCorrect ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" : 
                                              isSelected ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20" :
                                              "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                                          )}>
                                              {option}
                                              {isSelected && !isCorrect && <span className="ml-2 opacity-60 text-[10px] font-black uppercase">(Your Answer)</span>}
                                              {isCorrect && <span className="ml-2 opacity-60 text-[10px] font-black uppercase">(Correct Answer)</span>}
                                          </div>
                                      );
                                  })}
                              </div>
                          )}

                          {/* AI Explanation Area */}
                          {answer.question.explanation && (
                              <div className="mt-6 bg-indigo-500/5 rounded-2xl p-6 border border-indigo-500/10 space-y-3">
                                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                      <Sparkles className="h-4 w-4" />
                                      <span className="text-xs font-black uppercase tracking-widest">AI Step-by-Step Solution</span>
                                  </div>
                                  <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed prose prose-sm prose-indigo dark:prose-invert max-w-none"
                                       dangerouslySetInnerHTML={{ __html: answer.question.explanation }} />
                              </div>
                          )}
                      </CardContent>
                  </Card>
              ))}
          </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue: string }) {
    return (
        <Card className="rounded-3xl border-none shadow-lg bg-white dark:bg-zinc-900 border group hover:scale-[1.02] transition-transform">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border-2 border-zinc-100 dark:border-zinc-800 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800 transition-colors shadow-sm")}>
                    {icon}
                </div>
                <div className="space-y-1">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</div>
                    <div className="text-4xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter">{value}</div>
                    <div className="text-xs font-bold text-zinc-500">{subValue}</div>
                </div>
            </CardContent>
        </Card>
    );
}
