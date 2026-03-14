"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Search, 
  Star, 
  Download, 
  PlayCircle,
  Clock,
  ExternalLink,
  Plus,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface ResourceItem {
  id: string;
  title: string;
  type: string;
  subject: string;
  duration?: string;
  size?: string;
  questions?: number;
  rating: number;
  source: string;
  premium: boolean;
}

interface InsightRecommendation {
  topic: string;
  count?: number;
}

interface InsightData {
  recommendations: InsightRecommendation[] | string[];
  performance_trend: number;
}

export default function StudentResourcesPage() {
  const { token, tenantSlug } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'pdf' | 'notes'>('all');
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightData, setInsightData] = useState<InsightData | null>(null);

  useEffect(() => {
    async function fetchResources() {
      if (!token) return;
      try {
        const response = await api('/student/resources', {
          token,
          tenant: tenantSlug || undefined
        });
        setResources(response.data);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchAIInsights() {
      if (!token) return;
      try {
        const response = await api('/student/analytics/insights', {
          token,
          tenant: tenantSlug || undefined
        });
        setInsightData(response.data);
      } catch (err) {
        console.error("Failed to fetch AI insights:", err);
      }
    }

    fetchResources();
    fetchAIInsights();
  }, [token, tenantSlug]);

  const filteredResources = resources.filter(res => {
    if (activeTab === 'all') return true;
    if (activeTab === 'video') return res.type.toLowerCase() === 'video';
    if (activeTab === 'pdf') return res.type.toLowerCase() === 'pdf';
    return res.type.toLowerCase() === 'practice sheet' || res.type.toLowerCase() === 'notes';
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white p-10 rounded-3xl bg-zinc-950 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 space-y-4">
          <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5">Knowledge Vault</Badge>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-tight">Mastery Resources</h1>
          <p className="text-zinc-500 text-lg font-medium max-w-xl leading-relaxed">
            Curated study material, high-octane video lectures, and AI-generated practice sheets at your fingertips.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-4 w-full md:w-64">
           <Button className="bg-primary text-white font-black rounded-2xl h-14 shadow-xl hover:scale-105 transition-all">
              ASK A DOUBT <Plus className="ml-2 h-5 w-5" />
           </Button>
           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 text-center">Avg Response Time: 12 mins</p>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-125">
           <BookOpen className="h-64 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Resource Feed */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex flex-col md:flex-row bg-white dark:bg-zinc-950 p-4 rounded-3xl border dark:border-zinc-800 shadow-sm items-center justify-between gap-6">
              <div className="relative flex-1 w-full md:w-auto">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                 <input 
                    type="text" 
                    placeholder="Search resources, topics, or subjects..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-none text-[10px] font-black uppercase tracking-widest outline-none"
                 />
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl shadow-inner scrollbar-hide overflow-x-auto w-full md:w-auto">
                 {['all', 'video', 'pdf', 'notes'].map((tab) => (
                    <button
                       key={tab}
                       className={cn(
                          "px-6 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                           activeTab === tab ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-500"
                       )}
                       onClick={() => setActiveTab(tab as 'all' | 'video' | 'pdf' | 'notes')}
                    >
                       {tab.toUpperCase()}
                    </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                 <div className="col-span-2 flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Opening the vault...</p>
                 </div>
              ) : filteredResources.length === 0 ? (
                 <Card className="col-span-2 p-20 text-center border-dashed border-2 border-zinc-100 dark:border-zinc-900 bg-transparent">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">The vault is currently empty for this category.</p>
                 </Card>
              ) : (
                filteredResources.map((res) => (
                   <Card key={res.id} className="border shadow-md rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden group hover:scale-[1.02] transition-all transform duration-500">
                      <div className="p-8 space-y-6">
                         <div className="flex justify-between items-start">
                            <div className={cn(
                               "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 shadow-inner",
                               res.type.toLowerCase() === 'video' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-500" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
                            )}>
                               {res.type.toLowerCase() === 'video' ? <Video className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
                            </div>
                            {res.premium && (
                               <Badge className="bg-amber-500/10 text-amber-500 border-none text-[8px] font-black px-3 py-1 flex items-center gap-1">
                                  <Star className="h-2 w-2 fill-amber-500" /> PREMIUM
                               </Badge>
                            )}
                         </div>
  
                         <div className="space-y-2">
                            <div className="flex items-center gap-2">
                               <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest h-4 px-2">{res.subject}</Badge>
                               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{res.source}</span>
                            </div>
                             <h3 className="text-xl font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{res.title}</h3>
                         </div>
  
                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {res.duration || res.size || (res.questions && res.questions + ' Qs')}</div>
                               <div className="flex items-center gap-1.5 text-amber-500"><Star className="h-3 w-3 fill-amber-500" /> {res.rating}</div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-900">
                               {res.type.toLowerCase() === 'video' ? <PlayCircle className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                            </Button>
                         </div>
                      </div>
                   </Card>
                ))
              )}
           </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border shadow-md rounded-2xl bg-zinc-950 p-8 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="h-16 w-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                 </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">AI Study Assist</h3>
                 <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                    Based on your analytics, here are the most critical focus areas to boost your current trajectory.
                 </p>
                  <div className="space-y-4">
                  {(insightData?.recommendations || []).slice(0, 3).map((item: InsightRecommendation | string, i: number) => {
                    const topic = typeof item === 'string' ? item : item.topic;
                    return (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group/item">
                         <span className="text-[10px] font-bold uppercase tracking-tight">{topic}</span>
                         <ArrowUpRight className="h-3 w-3 text-primary group-hover/item:translate-x-0.5 transition-transform" />
                      </div>
                    );
                  })}
                  {(!insightData?.recommendations || insightData.recommendations.length === 0) && (
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center py-4">Scanning your performance...</p>
                  )}
                  </div>
              </div>
           </Card>

           <Card className="border shadow-md rounded-2xl bg-white dark:bg-zinc-950 p-6 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-primary" />
                 </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter">Quick References</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {['Formulas', 'Unit List', 'Constants', 'Shortcuts'].map((ref) => (
                    <button key={ref} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 flex flex-col items-center gap-2 hover:border-primary transition-all">
                       <span className="text-[10px] font-black uppercase tracking-widest">{ref}</span>
                       <ExternalLink className="h-3 w-3 text-zinc-400" />
                    </button>
                 ))}
              </div>
           </Card>

           <Card className="border shadow-md rounded-2xl bg-primary p-8 text-white relative overflow-hidden group">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Weekly Objective</h4>
               <p className="text-xl font-black uppercase leading-tight mb-8">
                 Master your current weak topics to reach Elite Status.
              </p>
              <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase">Resource Velocity</span>
                  <span className="text-xs font-black">{insightData?.performance_trend || 0}%</span>
              </div>
              <Progress value={insightData?.performance_trend || 0} className="h-2 bg-white/20" />
              <TrendingUp className="absolute -bottom-8 -right-8 h-32 w-32 opacity-10 rotate-12" />
           </Card>
        </div>
      </div>
    </div>
  );
}
