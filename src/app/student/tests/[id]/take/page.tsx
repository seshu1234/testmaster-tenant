"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Clock, Send, ChevronRight } from "lucide-react";

interface Question {
  id: string;
  type: string;
  content: { text?: string; [key: string]: unknown };
  options?: { id: string | number; text?: string; [key: string]: unknown }[];
}

export default function TestTakingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = params.id as string;
  const attemptId = searchParams.get("attempt") || "mock-attempt-1";
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [remainingTime, setRemainingTime] = useState(3600);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTest = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await api(`/student/attempts/${attemptId}/submit`, {
        method: "POST",
      });
      router.push(`/student/tests/${testId}/result?attempt=${attemptId}`);
    } catch (err) {
      console.error("Failed to submit test:", err);
      router.push(`/student/tests/${testId}/result?attempt=${attemptId}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptId, testId, router]);

  useEffect(() => {
    async function fetchNextQuestion() {
      setIsLoading(true);
      try {
        const response = await api(`/student/tests/${testId}/questions?attempt=${attemptId}`);
        if (response.data?.question) {
           setQuestion(response.data.question);
        } else if (response.finished) {
           // Test is finished, auto-submit
           handleSubmitTest();
        } else {
           // Fallback for mock demo
           setQuestion({
             id: "q1",
             type: "multiple_choice",
             content: { text: "What is the derivative of x^2?" },
             options: [
               { id: "A", text: "2x" },
               { id: "B", text: "x" },
               { id: "C", text: "x^2" },
               { id: "D", text: "2" },
             ]
           });
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setQuestion({
             id: "q1",
             type: "multiple_choice",
             content: { text: "What is the derivative of x^2?" },
             options: [
               { id: "A", text: "2x" },
               { id: "B", text: "x" },
               { id: "C", text: "x^2" },
               { id: "D", text: "2" },
             ]
           });
      } finally {
        setIsLoading(false);
      }
    }

    fetchNextQuestion();
  }, [testId, attemptId, handleSubmitTest]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmitTest]);

  const handleSaveAnswer = async () => {
    if (!selectedOption || !question) return;
    
    try {
      await api(`/student/attempts/${attemptId}/answers`, {
        method: "POST",
        body: JSON.stringify({
           question_id: question.id,
           answer: selectedOption,
        })
      });
      // For mock purposes, just simulate advancing
      setQuestion({
             id: "q2",
             type: "multiple_choice",
             content: { text: "What is the integral of 2x?" },
             options: [
               { id: "A", text: "x^2 + C" },
               { id: "B", text: "2x^2 + C" },
               { id: "C", text: "x + C" },
               { id: "D", text: "2 + C" },
             ]
      });
      setSelectedOption("");
    } catch (err) {
      console.error("Failed to save answer:", err);
      // Mock advancing
      setQuestion({
             id: "q2",
             type: "multiple_choice",
             content: { text: "What is the integral of 2x?" },
             options: [
               { id: "A", text: "x^2 + C" },
               { id: "B", text: "2x^2 + C" },
               { id: "C", text: "x + C" },
               { id: "D", text: "2 + C" },
             ]
      });
      setSelectedOption("");
    }
  };
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent dark:border-zinc-50" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border">
        <div>
           <h2 className="font-semibold text-lg">Test in Progress</h2>
        </div>
        <div className="flex items-center gap-2 text-rose-500 font-mono text-xl font-bold bg-rose-50 dark:bg-rose-950 px-4 py-2 rounded-md">
           <Clock className="h-5 w-5" />
           {formatTime(remainingTime)}
        </div>
      </div>

      {question ? (
        <Card className="min-h-[400px] flex flex-col">
          <CardHeader>
             <CardTitle className="text-xl leading-relaxed">
               {question.content?.text || "Question content missing"}
             </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
             {question.type === "multiple_choice" && question.options && (
               <div className="space-y-4 mt-4">
                 {question.options.map((opt) => (
                   <div key={String(opt.id)} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                     <input 
                       type="radio" 
                       name="question_option" 
                       value={String(opt.id)}
                       id={String(opt.id)}
                       checked={selectedOption === String(opt.id)}
                       onChange={(e) => setSelectedOption(e.target.value)}
                       className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                     />
                     <Label htmlFor={String(opt.id)} className="flex-1 cursor-pointer font-medium text-base leading-relaxed">
                       {opt.text}
                     </Label>
                   </div>
                 ))}
               </div>
             )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 bg-zinc-50 dark:bg-zinc-900/50">
             <Button variant="outline" onClick={handleSaveAnswer}>
               Flag for Review
             </Button>
             
             <div className="flex gap-4">
               <Button onClick={handleSaveAnswer} disabled={!selectedOption}>
                 Save & Next <ChevronRight className="ml-2 h-4 w-4" />
               </Button>
               <Button onClick={handleSubmitTest} disabled={isSubmitting} variant="destructive">
                 {isSubmitting ? "Submitting..." : "Submit Test"} <Send className="ml-2 h-4 w-4" />
               </Button>
             </div>
          </CardFooter>
        </Card>
      ) : (
        <Card className="flex h-64 flex-col items-center justify-center p-6 text-center">
           <AlertCircle className="h-12 w-12 text-zinc-400 mb-4" />
           <h3 className="text-xl font-semibold mb-2">No more questions</h3>
           <p className="text-muted-foreground mb-6">You have completed all questions in this test.</p>
           <Button onClick={handleSubmitTest} disabled={isSubmitting} size="lg">
              {isSubmitting ? "Submitting..." : "Submit Test"}
           </Button>
        </Card>
      )}
    </div>
  );
}
