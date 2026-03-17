"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Clock, 
  Search,
  Flame,
  Star,
  TrendingUp,
  Gem,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface PracticeSet {
  id: string;
  title: string;
  subject: string;
  category: string;
  duration_seconds: number;
  settings?: {
    difficulty?: string;
    questions_count?: number;
    points?: number;
  };
}

interface DashboardData {
  student: {
    streak: number;
  };
  streak_history: number[];
}

interface InsightData {
  performance_trend: number;
  subject_averages: { subject: string; avg_percentage: number }[];
}

export default function StudentPracticePage() {
  const { token, tenantSlug } = useAuth();
  const [activeTab, setActiveTab] = useState<'recommended' | 'popular' | 'topic'>('recommended');
  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sidebar Data State
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  useEffect(() => {
    const fetchPracticeData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await api('/student/tests?category=practice', {
          token,
          tenant: tenantSlug || undefined
        });
        setPracticeSets(response.data);
      } catch (err) {
        setError('Failed to fetch practice data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSidebarData = async () => {
      if (!token) return;
      setSidebarLoading(true);
      try {
        const [dashRes, insightRes] = await Promise.all([
          api('/student/dashboard', { token, tenant: tenantSlug || undefined }),
          api('/student/analytics/insights', { token, tenant: tenantSlug || undefined })
        ]);
        setDashboardData(dashRes.data);
        setInsightData(insightRes.data);
      } catch (err) {
        console.error("Failed to fetch sidebar data:", err);
      } finally {
        setSidebarLoading(false);
      }
    };

    fetchPracticeData();
    fetchSidebarData();
  }, [token, tenantSlug]);

  return (
    <div className="p-6 space-y-6">
      {/* Practice Hero */}
      <Card className="bg-primary text-white p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-primary-foreground/20 text-white">Learning Hub</Badge>
            <h1 className="text-xl font-black uppercase tracking-tight">Practice Arena</h1>
            <p className="opacity-80 font-medium">
              Timer-less sessions with instant AI explanations to bridge your knowledge gaps.
            </p>
          </div>

          <div className="bg-primary-foreground/10 p-6 rounded-2xl flex items-center gap-4">
            <Gem className="h-8 w-8 text-white" />
            <div>
              <p className="text-white opacity-60 uppercase font-black text-[10px] tracking-wider">Practice Mode</p>
               <p className="text-white font-black uppercase tracking-tight">Active Learning enabled</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Selection Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                type="text" 
                placeholder="Search practice modules..." 
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            
            <div className="flex gap-2 bg-zinc-100 p-1 rounded-xl">
              {['recommended', 'popular', 'topic'].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab as 'recommended' | 'popular' | 'topic')}
                  className={cn(
                    "capitalize font-black text-[10px] tracking-widest px-4 h-9 rounded-lg",
                    activeTab === tab ? "bg-white text-primary shadow-sm" : "text-zinc-500"
                  )}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest font-black">Loading your learning path...</p>
              </div>
            ) : error ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-zinc-500 font-black uppercase tracking-widest">{error}</p>
              </Card>
            ) : practiceSets.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-zinc-500 font-black uppercase tracking-widest">No practice modules available</p>
              </Card>
            ) : (
              practiceSets.map((set) => (
                 <Card key={set.id} className="p-6 transition-all hover:border-primary/30 shadow-sm hover:shadow-md border rounded-2xl group border-zinc-100">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex flex-col items-center justify-center transition-transform group-hover:scale-105 border">
                      <Zap className={cn(
                        "h-5 w-5",
                        set.settings?.difficulty?.toLowerCase() === 'hard' ? 'text-rose-600' : 
                        set.settings?.difficulty?.toLowerCase() === 'medium' ? 'text-amber-600' : 
                        'text-emerald-600'
                      )} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                        UNLIMITED
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase tracking-widest h-5 px-3">
                          {set.subject}
                        </Badge>
                      </div>
                       <h3 className="text-zinc-800 font-black uppercase tracking-tight text-lg">{set.title}</h3>
                      <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {set.settings?.questions_count || 0} Questions</div>
                        <div className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> {set.settings?.difficulty || 'General'}</div>
                      </div>
                    </div>

                    <Link href={`/student/practice/${set.id}/take`}>
                       <Button className="font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-[0_4px_14px_rgba(var(--primary),0.2)]">
                        START PRACTICE
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="p-6 border-none bg-zinc-950 text-white rounded-3xl overflow-hidden relative">
            <div className="relative z-10 space-y-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h3 className="font-black uppercase tracking-tight text-xl leading-none">Learning AI</h3>
              <p className="text-zinc-400 font-medium text-sm leading-relaxed">
                Your mastery index is improving based on recent practice attempts.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Progress Velocity</span>
                  <span className="text-primary">{insightData?.performance_trend || 0}%</span>
                </div>
                <Progress value={insightData?.performance_trend || 0} className="h-1 bg-zinc-800" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary/20 rounded-full blur-3xl" />
          </Card>

          <Card className="p-8 border shadow-sm rounded-3xl">
             {sidebarLoading ? (
               <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Streak Status</h4>
                   <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                   <p className="text-4xl font-black">{dashboardData?.student?.streak}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Active Learning Days</p>
                </div>
                <div className="flex justify-between gap-1">
                  {(dashboardData?.streak_history || [0,0,0,0,0,0,0]).map((s: number, i: number) => (
                    <div key={i} className={cn(
                      "h-1.5 flex-1 rounded-full transition-all",
                      s ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "bg-zinc-100"
                    )} />
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-8 border shadow-sm rounded-3xl">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Subject Mastery</h4>
            {sidebarLoading ? (
               <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="space-y-6">
                {(insightData?.subject_averages || []).slice(0, 3).map((target: { subject: string; avg_percentage: number }, i: number) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-zinc-600">{target.subject}</span>
                      <span className="font-black">{Math.round(target.avg_percentage)}%</span>
                    </div>
                    <Progress value={target.avg_percentage} className="h-1 bg-zinc-100" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}