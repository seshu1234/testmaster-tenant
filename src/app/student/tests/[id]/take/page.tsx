"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useTestTakingStore } from "@/lib/store/test-taking-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Clock,
  ChevronRight,
  User,
  Maximize,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  type: string;
  content: { text?: string; [key: string]: unknown };
  options?: { id: string | number; text?: string; [key: string]: unknown }[];
}

interface GridItem {
  id: string;
  order: number;
  status: string;
}

export default function TestTakingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  
  const testId = params.id as string;
  const attemptId = searchParams.get("attempt");

  // Zustand Store
  const store = useTestTakingStore();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proctorWarning, setProctorWarning] = useState<string | null>(null);
  
  const startTimeRef = useRef<number>(Date.now());

  // Fullscreen & Proctoring Logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setProctorWarning("Tab switching is detected and logged for the instructor.");
        console.warn("User switched tab");
        // In real app, send beacon to backend
        if (token && user?.tenant_id && attemptId) {
            api(`/student/attempts/${attemptId}/flag/${testId}`, {
                method: "POST",
                token,
                tenant: user.tenant_id,
                body: JSON.stringify({ type: 'tab_switch', timestamp: new Date() })
            }).catch(() => {});
        }
      }
    };

    const handleFullscreenChange = () => {
      store.setFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [attemptId, testId, token, user?.tenant_id, store]);

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {
          setProctorWarning("Please enable Fullscreen to continue your assessment.");
      });
    }
  };

  const fetchQuestion = useCallback(
    async (qId?: string) => {
      if (!user || !token || !attemptId) return;
      setIsLoading(true);
      try {
        const url = `/student/tests/${testId}/questions?attempt=${attemptId}${qId ? `&question_id=${qId}` : ""}`;
        const response = await api(url, { token, tenant: user.tenant_id });
        
        if (response.data?.question) {
          setQuestion(response.data.question);
          setGrid(response.data.grid || []);
          setSelectedOptions(response.data.selected_options || []);
          startTimeRef.current = Date.now();
          
          if (response.data.total_seconds) {
              store.setTimeLeft(response.data.remaining_seconds);
          }
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [testId, attemptId, user, token, store],
  );

  useEffect(() => {
    if (user && token && attemptId) {
        fetchQuestion();
        store.setTestContext(testId, attemptId);
    }
  }, [fetchQuestion, attemptId, testId, user, token, store]);

  const handleSubmitTest = useCallback(async () => {
    if (!user || !token || !attemptId) return;
    setIsSubmitting(true);
    try {
      await api(`/student/attempts/${attemptId}/submit`, {
        method: "POST",
        token,
        tenant: user.tenant_id
      });
      store.reset();
      router.push(`/student/tests/${testId}/result?attempt=${attemptId}`);
    } catch (err) {
      console.error("Submission failed:", err);
      router.push(`/student/tests/${testId}/result?attempt=${attemptId}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, token, attemptId, testId, store, router]);

  // Timer Synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      if (store.timeLeft > 0) {
        store.setTimeLeft(store.timeLeft - 1);
      } else if (store.timeLeft === 1) {
          handleSubmitTest();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [store, handleSubmitTest]);

  const handleSaveAction = async (statusOverride: string, nextQid?: string) => {
    if (!question || !user || !token || !attemptId) return;

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    let status = statusOverride;
    
    if (status === "save_next") {
      status = selectedOptions.length > 0 ? "answered" : "not_answered";
    }

    try {
      setIsLoading(true);
      await api(`/student/attempts/${attemptId}/answers`, {
        method: "POST",
        token,
        tenant: user.tenant_id,
        body: JSON.stringify({
          question_id: question.id,
          selected_options: selectedOptions,
          status: status,
          time_spent: timeSpent,
        }),
      });

      // Update local store for resilience
      store.saveAnswer(question.id, {
        selectedOptions,
        status,
        timeSpent
      });

      fetchQuestion(nextQid);
    } catch (err) {
      console.error("Save failed:", err);
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!store.isFullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-[1000] flex flex-col items-center justify-center p-6 text-center">
        <Maximize className="h-16 w-16 text-primary mb-6 animate-bounce" />
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Fullscreen Required</h2>
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          To maintain assessment integrity, this test must be taken in fullscreen mode. 
          Your progress will be saved automatically.
        </p>
        <Button onClick={enterFullScreen} size="lg" className="rounded-xl px-12 h-14 text-lg font-bold shadow-xl">
          Enter Fullscreen & Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto flex flex-col h-screen overflow-hidden bg-[#f0f2f5] dark:bg-zinc-950 font-sans select-none">
      {/* NTA-style Header */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 px-6 py-2 border-b shrink-0 z-[60] shadow-sm">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h2 className="font-extrabold text-lg tracking-tight uppercase text-zinc-800 dark:text-zinc-100">
                    Online Assessment System
                </h2>
                <div className="text-[10px] font-bold text-zinc-400 -mt-1 tracking-widest uppercase">Proprietary Exam Engine v3.0</div>
            </div>
        </div>
        
        <div className="flex items-center gap-6">
            {proctorWarning && (
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-4 py-1.5 rounded-full text-xs font-bold border border-rose-100 dark:border-rose-900/50 animate-pulse">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {proctorWarning}
                </div>
            )}
            <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl border">
                <Clock className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Time Remaining</span>
                    <span className="font-mono text-xl font-black text-primary leading-tight">
                        {formatTime(store.timeLeft)}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main 5-Panel Container */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 relative">
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 z-[100] flex items-center justify-center backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <span className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Encrypting Packet...</span>
              </div>
            </div>
          )}

          {question ? (
            <>
              {/* Question Navigation Bar (SSC/NTA Style) */}
              <div className="px-6 py-3 border-b bg-[#f8f9fa] dark:bg-zinc-900/50 shrink-0 flex justify-between items-center text-sm z-10">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-white dark:bg-zinc-800 font-bold px-3 py-1 border-primary/20 text-primary">
                    QUESTION {grid.find((g) => g.id === question.id)?.order || 1}
                  </Badge>
                  <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 mx-1 hidden sm:block"></div>
                  <div className="flex gap-4 items-center">
                    <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">MARKS: <span className="text-emerald-600">+4</span> / <span className="text-rose-500">-1</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase">View In:</span>
                    <select className="text-xs font-bold bg-white dark:bg-zinc-800 border rounded-md px-3 py-1 outline-none ring-primary/20 focus:ring-2">
                        <option>English</option>
                        <option>Hindi</option>
                    </select>
                </div>
              </div>

              {/* Scrollable Question Content */}
              <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-2xl leading-relaxed font-semibold text-zinc-800 dark:text-zinc-100 border-l-4 border-primary pl-6 py-2">
                        {question.content?.text || "Question content is missing or corrupted."}
                    </div>

                    {question.type === "multiple_choice" && question.options && (
                    <div className="grid gap-4 mt-8">
                        {question.options.map((opt) => (
                        <div
                            key={String(opt.id)}
                            className={cn(
                            "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden",
                            selectedOptions.includes(String(opt.id))
                                ? "bg-primary/5 border-primary ring-1 ring-primary/10 shadow-lg shadow-primary/5"
                                : "bg-zinc-50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:border-zinc-200"
                            )}
                            onClick={() => setSelectedOptions([String(opt.id)])}
                        >
                            <div className={cn(
                                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                selectedOptions.includes(String(opt.id)) ? "border-primary bg-primary text-white" : "border-zinc-300 dark:border-zinc-700"
                            )}>
                                {selectedOptions.includes(String(opt.id)) && <div className="h-2 w-2 bg-white rounded-full" />}
                            </div>
                            <Label
                            htmlFor={String(opt.id)}
                            className="flex-1 cursor-pointer font-bold text-[17px] leading-snug select-none text-zinc-700 dark:text-zinc-200"
                            >
                            {opt.text}
                            </Label>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-4 border-t bg-white dark:bg-zinc-900 flex items-center justify-between shrink-0 z-[50] shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="font-bold border-2 rounded-xl h-12 px-6"
                    onClick={() =>
                      handleSaveAction(
                        selectedOptions.length > 0 ? "answered_marked" : "marked",
                        grid[grid.findIndex(g => g.id === question.id) + 1]?.id
                      )
                    }
                  >
                    Mark for Review & Next
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-bold h-12 px-6 text-zinc-500"
                    onClick={() => setSelectedOptions([])}
                  >
                    Clear Response
                  </Button>
                </div>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white font-black h-12 px-10 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 group"
                  onClick={() => handleSaveAction("save_next", grid[grid.findIndex(g => g.id === question.id) + 1]?.id)}
                >
                  SAVE & NEXT 
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </>
          ) : (
             <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-12 text-center">
                 <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                    <ShieldCheck className="h-12 w-12 text-primary" />
                 </div>
                 <h2 className="text-4xl font-black mb-4 tracking-tight">Assessment Coverage Complete</h2>
                 <p className="text-zinc-500 max-w-md text-xl font-medium leading-relaxed">
                    You have touched all assigned questions. Please review your responses in the sidebar before final handshake.
                 </p>
             </div>
          )}
        </div>

        {/* Intelligence Sidebar */}
        <div className="w-[380px] flex flex-col bg-white dark:bg-zinc-900 border-l shrink-0 z-[60] shadow-[-10px_0_30px_rgba(0,0,0,0.03)] overflow-hidden">
          
          {/* Student Profile Identity */}
          <div className="p-6 bg-[#f8f9fa] dark:bg-zinc-800/30 flex items-center gap-4 border-b">
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 p-1 relative overflow-hidden shadow-sm">
                  <User className="h-full w-full text-zinc-200" />
                  <div className="absolute inset-0 bg-primary/5" />
              </div>
              <div className="flex flex-col">
                  <h4 className="font-extrabold text-zinc-800 dark:text-zinc-100 truncate max-w-[200px] uppercase tracking-tight">
                      {user?.name || "Candidate 001"}
                  </h4>
                  <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Signal</span>
                  </div>
              </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 gap-px bg-zinc-100 dark:bg-zinc-800 border-b">
              <div className="bg-white dark:bg-zinc-900 p-4 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Answered</span>
                  <span className="text-xl font-black text-emerald-600">{grid.filter(g => g.status === 'answered' || g.status === 'answered_marked').length}</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Unanswered</span>
                  <span className="text-xl font-black text-rose-500">{grid.filter(g => g.status === 'not_answered').length}</span>
              </div>
          </div>

          {/* Dynamic Grid Panel */}
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 dark:bg-zinc-950/20 custom-scrollbar">
            <h5 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Question Matrix</h5>
            <div className="grid grid-cols-5 gap-3">
              {grid.map((item) => (
                <button
                  key={item.id}
                  onClick={() => fetchQuestion(item.id)}
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all border-2",
                    item.id === question?.id ? "border-primary scale-110 shadow-lg shadow-primary/20 z-10" : "border-transparent",
                    item.status === "answered" ? "bg-emerald-500 text-white" :
                    item.status === "not_answered" ? "bg-rose-500 text-white" :
                    item.status === "marked" ? "bg-purple-600 text-white" :
                    item.status === "answered_marked" ? "bg-purple-600 text-white ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-zinc-900" :
                    "bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-100 dark:border-zinc-700"
                  )}
                >
                  {item.order}
                </button>
              ))}
            </div>
          </div>

          {/* Final Handshake Panel */}
          <div className="p-6 bg-white dark:bg-zinc-900 border-t shadow-[0_-15px_30px_rgba(0,0,0,0.02)]">
            <Button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl uppercase tracking-widest"
            >
              {isSubmitting ? "Syncing..." : "Final Submit"}
            </Button>
            <p className="text-[9px] text-center text-zinc-400 mt-4 font-bold uppercase tracking-widest">
                Automated Integrity Check active
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
