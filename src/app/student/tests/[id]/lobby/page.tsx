"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Monitor, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TestDetails {
  id: string;
  title: string;
  duration: number;
  total_questions: number;
  instructions: string;
  start_time?: string;
}

export default function StudentLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token, tenantSlug } = useAuth();
  const testId = params.id as string;

  const [test, setTest] = useState<TestDetails | null>(null);
  // Use a lazy initializer so browser APIs are read on first render (client-side),
  // avoiding a setState call inside useEffect.
  const [checks, setChecks] = useState(() => ({
    fullscreen: typeof document !== 'undefined' && document.documentElement.requestFullscreen !== undefined,
    internet: typeof navigator !== 'undefined' ? navigator.onLine : true,
    auth: false,
  }));
  const [isStarting, setIsStarting] = useState(false);

  // Derived — no extra state needed
  const isReady = checks.internet && checks.auth;

  // Re-run all browser checks on demand ("Re-run Diagnostics" button)
  const runChecks = () => {
    setChecks(prev => ({
      ...prev,
      fullscreen: document.documentElement.requestFullscreen !== undefined,
      internet: navigator.onLine,
    }));
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/student/tests/${testId}`, { token: token || undefined, tenant: tenantSlug || undefined });
        if (response.success) {
          setTest(response.data);
          setChecks(prev => ({ ...prev, auth: true }));
        }
      } catch (err) {
        console.error("Failed to load test details:", err);
      }
    };
    fetchDetails();
  }, [testId, user, token, tenantSlug]);

  const startTest = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const response = await api(`/student/tests/${testId}/start`, {
        method: "POST",
        token: token || undefined,
        tenant: tenantSlug || undefined
      });
      if (response.success && response.data?.attempt_id) {
        router.push(`/student/tests/${testId}/take?attempt=${response.data.attempt_id}`);
      } else {
        setIsStarting(false);
      }
    } catch (err) {
      console.error("Failed to start test:", err);
      setIsStarting(false);
    }
  };

  if (!test) return <div className="p-8 text-center animate-pulse">Initializing exam environment...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. TEST HEADER */}
      <div className="text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none py-1.5 px-6 rounded-full font-bold uppercase tracking-widest text-xs">
            Secure Assessment Portal
        </Badge>
        <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">{test.title}</h1>
        <div className="flex items-center justify-center gap-6 text-zinc-500 font-medium">
            <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                {test.duration} Minutes
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
            <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-indigo-500" />
                {test.total_questions} Questions
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. INSTRUCTIONS PANEL */}
        <Card className="lg:col-span-2 rounded-3xl border shadow-xl overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-800/50 border-b p-8">
                <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    Candidate Instructions
                </CardTitle>
                <CardDescription className="text-zinc-500 font-medium">Please read these rules carefully before starting. Failure to comply may lead to disqualification.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 space-y-6">
                    <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex gap-3">
                        <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            <strong>Strict Proctoring Enabled:</strong> This test uses the AI proctoring engine. Tab switching, window resizing, or exiting fullscreen will be flagged and reported to your teacher in real-time.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="font-bold text-zinc-800 dark:text-zinc-200">Exam Protocol:</p>
                        <ul className="list-disc pl-6 space-y-3">
                            <li>Ensure you have a stable internet connection throughout the duration.</li>
                            <li>The timer will start the moment you click &quot;Start Assessment&quot;.</li>
                            <li>Questions can be navigated freely using the side grid.</li>
                            <li>Use the &quot;Mark for Review&quot; feature for questions you wish to revisit.</li>
                            <li>Calculators and external aids are strictly prohibited unless specified.</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* 3. SYSTEM CHECK SIDEBAR */}
        <div className="space-y-6">
            <Card className="rounded-3xl border shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
                <CardHeader className="p-6 pb-0">
                    <CardTitle className="text-lg font-black uppercase tracking-widest text-zinc-400">System Integrity</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <CheckItem 
                        icon={<Monitor className="h-5 w-5" />} 
                        label="Screen Resolution" 
                        status={checks.fullscreen ? 'success' : 'pending'} 
                    />
                    <CheckItem 
                        icon={<Settings className="h-5 w-5" />} 
                        label="Internet Stability" 
                        status={checks.internet ? 'success' : 'error'} 
                    />
                    <CheckItem 
                        icon={<ShieldCheck className="h-5 w-5" />} 
                        label="Auth Verification" 
                        status={checks.auth ? 'success' : 'pending'} 
                    />
                    
                    <Button 
                        variant="outline" 
                        className="w-full h-12 rounded-xl font-bold border-2"
                        onClick={runChecks}
                    >
                        Re-run Diagnostics
                    </Button>
                </CardContent>
            </Card>

            <div className="p-1">
                <Button 
                    disabled={!isReady}
                    onClick={startTest}
                    className={cn(
                        "w-full h-20 rounded-3xl text-xl font-black uppercase tracking-widest transition-all duration-500 shadow-2xl shadow-primary/20",
                        isReady ? "bg-primary text-white scale-105" : "bg-zinc-200 border-zinc-300 text-zinc-400 cursor-not-allowed"
                    )}
                >
                    {isReady ? (
                        <>
                            {isStarting ? "Establishing Link..." : "Enter Test Node"}
                            <ArrowRight className="ml-3 h-6 w-6" />
                        </>
                    ) : (
                        "System Not Ready"
                    )}
                </Button>
                <p className="mt-4 text-center text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                    Click above to establish secure link
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ icon, label, status }: { icon: React.ReactNode, label: string, status: 'success' | 'error' | 'pending' }) {
    return (
        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                    status === 'success' ? "bg-emerald-500/10 text-emerald-600" : 
                    status === 'error' ? "bg-rose-500/10 text-rose-600" : "bg-zinc-100 text-zinc-400"
                )}>
                    {icon}
                </div>
                <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
            </div>
            {status === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : status === 'error' ? (
                <AlertCircle className="h-5 w-5 text-rose-500" />
            ) : (
                <div className="h-2 w-2 rounded-full bg-zinc-300 animate-pulse" />
            )}
        </div>
    );
}
