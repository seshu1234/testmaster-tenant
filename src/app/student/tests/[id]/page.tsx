"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, Clock, Info, BookOpen, AlertCircle as Warning, ShieldCheck } from "lucide-react";

interface TestDetails {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  subject?: string;
  questions_count?: number;
  settings?: {
    passing_percentage: number;
    allow_navigation: boolean;
    shuffle_questions: boolean;
  };
}

export default function TestInstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const testId = params.id as string;
  
  const [test, setTest] = useState<TestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestDetails() {
      if (!user || !token) return;
      try {
        const response = await api(`/v1/student/tests/${testId}`, {
          token,
          tenant: user.tenant_id
        });
        setTest(response.data);
      } catch (err: unknown) {
        console.error("Failed to fetch test details:", err);
      } finally {
         setIsLoading(false);
      }
    }

    if (testId) {
      fetchTestDetails();
    }
  }, [testId, user, token]);

  const handleStartTest = async () => {
    if (!user || !token) return;
    setIsStarting(true);
    setError(null);
    try {
      const response = await api(`/v1/student/tests/${testId}/start`, {
        method: "POST",
        token,
        tenant: user.tenant_id
      });
      
      router.push(`/student/tests/${testId}/take?attempt=${response.data.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start the test.";
      setError(message);
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center italic animate-pulse">Preparing your assessment...</div>;

  if (!test) {
    return (
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
               <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Assessment Not Found</CardTitle>
            <CardDescription>The test you&apos;re looking for doesn&apos;t exist or is not available.</CardDescription>
        </CardHeader>
        <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push('/student/tests')}>Go Back</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
           <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-none mb-2">{test.subject || "Academic Assessment"}</Badge>
              <h1 className="text-4xl font-extrabold tracking-tight">{test.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{test.description}</p>
           </div>

           <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Special Instructions
              </h3>
              <div className="grid gap-3">
                 {[
                   "Once started, the timer cannot be paused.",
                   test.settings?.allow_navigation ? "You can jump between questions at any time." : "Sequential mode: You cannot go back to previous questions.",
                   "Do not refresh the page during the assessment.",
                   "Ensure a stable internet connection for submission.",
                   "Result will be available after the teacher publishes it."
                 ].map((instr, i) => (
                   <div key={i} className="flex gap-3 text-sm p-4 rounded-xl border bg-white dark:bg-zinc-900/50 shadow-sm border-dashed">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{instr}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="w-full md:w-80 space-y-6">
           <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden">
              <CardHeader>
                 <CardTitle className="text-lg">Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between border-b border-white/20 pb-4">
                    <div className="flex items-center gap-2 opacity-80">
                       <Clock className="h-4 w-4" />
                       <span className="text-sm">Time Limit</span>
                    </div>
                    <span className="font-bold">{Math.round(test.duration_seconds / 60)} Mins</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-white/20 pb-4">
                    <div className="flex items-center gap-2 opacity-80">
                       <BookOpen className="h-4 w-4" />
                       <span className="text-sm">Total Questions</span>
                    </div>
                    <span className="font-bold">{test.questions_count || "Evaluated"}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 opacity-80">
                       <Info className="h-4 w-4" />
                       <span className="text-sm">Pass Mark</span>
                    </div>
                    <span className="font-bold">{test.settings?.passing_percentage || 33}%</span>
                 </div>
              </CardContent>
              <CardFooter className="bg-black/10 flex flex-col pt-6 gap-4">
                 {error && (
                   <div className="p-3 rounded-lg bg-destructive text-destructive-foreground text-[10px] w-full animate-shake">
                     {error}
                   </div>
                 )}
                 <Button 
                    className="w-full bg-white text-primary hover:bg-zinc-100 font-bold h-12 rounded-xl"
                    onClick={handleStartTest}
                    disabled={isStarting}
                 >
                    {isStarting ? "Processing..." : "Take Test Now"}
                 </Button>
                 <p className="text-[10px] text-center text-primary-foreground/60 italic">By clicking Start, you agree to the conditions.</p>
              </CardFooter>
           </Card>

           <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex gap-3 text-amber-600">
              <Warning className="h-4 w-4 shrink-0 mt-1" />
              <p className="text-xs leading-relaxed font-medium">Please ensure your camera or screen share is enabled if requested by the instructor.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
