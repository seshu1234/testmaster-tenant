"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, LayoutGrid } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { PracticeQuestionCard } from "@/components/student/practice/question-card";
import { toast } from "sonner";

interface Question {
  id: string;
  type: string;
  content: string | { text: string };
  options: string[];
  explanation?: string | { text: string };
  correct_answer?: string | string[];
}

export default function PracticeTakePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token, tenantSlug } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    async function startPractice() {
      if (!token) return;
      try {
        // 1. Start or resume attempt
        const startRes = await api(`/student/tests/${params.id}/start`, {
          method: "POST",
          token,
          tenant: tenantSlug || undefined
        });

        if (startRes.success) {
          setAttemptId(startRes.data.attempt_id);
          
          // 2. Fetch all questions for this practice set
          const qRes = await api(`/student/tests/${params.id}/questions?attempt=${startRes.data.attempt_id}`, {
            token,
            tenant: tenantSlug || undefined
          });

          if (qRes.success) {
            setQuestions([qRes.data.question]);
          }
        }
      } catch (err) {
        console.error("Practice start error:", err);
        toast.error("Failed to start practice session");
      } finally {
        setLoading(false);
      }
    }

    startPractice();
  }, [token, params.id, tenantSlug]);

  const handleAnswer = async (questionId: string, selectedOptions: string[], isCorrect: boolean) => {
    if (!attemptId || !token) return;

    try {
      await api(`/student/tests/${attemptId}/answer`, {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          question_id: questionId,
          selected_options: selectedOptions,
          status: isCorrect ? 'answered' : 'not_answered',
          question_type: 'practice',
          time_spent: 0
        })
      });
    } catch (err) {
      console.error("Failed to save answer:", err);
    }
  };

  const loadNextQuestion = async () => {
    if (!attemptId || !token) return;
    
    setLoading(true);
    try {
      const qRes = await api(`/student/tests/${params.id}/questions?attempt=${attemptId}`, {
        token,
        tenant: tenantSlug || undefined
      });

      if (qRes.success) {
        setQuestions(prev => [...prev, qRes.data.question]);
        setCurrentIndex(prev => prev + 1);
      } else {
        router.push('/student/practice');
        toast.success("Practice session completed!");
      }
    } catch {
      router.push('/student/practice');
    } finally {
      setLoading(false);
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Securing Practice Materials...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Practice Header */}
      <header className="h-20 bg-white border-b border-zinc-100 flex items-center px-8 sticky top-0 z-50">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-6">
            <Button 
               variant="ghost" 
               size="sm" 
               className="rounded-full hover:bg-zinc-100 font-black text-[10px] tracking-widest uppercase gap-2 pr-6"
               onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
              Exit Session
            </Button>
            <div className="h-8 w-px bg-zinc-100 hidden md:block" />
            <div className="hidden md:flex flex-col">
               <span className="text-[9px] font-black text-primary uppercase tracking-widest">Active Drill</span>
               <span className="text-sm font-black text-zinc-800 uppercase tracking-tight">Question Pool {currentIndex + 1}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 rounded-full">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Timer-less Mode</span>
            </div>
            <Button size="icon" variant="outline" className="rounded-2xl border-zinc-200">
               <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        {currentQuestion && (
           <PracticeQuestionCard 
              question={currentQuestion} 
              onAnswer={handleAnswer}
              onNext={loadNextQuestion}
              isLast={false} // Controller will tell us when done
           />
        )}
      </main>
    </div>
  );
}
