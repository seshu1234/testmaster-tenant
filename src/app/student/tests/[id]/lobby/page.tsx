"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronRight, 
  ShieldCheck, 
  Monitor, 
  Wifi, 
  Maximize, 
  AlertTriangle,
  FileText,
  Clock,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle } from "lucide-react";

interface TestDetails {
  id: string;
  title: string;
  duration_seconds: number;
  questions_count?: number;
  settings?: {
    passing_percentage: number;
    negative_marking?: number;
  };
}

export default function StudentTestLobby({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token, tenantSlug } = useAuth();
  const [test, setTest] = useState<TestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState({
    browser: false,
    internet: false,
    fullscreen: false,
    auth: true
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function fetchTest() {
      if (!token) return;
      try {
        const response = await api(`/student/tests/${params.id}`, {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setTest(response.data);
        }
      } catch (error) {
        console.error("Lobby fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [token, params.id, tenantSlug]);

  useEffect(() => {
    // Simulate system checks
    const timer = setTimeout(() => {
      setChecks(prev => ({ ...prev, browser: true, internet: true }));
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        setChecks(prev => ({ ...prev, fullscreen: true }));
        setReady(true);
      });
    }
  };

  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartAssessment = async () => {
    if (!token) return;
    setIsStarting(true);
    setError(null);
    try {
      const response = await api(`/student/tests/${params.id}/start`, {
        method: "POST",
        token,
        tenant: tenantSlug || undefined
      });
      if (response.success) {
        router.push(`/student/tests/${params.id}/take?attempt=${response.data.attempt_id}`);
      }
    } catch (err) {
      setError("Authorization failed or system busy. Retrying...");
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) return <div className="p-12 text-zinc-600 animate-pulse font-black uppercase tracking-widest text-zinc-600">Synchronizing with Proctor Vault...</div>;
  if (!test) return <div className="p-12 text-zinc-600 font-black uppercase tracking-widest text-zinc-600">Failed to secure assessment link.</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-8 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
           <div>
              <Badge className="bg-primary/10 text-zinc-600 border-none text-[10px] font-black uppercase tracking-widest mb-4 px-4 py-1.5">Pre-Flight Check</Badge>
              <h1 className="text-zinc-600 font-black tracking-tighter uppercase">Assessment Lobby</h1>
           </div>
           <Button variant="ghost" className="text-zinc-600 font-black uppercase tracking-widest text-zinc-600" onClick={() => router.back()}>
              Exit to Dashboard
           </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Detailed Rules & Instructions */}
           <div className="lg:col-span-2 space-y-8">
              <Card className="border shadow-md rounded-2xl overflow-hidden bg-white">
                 <CardHeader className="p-8 border-b bg-zinc-50/50">
                    <CardTitle className="text-zinc-600 font-black uppercase flex items-center gap-3">
                       <FileText className="h-6 w-6 text-zinc-600" />
                       Exam Protocol
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {[
                          { label: 'DURATION', val: `${Math.floor(test.duration_seconds / 60)} MINS`, icon: Clock },
                          { label: 'QUESTIONS', val: `${test.questions_count || 0} ITEMS`, icon: Monitor },
                          { label: 'TOTAL MARKS', val: `${(test.questions_count || 0) * 4} PTS`, icon: ShieldCheck },
                          { label: 'NEGATIVE', val: `${test.settings?.negative_marking ? '-' + test.settings.negative_marking : '0'} MARK`, icon: AlertTriangle }
                       ].map((item, i) => (
                          <div key={i} className="p-4 rounded-3xl bg-zinc-50 flex flex-col items-center text-zinc-600 gap-1 border border-zinc-100">
                             <item.icon className="h-4 w-4 text-zinc-600 mb-1" />
                             <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{item.label}</span>
                             <span className="text-zinc-600 font-black">{item.val}</span>
                          </div>
                       ))}
                    </div>

                    <div className="space-y-4">
                       <h4 className="font-black text-zinc-600 uppercase tracking-widest text-zinc-600 px-2">Important Instructions</h4>
                       <div className="space-y-3">
                          {[
                             "Switching tabs or exiting fullscreen will be flagged as a violation.",
                             "Ensure your webcam and microphone are active if proctoring is enabled.",
                             "Answers are auto-saved every 30 seconds to the cloud.",
                             "The test will automatically submit when the timer hits zero."
                          ].map((text, i) => (
                             <div key={i} className="flex gap-4 p-4 rounded-2xl bg-zinc-50/50 border">
                                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                <p className="text-xl font-bold leading-relaxed">{text}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* System Check Sidebar */}
           <div className="space-y-8">
              <Card className="border shadow-md rounded-2xl bg-white p-8">
                 <h3 className="text-zinc-600 font-black uppercase tracking-widest text-zinc-600 mb-8 px-2">System Readiness</h3>
                 <div className="space-y-4">
                    {[
                       { id: 'browser', label: 'Browser Compatibility', icon: Monitor, status: checks.browser },
                       { id: 'internet', label: 'Internet Connectivity', icon: Wifi, status: checks.internet },
                       { id: 'fullscreen', label: 'Fullscreen Permission', icon: Maximize, status: checks.fullscreen },
                       { id: 'auth', label: 'Identity Verified', icon: ShieldCheck, status: checks.auth }
                    ].map((check) => (
                       <div key={check.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border">
                          <div className="flex items-center gap-3">
                              <check.icon className={cn("h-4 w-4", check.status ? "text-emerald-500" : "text-zinc-400")} />
                             <span className="text-[11px] font-bold">{check.label}</span>
                          </div>
                          {check.status ? (
                             <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <ShieldCheck className="h-3 w-3 text-zinc-600" />
                             </div>
                          ) : (
                             <div className="h-5 w-5 rounded-full bg-zinc-200 flex items-center justify-center animate-pulse" />
                          )}
                       </div>
                    ))}
                 </div>

                 {(!checks.fullscreen && checks.browser && checks.internet) && (
                    <Button 
                       className="w-full mt-8 bg-zinc-900 text-white font-black rounded-2xl h-14 hover:scale-[1.02] transform transition-all shadow-xl"
                       onClick={handleFullscreen}
                    >
                       ENABLE FULLSCREEN
                    </Button>
                 )}

                 {ready && (
                    <div className="mt-8 space-y-4 animate-in zoom-in-95 duration-300">
                       <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-3">
                          <Info className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] font-bold text-zinc-600 leading-relaxed uppercase tracking-tighter">
                             All systems green. You are ready to start the assessment.
                          </p>
                       </div>
                        {error && (
                           <div className="p-4 rounded-xl bg-rose-500 text-zinc-600 flex items-center gap-3 animate-shake">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <p className="text-[10px] font-bold uppercase">{error}</p>
                           </div>
                        )}
                        <Button 
                           className="w-full bg-primary text-white font-black rounded-2xl h-14 hover:scale-[1.05] transform transition-all shadow-[0_0_30px_rgba(var(--primary),0.3)]"
                           onClick={handleStartAssessment}
                           disabled={isStarting}
                        >
                           {isStarting ? "SECURING LINK..." : "START ASSESSMENT"}
                        </Button>
                    </div>
                 )}
              </Card>

              <Card className="border shadow-md rounded-2xl bg-zinc-950 text-zinc-600 p-6 overflow-hidden relative group">
                 <div className="relative z-10">
                    <h4 className="text-zinc-600 font-black uppercase tracking-widest text-zinc-600 mb-4">Support</h4>
                    <p className="text-xl font-bold leading-relaxed text-zinc-600">
                       Facing issues? Contact support immediately.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-4 flex items-center gap-2 group-hover:gap-4 transition-all">
                       Connect with Proctor
                       <ChevronRight className="h-3 w-3" />
                    </Button>
                 </div>
                 <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary/10 rounded-full blur-2xl" />
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
}
