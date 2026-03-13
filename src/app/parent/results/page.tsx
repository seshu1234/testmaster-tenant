"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  AlertCircle,
  TrendingUp,
  Target,
  Clock,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface TestResult {
  id: string;
  title: string;
  subject: string;
  date: string;
  score: number;
  totalMarks: number;
  rank: string;
  status: 'Completed' | 'Pending' | 'Flagged';
}

interface Ward {
  id: string;
  name: string;
}

export default function ResultsHistoryPage() {
  const { token, tenantSlug } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [wards, setWards] = useState<Ward[]>([]);
  const [activeWardId, setActiveWardId] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [insight, setInsight] = useState<{ 
    recommendations?: string;
    percentile?: number;
    confidence?: number;
    predicted_rank?: number;
    strengths?: string[];
    weaknesses?: string[];
  } | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      if (!token || !activeWardId) return;
      try {
        const response = await api(`/v1/parent/ai/${activeWardId}/insights`, {
          token,
          tenant: tenantSlug || undefined
        });
        setInsight(response.data);
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      }
    }
    fetchInsights();
  }, [token, tenantSlug, activeWardId]);

  useEffect(() => {
    async function fetchWards() {
      if (!token) return;
      try {
        const response = await api("/v1/parent/children", {
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
    async function fetchResults() {
      if (!token || !activeWardId) return;
      setIsLoading(true);
      try {
        const response = await api(`/v1/parent/results/${activeWardId}`, {
          token,
          tenant: tenantSlug || undefined
        });
        setResults(response.data || []);
      } catch (err) {
        console.error("Failed to fetch results:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [token, tenantSlug, activeWardId]);

  const filteredResults = results.filter(result => 
    result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase">Academic Transmission History</h1>
          <p className="text-muted-foreground text-sm font-medium">Archived assessment logs and performance verification.</p>
        </div>
        
        <div className="flex gap-4 items-center">
           {wards.length > 1 && (
            <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border dark:border-zinc-800 shadow-sm overflow-x-auto scrollbar-hide mr-2">
              {wards.map((ward) => (
                <button
                  key={ward.id}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                    activeWardId === ward.id 
                      ? "bg-primary text-white" 
                      : "text-zinc-500 hover:text-zinc-800"
                  )}
                  onClick={() => setActiveWardId(ward.id)}
                >
                  {ward.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
           <Button variant="outline" className="rounded-2xl border-zinc-200 dark:border-zinc-800 font-black text-[10px] uppercase tracking-widest px-6 h-12">
              <Download className="mr-2 h-4 w-4" />
              EXPORT ALL
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Results List */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                 <Input 
                    placeholder="SEARCH ASSESSMENTS..." 
                    className="pl-12 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-none shadow-sm font-bold placeholder:font-black placeholder:text-[10px] placeholder:tracking-widest"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <Button size="icon" className="h-14 w-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black">
                 <Filter className="h-5 w-5" />
              </Button>
           </div>

           <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] animate-pulse" />
                ))
              ) : filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <Card key={result.id} className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-900 overflow-hidden group hover:scale-[1.01] transition-all">
                     <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                           <div className="flex items-center gap-6">
                              <div className="h-16 w-16 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center shrink-0 border dark:border-zinc-800">
                                 <span className="text-[9px] font-black uppercase text-zinc-400">{new Date(result.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                 <span className="text-2xl font-black italic leading-none">{new Date(result.date).getDate()}</span>
                              </div>
                              <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[8px] font-black uppercase px-2 h-5 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">{result.subject}</Badge>
                                    <Badge className={cn(
                                       "text-[8px] font-black uppercase px-2 h-5 border-none",
                                       result.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                    )}>{result.status}</Badge>
                                 </div>
                                 <h4 className="text-xl font-black italic uppercase italic tracking-tighter">{result.title}</h4>
                              </div>
                           </div>

                           <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                 <div className="text-3xl font-black italic">{result.score}<span className="text-zinc-400 text-sm">/{result.totalMarks}</span></div>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Class Rank: {result.rank}</p>
                              </div>
                              <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                                 <ChevronRight className="h-5 w-5" />
                              </Button>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center">
                   <BookOpen className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                   <p className="text-zinc-500 font-black uppercase italic tracking-widest">No assessment logs found.</p>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl rounded-[3rem] bg-rose-500 text-white p-10 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
                    <AlertCircle className="h-7 w-7 text-white" />
                 </div>
                 <h3 className="text-2xl font-black italic uppercase italic tracking-tighter mb-4 leading-none">Performance Alert</h3>
                  <p className="text-rose-100 text-xs font-medium leading-relaxed mb-10">
                     {isLoading ? "Analysing trends..." : (insight?.recommendations || "Scanning performance for trajectory volatility...")}
                  </p>
                 <Button className="w-full bg-white text-rose-500 font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                    VIEW REMOVAL GUIDANCE
                 </Button>
              </div>
              <div className="absolute -bottom-10 -right-10 h-48 w-48 bg-white opacity-10 rounded-full blur-3xl animate-pulse" />
           </Card>

           <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-950 text-white p-10">
              <div className="flex items-center gap-4 mb-10">
                 <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                 </div>
                 <div>
                    <h4 className="text-xl font-black italic uppercase italic tracking-tighter">Rank Prediction</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PROJECTED TRAJECTORY</p>
                 </div>
              </div>

              <div className="space-y-6">
                 {[
                   { label: 'Current percentile', value: insight?.percentile ? `${insight.percentile.toFixed(1)}%` : 'TBD', color: 'text-white' },
                   { label: 'Confidence Score', value: insight?.confidence ? `${(insight.confidence * 100).toFixed(0)}%` : 'TBD', color: 'text-emerald-500' },
                   { label: 'Focus Area', value: insight?.recommendations ? insight.recommendations.split(' ')[0].toUpperCase() : 'TBD', color: 'text-amber-500' }
                 ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/10 pb-4 last:border-0 last:pb-0">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
                       <span className={cn("text-lg font-black italic", stat.color)}>{stat.value}</span>
                    </div>
                 ))}
              </div>

              <div className="mt-10 p-6 rounded-[2rem] bg-white/5 border border-white/10">
                 <div className="flex gap-4">
                    <Target className="h-5 w-5 text-primary shrink-0" />
                    <p className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase">
                       Predicted rank range: <span className="text-white">#{insight?.predicted_rank || 'TBD'}</span> based on current velocity.
                    </p>
                 </div>
              </div>
           </Card>

           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-900 p-10 flex flex-col items-center text-center gap-6">
              <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-950 rounded-[1.5rem] flex items-center justify-center">
                 <Clock className="h-7 w-7 text-zinc-400" />
              </div>
              <div>
                 <h4 className="text-xl font-black italic uppercase italic tracking-tighter">Archived Reports</h4>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">ACCESS LEGACY DATA</p>
              </div>
              <Button variant="outline" className="w-full font-black text-[10px] uppercase h-12 rounded-2xl border-zinc-200 dark:border-zinc-800">
                 DOWNLOAD ARCHIVE
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
