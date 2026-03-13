import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  Bookmark, 
  AlertCircle, 
  History, 
  ChevronRight, 
  CheckCircle2,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

interface Mistake {
  id: string;
  text: string;
  subject: string;
  topic: string;
  difficulty: string;
  status: 'bookmarked' | 'recent';
  errorType: string;
  explanation?: string;
  selected_option?: Record<string, unknown>;
  created_at: string;
}

interface ErrorTheme {
  label: string;
  val: number;
  color: string;
}

export default function StudentMistakesPage() {
  const { token, tenantSlug } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'bookmarked' | 'resolved'>('all');
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [errorThemes, setErrorThemes] = useState<ErrorTheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMistakes() {
      if (!token) return;
      setLoading(true);
      try {
        const response = await api("/v1/student/mistakes", {
          token,
          tenant: tenantSlug ?? undefined,
          params: { filter: activeFilter }
        });
        if (response.success) {
          setMistakes(response.data);
          setErrorThemes(response.error_themes || []);
        }
      } catch (error) {
        console.error("Mistakes fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMistakes();
  }, [token, tenantSlug, activeFilter]);

  const toggleBookmark = async (id: string) => {
    try {
      const response = await api(`/v1/student/mistakes/${id}/toggle-bookmark`, {
        method: "POST",
        token: token ?? undefined,
        tenant: tenantSlug ?? undefined
      });
      if (response.success) {
        setMistakes(prev => prev.map(m => m.id === id ? { ...m, status: response.is_bookmarked ? 'bookmarked' : 'recent' } : m));
      }
    } catch (error) {
      console.error("Toggle bookmark error:", error);
    }
  };

  const stats = [
    { label: 'Unresolved Errors', val: mistakes.length, icon: AlertCircle, color: 'text-rose-500' },
    { label: 'Bookmarks', val: mistakes.filter(m => m.status === 'bookmarked').length, icon: Bookmark, color: 'text-amber-500' },
    { label: 'Mastery Rate', val: '65%', icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Revision Streak', val: '4 Days', icon: Zap, color: 'text-blue-500' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase">Personal Archives</h1>
          <p className="text-muted-foreground text-sm font-medium">Your personal mistake log, bookmarks, and AI-curated revision bank.</p>
        </div>
        <div className="flex gap-2">
           <Button className="bg-primary text-white font-black rounded-xl h-11">
              GENERATE REVISION TEST
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Statistics & Filters */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
               <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 p-6 flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border flex items-center justify-center">
                     <s.icon className={cn("h-5 w-5", s.color)} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{s.label}</p>
                     <p className="text-xl font-black italic">{s.val}</p>
                  </div>
               </Card>
            ))}
        </div>

        {/* Search & Main List */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex bg-white dark:bg-zinc-950 p-4 rounded-2xl border dark:border-zinc-800 shadow-sm items-center justify-between gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                 <input 
                    type="text" 
                    placeholder="Search your history..." 
                    className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border-none text-[10px] font-black uppercase tracking-widest outline-none"
                 />
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                 {['all', 'bookmarked'].map((t) => (
                    <button
                       key={t}
                       className={cn(
                          "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                          activeFilter === t ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-400"
                       )}
                        onClick={() => setActiveFilter(t as 'all' | 'bookmarked')}
                    >
                       {t}
                    </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              {loading ? (
                 [1,2,3].map(i => <div key={i} className="h-48 bg-secondary/10 animate-pulse rounded-[2.5rem]" />)
              ) : mistakes.length > 0 ? mistakes.map((m) => (
                 <Card key={m.id} className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 overflow-hidden group hover:scale-[1.01] transition-all">
                    <div className="flex">
                       <div className={cn(
                          "w-2 shrink-0",
                          m.errorType === 'Conceptual' ? "bg-rose-500" : m.errorType === 'Calculation' ? "bg-amber-500" : "bg-blue-500"
                       )} />
                       <div className="flex-1 p-8">
                          <div className="flex justify-between items-start mb-6">
                             <div className="flex flex-wrap gap-2">
                                <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-none text-[8px] font-black uppercase px-3 py-1">{m.subject}</Badge>
                                <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-none text-[8px] font-black uppercase px-3 py-1">{m.topic}</Badge>
                                <Badge className={cn(
                                   "border-none text-[8px] font-black uppercase px-3 py-1",
                                   m.errorType === 'Conceptual' ? "bg-rose-500/10 text-rose-500" : m.errorType === 'Calculation' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                                )}>
                                   {m.errorType} Error
                                </Badge>
                             </div>
                             <button
                                onClick={() => toggleBookmark(m.id)}
                                className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                                m.status === 'bookmarked' ? "bg-amber-500 text-white" : "bg-zinc-50 dark:bg-zinc-900"
                             )}>
                                <Bookmark className="h-4 w-4" />
                             </button>
                          </div>

                          <div className="text-lg font-bold leading-relaxed mb-8">
                             {m.text.split('$').map((part, idx) =>
                                idx % 2 === 0 ? part : <InlineMath key={idx} math={part} />
                             )}
                          </div>

                          <div className="flex justify-between items-center pt-6 border-t border-dashed dark:border-zinc-800">
                             <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Failed Attempt</span>
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter italic">Review Required</span>
                             </div>
                             <Button variant="ghost" className="rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                                RE-ATTEMPT NOW <ChevronRight className="ml-1 h-3 w-3" />
                             </Button>
                          </div>
                       </div>
                    </div>
                 </Card>
              )) : (
                 <div className="text-center py-20 bg-secondary/5 rounded-[2.5rem] font-black uppercase tracking-widest text-zinc-400">
                    No mistakes found. Great work!
                 </div>
              )}
           </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-950 text-white p-8 overflow-hidden relative group">
              <div className="relative z-10">
                 <h3 className="text-xl font-black uppercase italic italic tracking-tighter mb-6">AI Recovery</h3>
                 <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary">Insight</p>
                       <p className="text-xs font-bold leading-relaxed text-zinc-400">
                          90% of your errors in <span className="text-white italic">Inorganic Chemistry</span> are factual. We&apos;ve compiled a list of 50 common oxidation states for you.
                       </p>
                    </div>
                    <Button className="w-full bg-white text-black font-black rounded-xl h-12 text-[10px] group-hover:bg-primary group-hover:text-white transition-all">
                       VIEW STUDY SHEET <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                 </div>
              </div>
              <History className="absolute -bottom-12 -right-12 h-48 w-48 opacity-5 rotate-12" />
           </Card>

           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 p-8">
              <h4 className="text-sm font-black uppercase italic tracking-tight mb-6">Error Themes</h4>
              <div className="space-y-4">
                  {(errorThemes.length > 0 ? errorThemes : [
                     { label: 'Conceptual', val: 0, color: 'bg-rose-500' },
                     { label: 'Calculation', val: 0, color: 'bg-amber-500' },
                     { label: 'Factual', val: 0, color: 'bg-blue-500' }
                  ]).map((t) => (
                     <div key={t.label} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span>{t.label}</span>
                           <span className="text-zinc-400">{t.val}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                           <div className={cn("h-full", t.color)} style={{ width: `${t.val}%` }} />
                        </div>
                     </div>
                  ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
