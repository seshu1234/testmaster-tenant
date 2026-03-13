"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { 
  ChevronRight, 
  Flag, 
  Clock, 
  Maximize,
  CheckCircle2,
  AlertCircle,
  Save,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

interface Question {
  id: string;
  text: string;
  type: 'MCQ' | 'TF' | 'FIB' | 'SUBJECTIVE';
  options?: string[];
  marks: number;
}

export default function StudentTestTakingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt");
  const { token, tenantSlug } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [testTitle, setTestTitle] = useState("ASSESSMENT IN PROGRESS");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttempt() {
      if (!token || !attemptId) return;
      try {
        const response = await api(`/v1/student/attempts/${attemptId}`, {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setQuestions(response.data.questions);
          setTimeLeft(response.data.time_left_seconds);
          setAnswers(response.data.existing_answers || {});
          if (response.data.test?.title) {
            setTestTitle(response.data.test.title);
          }
        }
      } catch (error) {
        console.error("Attempt fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAttempt();
  }, [token, attemptId, tenantSlug]);

  const questionsPool = questions;
  const currentQuestion = questionsPool[currentIdx];

  const handleSubmit = useCallback(async () => {
    if (!token || !attemptId) return;
    try {
      await api(`/v1/student/attempts/${attemptId}/submit`, {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({ answers })
      });
      router.push(`/student/tests/${params.id}/result?attempt=${attemptId}`);
    } catch (error) {
      console.error("Submit error:", error);
      // Fallback redirect
      router.push(`/student/tests/${params.id}/result?attempt=${attemptId}`);
    }
  }, [router, params.id, attemptId, token, tenantSlug, answers]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleSubmit]);

  // Auto-save & Sync
  useEffect(() => {
    const saveTimer = setInterval(async () => {
      if (!token || !attemptId || Object.keys(answers).length === 0) return;
      
      setIsSyncing(true);
      try {
        await api(`/v1/student/attempts/${attemptId}/answers`, {
          method: "POST",
          token,
          tenant: tenantSlug || undefined,
          body: JSON.stringify({ answers })
        });
      } catch (error) {
        console.error("Sync error:", error);
      } finally {
        setTimeout(() => setIsSyncing(false), 800);
      }
    }, 30000);
    return () => clearInterval(saveTimer);
  }, [token, attemptId, tenantSlug, answers]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (idx: number) => {
    setCurrentIdx(idx);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const setAnswer = (val: string | boolean) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };


  if (loading) return <div className="p-12 text-center animate-pulse font-black uppercase tracking-widest text-zinc-400">Arming assessment environment...</div>;
  if (!currentQuestion) return <div className="p-12 text-center font-black uppercase tracking-widest text-rose-500">Assessment questions not synchronized.</div>;

  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-black overflow-hidden select-none">
      {/* Main Container */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b bg-white dark:bg-zinc-950 px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:block">
               <h2 className="text-sm font-black italic tracking-tight uppercase">{testTitle}</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-full font-black tabular-nums transition-colors",
                timeLeft < 600 ? "bg-rose-500 text-white animate-pulse" : "bg-zinc-100 dark:bg-zinc-900 border"
             )}>
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
             </div>
             
             <div className="flex items-center gap-2">
                {isSyncing ? (
                   <span className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-2">
                      <Save className="h-3 w-3 animate-bounce" /> SYNCING...
                   </span>
                ) : (
                   <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3" /> SECURE
                   </span>
                )}
             </div>

             <Button className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-6 rounded-xl" onClick={handleSubmit}>
                FINISH TEST
             </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 relative overflow-y-auto p-8 md:p-12 lg:p-20 flex justify-center">
           <div className="w-full max-w-4xl space-y-12 pb-32">
              <div className="flex justify-between items-start">
                 <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                       <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-3 py-1">Q {currentIdx + 1}</Badge>
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{currentQuestion.type} • {currentQuestion.marks} MARKS</span>
                    </div>
                    <div className="text-2xl font-bold leading-relaxed text-zinc-800 dark:text-zinc-200">
                       {currentQuestion.text.split('$').map((part, i) => 
                          i % 2 === 0 ? part : <InlineMath key={i} math={part} />
                       )}
                    </div>
                 </div>
                 <Button 
                    variant="ghost" 
                    className={cn(
                       "h-12 w-12 rounded-2xl transition-all",
                       flagged.has(currentQuestion.id) ? "bg-amber-500 text-white" : "bg-zinc-100 dark:bg-zinc-900"
                    )}
                    onClick={toggleFlag}
                 >
                    <Flag className="h-5 w-5" />
                 </Button>
              </div>

              {/* Options */}
              <div className="grid gap-4">
                 {currentQuestion.type === 'MCQ' && currentQuestion.options?.map((opt, i) => (
                    <button 
                       key={i}
                       className={cn(
                          "w-full text-left p-6 rounded-[1.5rem] border-2 transition-all flex items-center gap-6 group",
                          answers[currentQuestion.id] === opt 
                             ? "bg-primary/5 border-primary shadow-xl ring-2 ring-primary/10" 
                             : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
                       )}
                       onClick={() => setAnswer(opt)}
                    >
                       <div className={cn(
                          "h-10 w-10 rounded-xl border-2 flex items-center justify-center font-black transition-all",
                          answers[currentQuestion.id] === opt ? "bg-primary border-primary text-white" : "border-zinc-200 dark:border-zinc-800 text-zinc-400 group-hover:border-zinc-400"
                       )}>
                          {String.fromCharCode(65 + i)}
                       </div>
                       <span className="text-lg font-bold">{opt}</span>
                    </button>
                 ))}

                 {currentQuestion.type === 'TF' && [true, false].map((val) => (
                    <button 
                       key={val.toString()}
                       className={cn(
                          "w-full text-left p-6 rounded-[1.5rem] border-2 transition-all flex items-center gap-6",
                          answers[currentQuestion.id] === val 
                             ? "bg-primary/5 border-primary shadow-xl" 
                             : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200"
                       )}
                       onClick={() => setAnswer(val.toString())}
                    >
                       <div className={cn(
                          "h-10 w-10 rounded-xl border-2 flex items-center justify-center font-black transition-all",
                          answers[currentQuestion.id] === val ? "bg-primary border-primary text-white" : "border-zinc-200 text-zinc-400"
                       )}>
                          {val ? 'TRUE' : 'FALSE'}
                       </div>
                       <span className="text-lg font-bold uppercase">{val ? 'Correct Statement' : 'Incorrect Statement'}</span>
                    </button>
                 ))}

                 {currentQuestion.type === 'FIB' && (
                    <textarea 
                       className="w-full p-8 rounded-[2rem] border-2 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 focus:border-primary outline-none text-xl font-bold min-h-[200px]"
                       placeholder="Enter your calculation steps and final result..."
                       value={typeof answers[currentQuestion.id] === 'string' ? answers[currentQuestion.id] as string : ''}
                       onChange={(e) => setAnswer(e.target.value)}
                    />
                 )}
              </div>
           </div>
        </main>

        {/* Bottom Nav */}
        <footer className="h-20 bg-white dark:bg-zinc-950 border-t px-8 flex items-center justify-between z-20">
           <Button 
              variant="outline" 
              className="rounded-xl font-black text-xs uppercase h-12 px-8"
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
           >
              PREVIOUS
           </Button>

           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-zinc-400 mr-2">SECURED PROCTORING ACTIVE</span>
              <Maximize className="h-4 w-4 text-primary" />
           </div>

           <Button 
              className="bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase h-12 px-8"
              onClick={() => setCurrentIdx(prev => Math.min(questionsPool.length - 1, prev + 1))}
              disabled={currentIdx === questionsPool.length - 1}
            >
              NEXT QUESTION
           </Button>
        </footer>
      </div>

      {/* Sidebar Palette */}
      <aside className={cn(
         "fixed inset-y-0 right-0 w-80 bg-white dark:bg-zinc-950 border-l shadow-2xl transition-transform transform z-30",
         sidebarOpen ? "translate-x-0" : "translate-x-full",
         "lg:relative lg:translate-x-0"
      )}>
         <div className="h-16 flex items-center justify-between px-6 border-b">
            <h3 className="text-xs font-black uppercase tracking-widest italic">Question Palette</h3>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
               <ChevronRight className="h-5 w-5" />
            </Button>
         </div>

         <div className="p-6 overflow-y-auto h-[calc(100%-4rem)] space-y-8">
            <div className="grid grid-cols-4 gap-3">
               {questionsPool.map((q, i) => (
                  <button 
                     key={q.id}
                     className={cn(
                        "h-12 w-12 rounded-xl border flex items-center justify-center text-xs font-black transition-all",
                        currentIdx === i ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-black" : "",
                        flagged.has(q.id) ? "bg-amber-500 text-white border-amber-600" : 
                        answers[q.id] !== undefined ? "bg-emerald-500 text-white border-emerald-600" : 
                        "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800"
                     )}
                     onClick={() => handleSelect(i)}
                  >
                     {i + 1}
                  </button>
               ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
               <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Legend</h4>
               <div className="grid grid-cols-2 gap-4">
                  {[
                     { label: 'Answered', color: 'bg-emerald-500' },
                     { label: 'Flagged', color: 'bg-amber-500' },
                     { label: 'Unvisited', color: 'bg-zinc-100 dark:bg-zinc-900 border' }
                  ].map((l, i) => (
                     <div key={i} className="flex items-center gap-2">
                        <div className={cn("h-3 w-3 rounded-md", l.color)} />
                        <span className="text-[10px] font-bold text-zinc-500">{l.label}</span>
                     </div>
                  ))}
               </div>
            </div>

            <Card className="bg-primary/5 border-primary/10 rounded-2xl p-4">
               <div className="flex gap-3">
                  <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-[10px] font-bold text-primary leading-tight uppercase tracking-tight">
                     TAB SWITCHING OR EXITING FULLSCREEN WILL RESULT IN AUTO-SUBMISSION.
                  </p>
               </div>
            </Card>
         </div>
      </aside>
    </div>
  );
}
