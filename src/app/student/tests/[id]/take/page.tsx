"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ChevronRight, 
  Clock, 
  Save,
  ChevronLeft,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
  subject?: string;
  section?: string;
}

type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';

interface Test {
  id: string;
  title: string;
  test_pattern: string;
  has_sectional_timers: boolean;
  section_time_limits?: Record<string, number>;
  settings: Record<string, unknown>;
}

export default function StudentTestTakingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt");
  const { token, tenantSlug, user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [statusMap, setStatusMap] = useState<Record<string, QuestionStatus>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize status map when questions load
  useEffect(() => {
    async function fetchAttempt() {
      if (!token || !attemptId) return;
      try {
        const response = await api(`/student/attempts/${attemptId}`, {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          const qData = response.data.questions || [];
          setQuestions(qData);
          setTimeLeft(response.data.time_left_seconds);
          setAnswers(response.data.existing_answers || {});
          setTest(response.data.test);
          
          // Initial status logic
          const initialStatus: Record<string, QuestionStatus> = {};
          qData.forEach((q: Question, idx: number) => {
             if (idx === 0) initialStatus[q.id] = 'not-answered';
             else initialStatus[q.id] = 'not-visited';
             
             if (response.data.existing_answers?.[q.id]) {
                initialStatus[q.id] = 'answered';
             }
          });
          setStatusMap(initialStatus);
        }
      } catch {
        setLoading(false);
      }
    }
    fetchAttempt();
  }, [token, attemptId, tenantSlug]);

  const currentQuestion = questions[currentIdx];
  const activeSubject = useMemo(() => currentQuestion?.subject || 'General', [currentQuestion]);
  const subjects = useMemo(() => Array.from(new Set(questions.map(q => q.subject || 'General'))), [questions]);

  const handleSubmit = useCallback(async () => {
    if (!token || !attemptId) return;
    try {
      await api(`/student/attempts/${attemptId}/submit`, {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({ answers })
      });
      router.push(`/student/tests/${params.id}/result?attempt=${attemptId}`);
    } catch {
      router.push(`/student/tests/${params.id}/result?attempt=${attemptId}`);
    }
  }, [router, params.id, attemptId, token, tenantSlug, answers]);

  // Sectional Timer Logic (Banking Style)
  const isSectionLocked = useMemo(() => {
    return test?.has_sectional_timers ?? false;
  }, [test]);

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

  // Sync Answers
  useEffect(() => {
    const saveTimer = setInterval(async () => {
      if (!token || !attemptId || Object.keys(answers).length === 0) return;
      setIsSyncing(true);
      try {
        await api(`/student/attempts/${attemptId}/answers`, {
           method: "POST",
           token,
           tenant: tenantSlug || undefined,
           body: JSON.stringify({ answers })
        });
      } catch {
        // Fail silently
      } finally {
        setTimeout(() => setIsSyncing(false), 800);
      }
    }, 10000);
    return () => clearInterval(saveTimer);
  }, [token, attemptId, tenantSlug, answers]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (idx: number) => {
    const q = questions[idx];
    if (isSectionLocked && q.subject !== activeSubject) {
      // In strict sectional timers, you can't jump subjects manually
      // This is common in Bank exams (IBPS/TCS iON Banking Pattern)
      return;
    }
    if (statusMap[q.id] === 'not-visited') {
       setStatusMap(prev => ({ ...prev, [q.id]: 'not-answered' }));
    }
    setCurrentIdx(idx);
  };

  const handleAction = (action: 'save-next' | 'clear' | 'mark-review' | 'mark-review-next') => {
     if (!currentQuestion) return;

     const id = currentQuestion.id;
     let nextIdx = currentIdx;

     setStatusMap(prev => {
        const nextMap = { ...prev };
        const hasAnswer = answers[id] !== undefined && answers[id] !== '';

        if (action === 'save-next') {
           if (hasAnswer) nextMap[id] = 'answered';
           else nextMap[id] = 'not-answered';
           nextIdx = Math.min(questions.length - 1, currentIdx + 1);
        } else if (action === 'clear') {
           setAnswers(prevAns => {
              const next = { ...prevAns };
              delete next[id];
              return next;
           });
           nextMap[id] = 'not-answered';
        } else if (action === 'mark-review') {
           if (hasAnswer) nextMap[id] = 'answered-marked';
           else nextMap[id] = 'marked';
        } else if (action === 'mark-review-next') {
           if (hasAnswer) nextMap[id] = 'answered-marked';
           else nextMap[id] = 'marked';
           nextIdx = Math.min(questions.length - 1, currentIdx + 1);
        }

        const nextQ = questions[nextIdx];
        if (nextMap[nextQ.id] === 'not-visited') {
           nextMap[nextQ.id] = 'not-answered';
        }

        return nextMap;
     });

     if (nextIdx !== currentIdx) {
        setCurrentIdx(nextIdx);
     }
  };

  // Stats for summary
  const stats = useMemo(() => {
     const counts = { answered: 0, not_answered: 0, not_visited: 0, marked: 0, marked_answered: 0 };
     Object.values(statusMap).forEach(s => {
        if (s === 'answered') counts.answered++;
        if (s === 'not-answered') counts.not_answered++;
        if (s === 'not-visited') counts.not_visited++;
        if (s === 'marked') counts.marked++;
        if (s === 'answered-marked') counts.marked_answered++;
     });
     return counts;
  }, [statusMap]);

  if (loading) return <div className="p-12 text-zinc-600 animate-pulse font-black uppercase tracking-widest text-zinc-600">Arming assessment environment...</div>;
  if (!currentQuestion) return <div className="p-12 text-zinc-600 font-black uppercase tracking-widest text-zinc-600">Assessment questions not synchronized.</div>;

  const patterns: Record<string, { color: string; label: string; footer: string }> = {
     nta: { color: "#004b91", label: "NTA (JEE Mains)", footer: "© NTA | TestMaster Proctoring Enabled" },
     tcs: { color: "#1e3a8a", label: "TCS iON (Banking)", footer: "© TCS iON | IBPS Pattern Enabled" },
     ssc: { color: "#b91c1c", label: "SSC (TCS-2 Pattern)", footer: "© Staff Selection Commission | TestMaster" },
     custom: { color: "#27272a", label: "Institutional Assessment", footer: "Professional Assessment Engine" }
  };

  const patternConfig = patterns[test?.test_pattern as keyof typeof patterns] || patterns.nta;

  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden select-none font-sans">
      <div className="flex flex-col flex-1 h-full min-w-0">
        
        {/* DYNAMIC PATTERN HEADER */}
        <header className="h-14 text-white flex items-center justify-between px-4 shrink-0 shadow-lg z-20" style={{ backgroundColor: patternConfig.color }}>
           <div className="flex items-center gap-4">
              <span className="text-sm font-black tracking-widest uppercase">{test?.title}</span>
              <div className="h-4 w-px bg-white/30 hidden md:block" />
              <div className="hidden md:flex items-center gap-2">
                 <Badge className="bg-white/10 text-white border-white/20 text-[9px] font-black uppercase">{patternConfig.label}</Badge>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-white/90">
                 <HelpCircle className="h-3.5 w-3.5" />
                 <span>Help & Instructions</span>
              </div>
              <Button size="sm" variant="outline" className="h-8 bg-transparent border-white/30 text-white hover:bg-white/10 text-[10px] uppercase font-black">
                 Question Paper
              </Button>
           </div>
        </header>

        <div className="h-10 bg-zinc-100 border-b flex items-center px-4 gap-1 shrink-0 overflow-x-auto no-scrollbar">
           {subjects.map((subject) => (
              <Button 
                key={subject}
                variant="ghost"
                className={cn(
                   "h-full px-6 rounded-none border-b-2 text-[10px] font-black uppercase tracking-widest transition-all",
                   activeSubject === subject 
                      ? "border-current bg-white shadow-sm" 
                      : "border-transparent text-zinc-500 hover:text-zinc-900",
                   isSectionLocked && activeSubject !== subject ? "opacity-30 cursor-not-allowed" : ""
                )}
                style={{ borderBottomColor: activeSubject === subject ? patternConfig.color : 'transparent', color: activeSubject === subject ? patternConfig.color : undefined }}
                onClick={() => handleSelect(questions.findIndex(q => (q.subject || 'General') === subject))}
              >
                {subject} {isSectionLocked && activeSubject === subject && <Clock className="ml-2 h-3 w-3 animate-pulse" />}
              </Button>
           ))}
        </div>

        {/* Action Panel for Section */}
        <div className="h-8 bg-zinc-50 border-b flex items-center px-4 justify-between shrink-0">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-zinc-400">Sections:</span>
              <Badge className="bg-[#004b91] text-white border-none text-[8px] font-black uppercase px-2 py-0.5">MCQ Section</Badge>
           </div>
           <div className="text-[10px] font-black uppercase text-zinc-400">Time Left: <span className="text-zinc-900">{formatTime(timeLeft)}</span></div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
           {/* Question display */}
           <div className="flex-1 flex flex-col bg-white border-r min-w-0">
              <div className="p-4 border-b flex items-center justify-between shrink-0 bg-zinc-50/50">
                 <h4 className="text-xs font-black uppercase text-zinc-900">Question No. {currentIdx + 1}</h4>
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Marks: <span className="text-green-600">+{currentQuestion.marks}</span> / <span className="text-red-500">0.0</span></span>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 select-text">
                 {/* Question Text */}
                 <div className="text-base font-bold text-zinc-800 leading-relaxed">
                    {currentQuestion.text.split('$').map((part, i) => 
                       i % 2 === 0 ? part : <InlineMath key={i} math={part} />
                    )}
                 </div>

                 <div className="h-px bg-zinc-100" />

                 {/* Options Area */}
                 <div className="space-y-4">
                    {currentQuestion.type === 'MCQ' && (
                       <div className="grid gap-3">
                          {currentQuestion.options?.map((opt, i) => (
                             <button 
                                key={i}
                                className={cn(
                                   "w-full text-left p-4 rounded-lg border-2 flex items-center gap-4 transition-all group",
                                   answers[currentQuestion.id] === opt 
                                      ? "bg-blue-50/50 border-[#004b91]" 
                                      : "bg-white border-zinc-100 hover:border-zinc-200"
                                )}
                                onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: opt }))}
                             >
                                <div className={cn(
                                   "h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all",
                                   answers[currentQuestion.id] === opt ? "bg-[#004b91] border-[#004b91] text-white" : "border-zinc-300 text-zinc-400"
                                )}>
                                   {i + 1}
                                </div>
                                <span className="text-sm font-semibold">{opt}</span>
                             </button>
                          ))}
                       </div>
                    )}

                    {currentQuestion.type === 'FIB' && (
                       <div className="max-w-md">
                          <label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block">Enter Numerical Value</label>
                          <input 
                             type="text"
                             className="w-full p-4 rounded-lg border-2 bg-zinc-50 border-zinc-200 focus:border-[#004b91] outline-none text-lg font-bold"
                             placeholder="0.00"
                             value={typeof answers[currentQuestion.id] === 'string' ? answers[currentQuestion.id] as string : ''}
                             onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                          />
                       </div>
                    )}
                 </div>
              </div>

              {/* NTA STYLE BUTTON FOOTER */}
              <footer className="h-16 border-t px-4 flex items-center justify-between shrink-0 bg-white">
                 <div className="flex gap-2">
                    <Button 
                       className="bg-[#004b91] hover:bg-blue-800 text-white text-[10px] font-black uppercase h-9 px-6 rounded-md"
                       onClick={() => handleAction('save-next')}
                    >
                       Save & Next
                    </Button>
                    <Button 
                       variant="outline" 
                       className="border-zinc-200 text-zinc-600 text-[10px] font-black uppercase h-9 px-6 rounded-md hover:bg-zinc-50"
                       onClick={() => handleAction('clear')}
                    >
                       Clear
                    </Button>
                    <Button 
                       variant="outline"
                       className="border-zinc-200 text-zinc-600 text-[10px] font-black uppercase h-9 px-6 rounded-md hover:bg-zinc-50"
                       onClick={() => handleAction('mark-review-next')}
                    >
                       Mark for Review & Next
                    </Button>
                 </div>
                 <div className="flex gap-2">
                    <Button 
                       variant="ghost" 
                       className="text-zinc-600 text-[10px] font-black h-9 px-4 uppercase"
                       onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                       disabled={currentIdx === 0}
                    >
                       <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button 
                       variant="ghost" 
                       className="text-zinc-600 text-[10px] font-black h-9 px-4 uppercase"
                       onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                       disabled={currentIdx === questions.length - 1}
                    >
                       Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                 </div>
              </footer>
           </div>

           {/* NTA STYLE RIGHT PANEL */}
           <aside className="w-80 bg-[#f9f9f9] border-l flex flex-col shrink-0 hidden lg:flex">
              {/* Profile Card */}
              <div className="p-4 bg-white border-b flex gap-4 items-center">
                 <div className="h-16 w-16 bg-zinc-100 rounded-md flex items-center justify-center border-2 border-zinc-200 overflow-hidden relative">
                    <Image 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'student'}`} 
                      alt="Avatar" 
                      width={64}
                      height={64}
                      className="object-cover" 
                    />
                 </div>
                 <div>
                    <h5 className="text-xs font-black uppercase text-[#004b91] leading-tight">{user?.name || "Candidate"}</h5>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1">Roll No: 2024MS091</p>
                    <div className="flex items-center gap-1 mt-2">
                       <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Secured Proctoring</span>
                    </div>
                 </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 gap-px bg-zinc-200">
                 {[
                    { label: 'Answered', value: stats.answered, color: 'bg-emerald-500' },
                    { label: 'Not Answered', value: stats.not_answered, color: 'bg-rose-500' },
                    { label: 'Not Visited', value: stats.not_visited, color: 'bg-zinc-300' },
                    { label: 'Marked', value: stats.marked, color: 'bg-purple-600' },
                 ].map((s, i) => (
                    <div key={i} className="bg-white p-3 flex flex-col items-center justify-center border-b border-r">
                       <div className={cn("h-6 w-8 rounded flex items-center justify-center text-white font-black text-[10px]", s.color)}>
                          {s.value}
                       </div>
                       <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">{s.label}</span>
                    </div>
                 ))}
                 <div className="bg-white p-3 flex flex-col items-center justify-center col-span-2">
                    <div className="flex items-center gap-2">
                       <div className="h-6 w-8 rounded-full bg-purple-600 flex items-center justify-center relative shadow-md">
                          <div className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full border border-white" />
                          <span className="text-[10px] font-black text-white">{stats.marked_answered}</span>
                       </div>
                       <span className="text-[9px] font-bold text-zinc-500 uppercase">Answered & Marked for Review (will be considered for evaluation)</span>
                    </div>
                 </div>
              </div>

              {/* Question Palette */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                 <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, i) => {
                       const status = statusMap[q.id] || 'not-visited';
                       return (
                          <button 
                             key={q.id}
                             className={cn(
                                "h-9 w-9 text-white font-black text-[12px] flex items-center justify-center transition-all transform hover:scale-105",
                                currentIdx === i ? "ring-2 ring-[#004b91] ring-offset-1 z-1" : "",
                                status === 'not-visited' && "bg-white border-2 border-zinc-200 text-zinc-400 rounded",
                                status === 'not-answered' && "bg-[#ef4444] rounded-t-3xl rounded-b-lg",
                                status === 'answered' && "bg-[#22c55e] rounded-b-3xl rounded-t-lg",
                                status === 'marked' && "bg-[#9333ea] rounded-full",
                                status === 'answered-marked' && "bg-[#9333ea] rounded-full relative"
                             )}
                             onClick={() => handleSelect(i)}
                          >
                             {status === 'answered-marked' && <div className="absolute top-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white" />}
                             {i + 1}
                          </button>
                       );
                    })}
                 </div>
              </div>

              <div className="p-4 bg-white border-t space-y-3">
                 <Button className="w-full bg-[#004b91] text-white font-black uppercase text-xs h-10 tracking-widest hover:bg-blue-800" onClick={handleSubmit}>
                    Submit Test
                 </Button>
              </div>
           </aside>
        </div>

        {/* NTA STYLE FOOTER LEGEND */}
        <footer className="h-6 bg-[#eeeeee] border-t px-4 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
              <span>© NTA | TestMaster Proctoring Enabled</span>
           </div>
           {isSyncing && <div className="flex items-center gap-1 text-[8px] font-black text-orange-600 animate-pulse"><Save className="h-2 w-2" /> Syncing responses with central server...</div>}
        </footer>
      </div>
    </div>
  );
}
