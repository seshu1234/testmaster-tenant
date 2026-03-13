"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  ChevronLeft, 
  Users, 
  Target, 
  PieChart,
  FileSpreadsheet,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsSummary {
  total_candidates: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  pass_percentage: number;
  distribution: Record<string, number>; // "0-20": 5, "21-40": 12, etc.
}

interface QuestionStat {
  id: string;
  order: number;
  content: string;
  correct_percentage: number;
  total_attempts: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
}

export default function TeacherResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, tenantSlug } = useAuth();
  const testId = params.id as string;

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [questions, setQuestions] = useState<QuestionStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/teacher/tests/${testId}/analytics`, { token, tenant: tenantSlug || undefined });
        if (response.success) {
          setSummary(response.data.summary);
          setQuestions(response.data.questions);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [testId, user, token, tenantSlug]);

  if (isLoading) return <div className="p-20 text-center animate-pulse tracking-tighter text-zinc-400 font-bold uppercase">Loading Results Analysis...</div>;

  return (
    <div className="max-w-full mx-auto p-8 space-y-10 animate-in fade-in duration-700 bg-[#f8f9fa] dark:bg-zinc-950 min-h-screen">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="h-12 w-12 p-0 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                    <TrendingUp className="h-9 w-9 text-indigo-600" />
                    TEST ANALYTICS
                </h1>
                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Test ID: {testId.slice(0, 8)} | Analysis Report
                </p>
            </div>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="h-14 rounded-2xl px-6 font-bold border-2 bg-white dark:bg-zinc-900 shadow-xl shadow-indigo-500/5 group">
                <FileSpreadsheet className="h-5 w-5 mr-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                Raw Data (CSV)
            </Button>
            <Button className="h-14 rounded-2xl px-8 font-black bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xl flex items-center gap-3 group">
                Publish Results
                <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            </Button>
        </div>
      </div>

      {/* 2. CORE STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard 
            label="Avg. Proficiency" 
            value={`${summary?.average_score || 0}%`} 
            icon={<Target className="text-indigo-500" />} 
          />
          <MetricCard 
            label="Elite Performers" 
            value={summary?.total_candidates || 0} 
            suffix="Candidates"
            icon={<Users className="text-indigo-500" />} 
          />
          <MetricCard 
            label="Success Threshold" 
            value={`${summary?.pass_percentage || 0}%`} 
            icon={<Layers className="text-emerald-500" />} 
          />
          <MetricCard 
            label="Highest Vector" 
            value={`${summary?.highest_score || 0}%`} 
            icon={<TrendingUp className="text-rose-500" />} 
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. SCORE DISTRIBUTION CHART */}
        <Card className="lg:col-span-1 rounded-3xl border shadow-2xl overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="p-8 border-b bg-zinc-50/50 dark:bg-zinc-800/30">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    Score Spread
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="space-y-6">
                    {summary?.distribution && Object.entries(summary.distribution).map(([range, count]) => (
                        <div key={range} className="space-y-2">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-400">
                                <span>Range: {range}%</span>
                                <span>{count} Students</span>
                            </div>
                            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex p-0.5">
                                <div 
                                    className="h-full bg-indigo-500 rounded-md transition-all duration-1000 ease-in-out" 
                                    style={{ width: `${(count / summary.total_candidates) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* 4. PERFORMANCE ANALYSIS BY QUESTION */}
        <Card className="lg:col-span-2 rounded-3xl border shadow-2xl overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="p-8 border-b bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-row items-center justify-between space-y-0">
                <div>
                   <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <PieChart className="h-6 w-6 text-primary" />
                        Critical Question Analysis
                    </CardTitle>
                </div>
                <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border font-bold uppercase py-1.5 px-4 rounded-xl">
                    Topic Filter: All
                </Badge>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b bg-zinc-50/30 dark:bg-zinc-800/10">
                                <th className="p-6 text-[10px] font-black uppercase text-zinc-400">Question</th>
                                <th className="p-6 text-[10px] font-black uppercase text-zinc-400">Accuracy</th>
                                <th className="p-6 text-[10px] font-black uppercase text-zinc-400">Difficulty</th>
                                <th className="p-6 text-[10px] font-black uppercase text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-zinc-800">
                            {questions.map((q) => (
                                <tr key={q.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-500 border group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                                #{q.order}
                                            </div>
                                            <div className="truncate max-w-[300px] text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                                {q.content}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        q.correct_percentage > 70 ? "bg-emerald-500" :
                                                        q.correct_percentage > 40 ? "bg-amber-500" : "bg-rose-500"
                                                    )}
                                                    style={{ width: `${q.correct_percentage}%` }}
                                                />
                                            </div>
                                            <span className="font-black text-xs text-zinc-800 dark:text-zinc-100">{q.correct_percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <Badge className={cn(
                                            "border-none py-1 px-3 rounded-lg font-black uppercase text-[10px]",
                                            q.difficulty_level === 'easy' ? "bg-emerald-100 text-emerald-700" :
                                            q.difficulty_level === 'medium' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                                        )}>
                                            {q.difficulty_level}
                                        </Badge>
                                    </td>
                                    <td className="p-6 text-right">
                                        <Button variant="ghost" size="sm" className="font-bold text-xs rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            Deep Dive
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, suffix, icon }: { label: string, value: string | number, suffix?: string, icon: React.ReactNode }) {
    return (
        <Card className="rounded-3xl border shadow-xl bg-white dark:bg-zinc-900 group hover:translate-y-[-4px] transition-all duration-300">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800/50 transition-colors shadow-sm">
                    {icon}
                </div>
                <div>
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{label}</div>
                    <div className="text-4xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter">{value}</div>
                    {suffix && <div className="text-[10px] font-bold text-zinc-500 uppercase mt-2">{suffix}</div>}
                </div>
            </CardContent>
        </Card>
    );
}
