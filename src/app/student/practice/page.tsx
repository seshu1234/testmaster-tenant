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
        const response = await api('/v1/student/tests?category=practice', {
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
          api('/v1/student/dashboard', { token, tenant: tenantSlug || undefined }),
          api('/v1/student/analytics/insights', { token, tenant: tenantSlug || undefined })
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
      <Card className="bg-primary text-primary-foreground p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">Growth Engine</Badge>
            <h1 className="text-4xl font-bold uppercase tracking-tight">Precision Practice</h1>
            <p className="text-primary-foreground/80">
              AI-curated drills designed to eliminate your weak spots and maximize score velocity.
            </p>
          </div>

          <div className="bg-primary-foreground/10 p-6 rounded-lg flex items-center gap-4">
            <Gem className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-sm text-primary-foreground/60 uppercase font-bold tracking-wider">Practice Multiplier</p>
               <p className="text-lg font-black uppercase tracking-tight">1.5x Rewards Active</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Selection Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search topics, chapters, or concepts..." 
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              {['recommended', 'popular', 'topic'].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab as 'recommended' | 'popular' | 'topic')}
                  className="capitalize font-bold"
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
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Loading Practice Drills...</p>
              </div>
            ) : error ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-destructive font-bold uppercase tracking-widest">{error}</p>
              </Card>
            ) : practiceSets.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-muted-foreground font-bold uppercase tracking-widest">No practice drills available for your batch.</p>
              </Card>
            ) : (
              practiceSets.map((set) => (
                 <Card key={set.id} className="p-6 transition-all border shadow-sm rounded-2xl group">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 bg-muted rounded-lg flex flex-col items-center justify-center transition-transform group-hover:scale-105">
                      <Zap className={cn(
                        "h-6 w-6",
                        set.settings?.difficulty?.toLowerCase() === 'hard' ? 'text-rose-500' : 
                        set.settings?.difficulty?.toLowerCase() === 'medium' ? 'text-amber-500' : 
                        'text-blue-500'
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                        {Math.floor(set.duration_seconds / 60)} min
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest h-5">
                          {set.category || 'Practice'}
                        </Badge>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {set.subject}
                        </span>
                      </div>
                       <h3 className="text-xl font-black uppercase tracking-tight">{set.title}</h3>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {set.settings?.questions_count || 10} Questions</div>
                        <div className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> {set.settings?.points || 100} Points</div>
                      </div>
                    </div>

                    <Link href={`/student/tests/${set.id}/lobby`}>
                       <Button className="font-black uppercase tracking-tighter hover:scale-105 transition-transform px-8">
                        START DRILL
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
          <Card className="p-6 border-primary/20 bg-primary/5">
            {sidebarLoading ? (
               <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-black uppercase tracking-tight leading-none">Growth Forecast</h3>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  Based on your recent practice of <span className="font-black text-foreground uppercase tracking-tight">Focus Areas</span>, 
                  your upcoming score is expected to improve.
                </p>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Score Velocity</span>
                  <span className="text-primary">{insightData?.performance_trend || 0}%</span>
                </div>
                <Progress value={insightData?.performance_trend || 0} className="h-1.5" />
              </div>
            )}
          </Card>

          <Card className="p-6 text-center">
             {sidebarLoading ? (
               <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
                </div>
                <h4 className="text-lg font-black uppercase tracking-tight leading-none">Practice Streak</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{dashboardData?.student?.streak} Day Streak</p>
                <div className="flex justify-center gap-1">
                  {(dashboardData?.streak_history || [0,0,0,0,0,0,0]).map((s: number, i: number) => (
                    <div key={i} className={cn(
                      "h-1.5 w-6 rounded-full transition-all",
                      s ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "bg-muted"
                    )} />
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Mastery Targets</h4>
            {sidebarLoading ? (
               <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="space-y-5">
                {(insightData?.subject_averages || []).slice(0, 3).map((target: { subject: string; avg_percentage: number }, i: number) => (
                  <div key={i} className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>{target.subject}</span>
                      <span className="text-primary">{Math.round(target.avg_percentage)}%</span>
                    </div>
                    <Progress value={target.avg_percentage} className="h-1 bg-muted" />
                  </div>
                ))}
                {(!insightData?.subject_averages || insightData.subject_averages.length === 0) && (
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">No data yet</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}