"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useTestTakingStore } from "@/lib/store/test-taking-store";
import { Button } from "@/components/ui/button";
import {
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronDown,
  Info,
  List,
  CheckCircle2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { INSTRUCTIONS_HTML_1, INSTRUCTIONS_HTML_2 } from "@/lib/test-taking/exam-instructions-data";

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
  const { user, token, tenantSlug } = useAuth();
  
  const testId = params.id as string;
  const rawAttemptId = searchParams.get("attempt");
  const attemptId = rawAttemptId === "undefined" ? null : rawAttemptId;

  const store = useTestTakingStore();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proctorWarning, setProctorWarning] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // TCS Exam UI State
  const [viewState, setViewState] = useState<'instructions_1' | 'instructions_2' | 'verification' | 'exam'>('instructions_1');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [activeSection, setActiveSection] = useState('General');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [highContrast, setHighContrast] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [timerAlert, setTimerAlert] = useState<string | null>(null);
  
  const startTimeRef = useRef<number>(Date.now());
  const fullscreenAttempted = useRef(false);

  // Auto-request fullscreen on mount
  useEffect(() => {
    if (fullscreenAttempted.current) return;
    fullscreenAttempted.current = true;
    store.setFullScreen(true);
  }, [store]);

  // Enter Fullscreen
  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    if (viewState === 'exam') {
        // No-op: fullscreen is requested directly from the button onClick
    }
  }, [viewState])

  // Proctoring Logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && viewState === 'exam') {
        setProctorWarning("Tab switching is detected and logged for the instructor.");
        if (token && user && attemptId) {
            api(`/student/attempts/${attemptId}/flag/${testId}`, {
                method: "POST",
                token,
                tenant: tenantSlug || undefined,
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
  }, [attemptId, testId, token, user, tenantSlug, store, viewState]);

  const fetchQuestion = useCallback(
    async (qId?: string) => {
      if (!user || !token || !attemptId) return;
      setIsLoading(true);
      try {
        const url = `/student/tests/${testId}/questions?attempt=${attemptId}${qId ? `&question_id=${qId}` : ""}`;
        const response = await api(url, { token, tenant: tenantSlug || undefined });
        
        if (response.data?.question) {
          setFetchError(null);
          setQuestion(response.data.question);
          setGrid(response.data.grid || []);
          setSelectedOptions(response.data.selected_options || []);
          startTimeRef.current = Date.now();
          
          if (response.data.total_seconds) {
              store.setTimeLeft(response.data.remaining_seconds);
          }
        } else {
          setFetchError(response.error || "This test has no questions loaded yet.");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load questions";
        setFetchError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [testId, attemptId, user, token, store, tenantSlug],
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
        tenant: tenantSlug || undefined
      });
      store.reset();
      router.push(`/student/tests/${testId}/result?attempt=${attemptId}`);
    } catch (err) {
      console.error("Submission failed:", err);
      router.push(`/student/tests/${testId}/result?attempt=${attemptId}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, token, attemptId, testId, store, router, tenantSlug]);

  // Timer Synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      if (viewState !== 'exam') return; // only tick in exam
      
      if (store.timeLeft > 0) {
        store.setTimeLeft(store.timeLeft - 1);
        if (store.timeLeft === 601) setTimerAlert('10 Minutes Left!');
        if (store.timeLeft === 301) setTimerAlert('5 Minutes Remaining! Final check recommended.');
        if (store.timeLeft === 61) setTimerAlert('1 Minute Left! Systematic submission initiated.');
      } else if (store.timeLeft === 1) {
          handleSubmitTest();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [store, handleSubmitTest, viewState]);

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
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          question_id: question.id,
          selected_options: selectedOptions,
          status: status,
          time_spent: timeSpent,
        }),
      });

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
    if (!seconds) return "0:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (fetchError && !isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-[1000] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-rose-500 mb-6" />
        <h2 className="text-2xl font-bold mb-3 tracking-tight">Unable to Load Test</h2>
        <p className="text-muted-foreground max-w-md mb-8 text-base bg-rose-50 border border-rose-100 px-6 py-3 rounded-xl text-rose-700 font-medium">
          {fetchError}
        </p>
        <Button onClick={() => { setFetchError(null); fetchQuestion(); }} size="lg">Retry</Button>
      </div>
    );
  }

  // --- INSTRUCTION VIEW 1 ---
  if (viewState === 'instructions_1') {
      return (
          <div className="flex flex-col h-screen w-screen bg-white text-black font-arial overflow-hidden fixed inset-0 z-[1000]">
                <header className="h-[50px] border-b border-slate-300 flex items-center px-4 shrink-0 bg-white">
                    <h1 className="text-sm font-bold text-slate-800 uppercase">General Instructions:</h1>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 border-r border-slate-300 bg-white">
                        <div className="max-w-[1000px] mx-auto">
                            <div className="prose max-w-none text-sm text-slate-800" dangerouslySetInnerHTML={{ __html: INSTRUCTIONS_HTML_1 }} />
                        </div>
                    </div>
                    <div className="w-[180px] md:w-[220px] shrink-0 bg-[#f9f9f9] border-l border-slate-300 flex flex-col items-center pt-8 p-4 hidden md:flex">
                        <div className="w-[110px] h-[130px] bg-white border border-slate-400 p-1 mb-4 shadow-sm">
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <User className="w-16 h-16 text-slate-300" />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-slate-700 tracking-tight text-center">{user?.name || 'Guest Aspirant'}</div>
                    </div>
                </div>
                <footer className="h-[50px] border-t border-slate-300 flex items-center justify-between px-6 bg-[#f0f0f0]/30 shrink-0">
                    <button onClick={() => router.push('/student/dashboard')} className="text-[#337ab7] hover:underline text-xs flex items-center gap-1 font-bold">
                       <ChevronLeft className="w-3 h-3" /> Go to Dashboard
                    </button>
                    <Button 
                      onClick={() => setViewState('instructions_2')}
                      className="bg-[#337ab7] border border-[#2e6da4] hover:bg-[#286090] text-white px-8 rounded-sm text-sm font-medium h-8"
                    >
                        Next
                    </Button>
                </footer>
          </div>
      )
  }

  // --- INSTRUCTION VIEW 2 ---
  if (viewState === 'instructions_2') {
      return (
          <div className="flex flex-col h-screen w-screen bg-white text-black font-arial overflow-hidden fixed inset-0 z-[1000]">
                <header className="py-8 border-b border-slate-300 bg-white flex flex-col items-center shrink-0 shadow-sm relative z-10">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter uppercase">TestMaster Online Exam</h1>
                    <div className="w-full max-w-[1240px] mt-2 px-10 flex justify-between text-sm font-black text-slate-900">
                        <span>Duration: {Math.round(grid.length * 1.5)} Mins</span>
                        <span>Maximum Marks: {grid.length * 4}</span>
                    </div>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-10 bg-white border-r border-slate-300">
                        <div className="max-w-[1000px] mx-auto flex flex-col min-h-full">
                            <div className="text-sm font-bold text-slate-800 mb-6 italic">Read the following instructions carefully.</div>
                            <div className="prose max-w-none text-sm text-slate-900 flex-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: INSTRUCTIONS_HTML_2 }} />
                            
                            <div className="mt-8 pt-6 border-t border-slate-300 space-y-6">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="font-bold text-slate-900">Choose your default language:</span>
                                    <div className="relative">
                                        <select 
                                            value={selectedLang} 
                                            onChange={(e) => setSelectedLang(e.target.value)}
                                            className="appearance-none bg-white border border-slate-300 text-slate-600 py-0.5 px-3 pr-8 rounded leading-tight focus:outline-none focus:border-[#337ab7] text-xs font-medium"
                                        >
                                            <option>English</option>
                                            <option>Hindi</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-400">
                                            <ChevronDown className="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-black text-[13px] text-slate-900 uppercase">Declaration:</h4>
                                    <label className="flex items-start gap-4 cursor-pointer group p-2 rounded transition-all hover:bg-slate-50">
                                        <div className="flex items-center h-5">
                                            <input 
                                                type="checkbox" 
                                                checked={isConfirmed}
                                                onChange={(e) => setIsConfirmed(e.target.checked)}
                                                className="w-4 h-4 accent-[#5bc0de] border-slate-300 rounded cursor-pointer"
                                            />
                                        </div>
                                        <span className="text-[13px] font-bold leading-relaxed text-slate-700 group-hover:text-black transition-colors select-none">
                                            I have read all the instructions carefully and have understood them. I agree not to cheat or use unfair means.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-[180px] md:w-[220px] shrink-0 bg-[#f9f9f9] border-l border-slate-300 flex flex-col items-center pt-8 p-4 hidden md:flex">
                        <div className="w-[110px] h-[130px] bg-white border border-slate-400 p-1 mb-4">
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <User className="w-16 h-16 text-slate-300" />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-slate-700 tracking-tight text-center">{user?.name || 'Guest'}</div>
                    </div>
                </div>
                <footer className="h-[52px] border-t border-slate-300 flex items-center px-6 bg-[#f0f0f0]/30 shrink-0 relative z-20">
                    <div className="flex-1 flex justify-between items-center max-w-[1240px] mx-auto w-full">
                        <Button 
                          variant="outline"
                          onClick={() => setViewState('instructions_1')}
                          className="rounded-sm border-slate-400 bg-[#337ab7]/10 text-slate-700 px-6 h-8 text-[13px] font-bold"
                        >
                            Previous
                        </Button>
                        <Button 
                          onClick={() => setViewState('verification')}
                          disabled={!isConfirmed}
                          className={cn(
                             "rounded-sm text-[13px] font-bold px-10 h-8 transition-all border-b-2",
                              isConfirmed 
                                ? "bg-[#5bc0de] hover:bg-[#46b8da] text-white border-[#2a91af]" 
                                : "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                          )}
                        >
                            I am ready to begin
                        </Button>
                    </div>
                </footer>
          </div>
      )
  }

  // --- VERIFICATION VIEW ---
  if (viewState === 'verification') {
      return (
          <div className="flex flex-col h-screen w-screen bg-[#f0f0f0] text-black font-arial overflow-hidden fixed inset-0 z-[1000]">
                <header className="h-[50px] bg-[#333] text-white flex items-center px-4 shrink-0 font-bold text-lg">
                    Candidate Verification
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex items-center justify-center p-6 border-r border-slate-300">
                        <div className="bg-white border-2 border-slate-300 w-full max-w-2xl shadow-2xl rounded-sm overflow-hidden flex flex-col scale-95 md:scale-100 transition-transform">
                            <div className="bg-slate-100 p-4 border-b border-slate-300 flex items-center justify-between">
                                <span className="font-bold uppercase text-xs text-slate-600 tracking-widest">Aspirant Profile Confirmation</span>
                                <div className="bg-[#337ab7] text-white px-3 py-1 text-[10px] font-black uppercase rounded-full">Gate Portal: Active</div>
                            </div>
                            <div className="p-8 flex flex-col md:flex-row gap-8">
                                <div className="space-y-4 flex flex-col items-center">
                                    <div className="w-[150px] h-[180px] bg-white border border-slate-400 p-1">
                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center border border-slate-200">
                                            <User className="w-20 h-20 text-slate-200" />
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Live Photo Match: 98.4%</div>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                        <div>
                                            <div className="text-[9px] font-bold text-slate-500 uppercase">Full Name</div>
                                            <div className="text-base font-black text-slate-900">{user?.name || 'Guest'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-bold text-slate-500 uppercase">System Number</div>
                                            <div className="text-base font-black text-slate-900">C001</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-bold text-slate-500 uppercase">Roll Number</div>
                                            <div className="text-base font-black text-slate-900">TM-2026-X</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-bold text-slate-500 uppercase">Exam Name</div>
                                            <div className="text-sm font-black text-slate-900 leading-tight">TestMaster Online Examination</div>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-[11px] text-slate-700 italic">
                                        &quot;I confirm that the photograph and identity details displayed above belong to me. I am appearing for the examination in accordance with the official rules.&quot;
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-200">
                                 <Button 
                                    variant="outline"
                                    onClick={() => setViewState('instructions_2')}
                                    className="rounded-none border-slate-400 bg-white text-xs font-bold"
                                 >
                                     Back
                                 </Button>
                                 <Button 
                                   onClick={() => {
                                      enterFullScreen();
                                      setViewState('exam');
                                    }}
                                   className="bg-[#337ab7] hover:bg-[#2e6da4] text-white rounded-none px-12 h-12 text-sm font-black uppercase tracking-widest border-b-4 border-[#122b40] active:border-b-0 active:translate-y-1"
                                 >
                                     I Confirm &amp; Begin Exam
                                 </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="h-10 bg-[#333] text-white/50 text-[9px] flex items-center justify-center uppercase font-bold tracking-[0.2em] shrink-0">
                    Candidate Authentication Portal • High Fidelity Simulation
                </footer>
          </div>
      )
  }

  // --- EXAM VIEW ---
  const Watermark = () => (
      <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.03] select-none overflow-hidden rotate-[-25deg] flex flex-wrap gap-20 items-center justify-center p-20 scale-150">
          {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="text-4xl font-black text-slate-900 whitespace-nowrap">
                  TM-2026-X • {new Date().toLocaleDateString()} • CONFIDENTIAL
              </div>
          ))}
      </div>
  )

  const fontSizeMap = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
  }

  const currentSectionIndex = grid.findIndex(g => g.id === question?.id) || 0;
  const isLastQuestion = currentSectionIndex === grid.length - 1;

  return (
    <div className={cn(
        "flex flex-col h-screen w-screen overflow-hidden font-arial select-none transition-colors relative fixed inset-0 z-[1000]",
        highContrast ? "bg-black text-yellow-400" : "bg-white text-black"
    )} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
       <Watermark />
       
       {timerAlert && (
           <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white px-8 py-3 rounded-none border-2 border-white shadow-2xl animate-bounce font-black uppercase tracking-widest text-sm">
               {timerAlert}
               <button onClick={() => setTimerAlert(null)} className="ml-4 hover:opacity-50 underline text-[10px]">Dismiss</button>
           </div>
       )}

       {/* Authentic Header */}
       <header className={cn(
           "h-[50px] flex items-center justify-between px-2 shrink-0 border-b-2 z-50",
           highContrast ? "bg-black text-yellow-400 border-yellow-400" : "bg-[#333] text-white border-white"
       )}>
          <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 hover:bg-white/10 rounded"
              >
                  <List className="w-5 h-5" />
              </button>
              <div className="text-lg font-bold hidden sm:block">System Name: C001</div>
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded border border-white/20">
                  <span className="text-[9px] font-bold uppercase tracking-widest mr-1">Font</span>
                  {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
                      <button 
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={cn(
                            "w-6 h-6 flex items-center justify-center rounded text-[10px] uppercase font-black transition-all",
                            fontSize === size ? "bg-blue-600 text-white" : "hover:bg-white/20"
                        )}
                      >
                          {size}
                      </button>
                  ))}
                  <div className="w-px h-4 bg-white/20 mx-1" />
                  <button 
                    onClick={() => setHighContrast(!highContrast)}
                    className={cn(
                        "px-2 h-6 flex items-center justify-center rounded text-[10px] uppercase font-black transition-all border",
                        highContrast ? "bg-yellow-400 text-black border-yellow-400" : "border-white/20 hover:bg-white/20"
                    )}
                  >
                      Contrast
                  </button>
              </div>
          </div>
          <div className="text-lg font-bold truncate max-w-[40%]">TestMaster Online Exam</div>
          <div className="flex items-center gap-2 pr-4">
            {proctorWarning && (
                <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Alert Captured
                </div>
            )}
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter">Candidate Name:</span>
            <span className="text-sm font-bold text-white">{user?.name || "Guest Aspirant"}</span>
            <div className="bg-white/10 w-8 h-8 rounded border border-white/20 ml-2 overflow-hidden flex items-center justify-center">
                <User className="w-6 h-6 text-white/50" />
            </div>
          </div>
       </header>

       <div className="flex flex-1 overflow-hidden">
          {/* Main Question Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-white border-r-4 border-slate-300 relative z-30">
             
             {/* Section Tabs */}
             <div className="bg-[#f0f0f0] border-b border-gray-400 px-1 pt-1 flex items-end h-[40px] shrink-0">
                 <button 
                  onClick={() => setActiveSection('General')}
                  className={cn(
                    "px-4 py-1.5 text-sm font-bold mr-1 rounded-t border-t border-l border-r",
                    activeSection === 'General' ? "bg-[#337ab7] text-white border-[#337ab7]" : "bg-white text-black border-gray-400"
                  )}
                 >
                     General
                     <Info className="inline-block w-3 h-3 ml-2 text-current opacity-70" />
                 </button>
             </div>

             {/* Question Header Bar */}
             <div className="flex justify-between items-center bg-white border-b border-black p-2 shrink-0">
                 <h2 className="text-lg font-bold text-[#c00] underline">Question No. {(Math.max(0, currentSectionIndex)) + 1}</h2>
                 <div className="flex items-center gap-4 text-sm font-bold">
                    <span className="text-black">Marks: <span className="text-green-600">+4</span> <span className="text-red-600">-1</span></span>
                    <div className="flex items-center gap-1 text-black">
                        View In: 
                        <select className="border border-gray-400 text-sm p-0.5 rounded-sm">
                            <option>English</option>
                        </select>
                    </div>
                 </div>
             </div>

              <div className="flex-1 flex overflow-hidden relative">
                  {/* Left: Question Text */}
                  <div className={cn(
                      "flex-1 overflow-y-auto p-4 border-r",
                      highContrast ? "border-yellow-400 bg-black" : "border-gray-300 bg-white"
                  )}>
                      <div className={cn("leading-relaxed font-medium", fontSizeMap[fontSize])}>
                          {question?.content?.text || "Loading..."}
                      </div>
                  </div>
                  
                  {/* Right: Options */}
                  <div className={cn(
                      "flex-1 overflow-y-auto p-4",
                      highContrast ? "bg-black" : "bg-[#f9f9f9]"
                  )}>
                      <div className="space-y-4">
                        {question && question.type === "multiple_choice" && question.options?.map((opt, idx) => {
                            const isSelected = selectedOptions.includes(String(opt.id))
                            return (
                                <label key={opt.id} className={cn(
                                    "flex items-start gap-4 cursor-pointer group p-2 rounded-lg transition-colors border",
                                    highContrast 
                                        ? "border-yellow-400/20 hover:bg-yellow-400/10" 
                                        : "border-transparent hover:bg-gray-100"
                                )}>
                                    <span className={cn(
                                        "flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold transition-colors shrink-0",
                                        highContrast 
                                            ? "border-yellow-400 group-hover:bg-yellow-400 group-hover:text-black" 
                                            : "border-gray-400 group-hover:border-blue-500",
                                        isSelected && !highContrast ? "bg-blue-600 text-white border-blue-600" : ""
                                    )}>
                                        {idx + 1}
                                    </span>
                                    <input 
                                        type="radio" 
                                        name={`q-${question.id}`}
                                        checked={isSelected}
                                        onChange={() => setSelectedOptions([String(opt.id)])}
                                        className={cn(
                                            "mt-1 w-4 h-4 focus:ring-2",
                                            highContrast ? "accent-yellow-400 ring-yellow-400" : "text-blue-600 focus:ring-blue-500 border-gray-300"
                                        )}
                                    />
                                    <span className={cn(
                                        "font-medium transition-colors", 
                                        fontSizeMap[fontSize], 
                                        highContrast ? "group-hover:text-yellow-200" : "group-hover:text-blue-700"
                                    )}>
                                        {opt.text}
                                    </span>
                                </label>
                            )
                        })}
                      </div>
                  </div>
              </div>

             {/* Footer Button Bar */}
             <footer className="h-[60px] border-t border-gray-400 bg-white flex items-center justify-between px-4 shrink-0 overflow-x-auto min-w-0">
                <div className="flex gap-2 whitespace-nowrap">
                    <button 
                        onClick={() => {
                            const prevQ = grid[currentSectionIndex - 1];
                            if (prevQ) fetchQuestion(prevQ.id);
                        }}
                        disabled={currentSectionIndex <= 0}
                        className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-sm font-bold text-black ring-1 ring-gray-200 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => handleSaveAction(selectedOptions.length > 0 ? "answered_marked" : "marked", grid[currentSectionIndex + 1]?.id)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-sm font-bold text-black ring-1 ring-gray-200"
                    >
                        Mark for Review &amp; Next
                    </button>
                    <button 
                         onClick={() => setSelectedOptions([])}
                         className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-sm font-bold text-black ring-1 ring-gray-200"
                    >
                        Clear Response
                    </button>
                </div>
                
                <button 
                    onClick={() => handleSaveAction("save_next", grid[currentSectionIndex + 1]?.id)}
                    disabled={isLastQuestion}
                    className="px-6 py-2 bg-[#337ab7] hover:bg-[#286090] text-white rounded text-sm font-bold shadow-sm disabled:opacity-50 whitespace-nowrap ml-4"
                >
                    Save &amp; Next
                </button>
             </footer>
          </main>

           {/* Right Sidebar */}
           <aside className={cn(
               "w-full lg:w-[300px] bg-[#f0f0f0] flex flex-col shrink-0 border-l border-gray-300 absolute lg:relative inset-0 z-40 transition-transform duration-300 lg:translate-x-0 text-black",
               showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
           )}>
              <button 
                onClick={() => setShowSidebar(false)}
                className="lg:hidden absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg z-50"
              >
                  <X className="w-4 h-4 text-black" />
              </button>
              
              <div className="p-3 flex items-center gap-4 bg-white border-b border-gray-300 shrink-0">
                  <div className="w-[85px] h-[95px] bg-slate-50 border border-gray-400 overflow-hidden relative shadow-inner">
                      <User className="w-full h-full text-gray-300 p-3" />
                  </div>
                  <div className="flex flex-col gap-1">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Candidate Name</div>
                      <div className="text-[13px] font-black text-slate-900 leading-none truncate max-w-[150px]">{user?.name || "Guest Aspirant"}</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mt-2">Roll Number</div>
                      <div className="text-[13px] font-black text-slate-900 leading-none">TM-2026-X</div>
                  </div>
              </div>

             <div className="p-2 flex items-center justify-between font-bold text-lg shrink-0 bg-[#5bc0de] text-white">
                <span>Time Left:</span>
                <span>{formatTime(store.timeLeft)}</span>
             </div>

               <div className="p-3 bg-white border-b border-gray-300 text-[10px] shrink-0">
                   <div className="font-bold mb-3 text-slate-700 uppercase tracking-widest text-[9px]">Legend:</div>
                   <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 border border-gray-400 bg-white flex items-center justify-center font-bold text-[10px]">01</div>
                            <span className="text-slate-600">Not Visited</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#d9534f] text-white flex items-center justify-center font-bold text-[10px]" 
                                 style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}>03</div>
                            <span className="text-slate-600">Not Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#5cb85c] text-white flex items-center justify-center font-bold text-[10px]" 
                                 style={{ clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)' }}>05</div>
                            <span className="text-slate-600">Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-7 h-7 rounded-full bg-[#6f5499] text-white flex items-center justify-center font-bold text-[10px]">07</div>
                             <span className="text-slate-600">Marked for Review</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <div className="w-7 h-7 rounded-full bg-[#6f5499] text-white flex items-center justify-center font-bold text-[10px] relative">
                                09
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-[1px] border border-white">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                </div>
                            </div>
                            <span className="text-slate-600 leading-tight">Ans &amp; Marked for Review</span>
                        </div>
                   </div>
               </div>
             
             <div className="bg-[#e0e0e0] p-2 font-bold text-sm border-b border-gray-300 shrink-0">
                 General Palette:
             </div>

             <div className="flex-1 overflow-y-auto bg-white p-2 text-black">
                  <div className="flex flex-wrap gap-2 content-start">
                      {grid.map((g, idx) => {
                           const state = g.status
                           const isCurrent = question?.id === g.id
                             let styleClass = "w-9 h-9 border border-gray-300 flex items-center justify-center font-bold text-xs cursor-pointer hover:opacity-90 relative transition-all "
                             
                             if (state === 'not_visited') {
                                 styleClass += "bg-white text-black"
                             } else if (state === 'not_answered') { 
                                 styleClass += "bg-[#d9534f] text-white border-0" 
                             } else if (state === 'answered') {
                                 styleClass += "bg-[#5cb85c] text-white border-0"
                             } else if (state === 'marked') {
                                 styleClass += "bg-[#6f5499] text-white rounded-full border-0"
                             } else if (state === 'answered_marked') {
                                 styleClass += "bg-[#6f5499] text-white rounded-full border-0"
                             }

                             const shapeStyle: React.CSSProperties = {}
                             if (isCurrent) {
                                 shapeStyle.boxShadow = '0 0 0 2px black, 0 0 0 4px white inset'
                             }
                             if (state === 'not_answered') {
                                 shapeStyle.clipPath = 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)'
                             }
                             if (state === 'answered') {
                                 shapeStyle.clipPath = 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)'
                             }

                             return (
                                 <button 
                                    key={g.id}
                                    onClick={() => fetchQuestion(g.id)}
                                    className={cn(styleClass, isCurrent ? "z-10" : "")}
                                    style={shapeStyle}
                                 >
                                     {(idx + 1).toString().padStart(2, '0').replace(/^0/, '')}
                                    {state === 'answered_marked' && (
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-[1px] border border-white z-10 shadow-sm">
                                             <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </button>
                            )
                      })}
                  </div>
             </div>

             {/* Final Submit */}
             <div className="bg-[#eef] p-2 border-t border-gray-400 shrink-0 z-[60] relative">
                 <button 
                    type="button"
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className="w-full bg-[#5cb85c] hover:bg-[#449d44] text-white py-2 font-bold rounded border border-[#4cae4c] shadow relative z-[80] cursor-pointer"
                 >
                     {isSubmitting ? "Submitting..." : "Submit Test"}
                 </button>
             </div>
          </aside>
       </div>
    </div>
  );
}
