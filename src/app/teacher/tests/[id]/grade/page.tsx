"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface UngradedResponse {
  attempt_id: string;
  student_id: string;
  question_id: string;
  question_text: string;
  student_answer: string;
  model_answer?: string;
  max_marks: number;
}

export default function ManualGradingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, tenantSlug } = useAuth();
  const testId = params.id as string;

  const [responses, setResponses] = useState<UngradedResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentMarks, setCurrentMarks] = useState<string>("");
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUngraded = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/v1/teacher/tests/${testId}/ungraded`, {
          token,
          tenant: tenantSlug || undefined,
        });
        if (response.success) {
          setResponses(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch ungraded responses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUngraded();
  }, [testId, user, token, tenantSlug]);

  const handleGradeSubmit = async () => {
    if (!user || !token || !responses[currentIndex]) return;
    setSubmitting(true);
    try {
      const response = await api(`/v1/teacher/grade`, {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          attempt_id: responses[currentIndex].attempt_id,
          question_id: responses[currentIndex].question_id,
          marks: parseFloat(currentMarks),
          feedback: currentFeedback
        }),
      });

      if (response.success) {
        if (currentIndex < responses.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setCurrentMarks("");
          setCurrentFeedback("");
        } else {
          router.push("/teacher/analytics");
        }
      }
    } catch (error) {
      console.error("Grading failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading items needing review...</div>;

  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        <h2 className="text-2xl font-bold">Inbox Zero!</h2>
        <p className="text-muted-foreground">All subjective answers for this test have been graded.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const current = responses[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Grading Console</h1>
            <p className="text-muted-foreground text-sm font-medium">Item {currentIndex + 1} of {responses.length} Pending</p>
          </div>
        </div>
        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary bg-primary/5">
           Assessing Subjective Responses
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-800/30 border-b p-6">
               <CardTitle className="text-lg font-bold">The Question</CardTitle>
               <CardDescription className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                  {current.question_text}
               </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                     <div className="h-2 w-2 rounded-full bg-primary" />
                     Student Response
                  </div>
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 font-medium text-zinc-800 dark:text-zinc-100 leading-loose">
                     {current.student_answer}
                  </div>
               </div>

               {current.model_answer && (
                 <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                       <CheckCircle2 className="h-3 w-3" />
                       Model Reference Answer
                    </div>
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-400">
                       {current.model_answer}
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="rounded-3xl border shadow-xl bg-zinc-900 text-white p-6 sticky top-24">
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Award Marks (Max: {current.max_marks})</label>
                    <div className="flex items-end gap-3">
                       <input 
                         type="number" 
                         step="0.5"
                         max={current.max_marks}
                         className="bg-transparent border-b-2 border-zinc-700 text-4xl font-black focus:border-primary outline-none py-2 w-24 text-center"
                         placeholder="0.0"
                         value={currentMarks}
                         onChange={(e) => setCurrentMarks(e.target.value)}
                       />
                       <span className="text-xl font-bold text-zinc-600 mb-3">/ {current.max_marks}</span>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Feedback (Optional)</label>
                    <Textarea 
                      placeholder="Add a constructive note..." 
                      className="bg-zinc-800 border-none rounded-2xl min-h-[100px] text-sm focus:ring-2 ring-primary/20"
                      value={currentFeedback}
                      onChange={(e) => setCurrentFeedback(e.target.value)}
                    />
                 </div>

                 <div className="pt-4 flex flex-col gap-3">
                    <Button 
                      className="w-full h-12 rounded-2xl font-bold gap-2 text-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                      onClick={handleGradeSubmit}
                      disabled={submitting || !currentMarks}
                    >
                       {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                       {currentIndex < responses.length - 1 ? 'Save & Next' : 'Finish Grading'}
                    </Button>
                    <Button variant="ghost" className="text-zinc-500 hover:text-white hover:bg-zinc-800 font-bold" onClick={() => setCurrentIndex(currentIndex + 1)}>
                       Skip for Now
                       <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                 </div>

                 <div className="pt-6 border-t border-zinc-800 space-y-4 font-inter">
                    <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-xl border border-zinc-800 cursor-pointer hover:border-primary/50 transition-colors group">
                       <Sparkles className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest">AI Assistance Ready</span>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
