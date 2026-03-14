"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Bell,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface UpcomingTest {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  duration: string;
  qCount: number;
  type: string;
  isReady: boolean;
}

interface Ward {
  id: string;
  name: string;
}

export default function UpcomingTestsPage() {
  const { token, tenantSlug } = useAuth();
  const [wards, setWards] = useState<Ward[]>([]);
  const [activeWardId, setActiveWardId] = useState<string | null>(null);
  const [tests, setTests] = useState<UpcomingTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWards() {
      if (!token) return;
      try {
        const response = await api("/parent/children", {
          token,
          tenant: tenantSlug || undefined
        });
        const fetchedWards = response.data || [];
        setWards(fetchedWards);
        if (fetchedWards.length > 0 && !activeWardId) {
          setActiveWardId(fetchedWards[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch wards:", err);
      }
    }
    fetchWards();
  }, [token, tenantSlug, activeWardId]);

  useEffect(() => {
    async function fetchUpcoming() {
      if (!token || !activeWardId) return;
      setIsLoading(true);
      try {
        const response = await api(`/parent/tests/${activeWardId}/upcoming`, {
          token,
          tenant: tenantSlug || undefined
        });
        setTests(response.data || []);
      } catch (err) {
        console.error("Failed to fetch upcoming tests:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUpcoming();
  }, [token, tenantSlug, activeWardId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter  uppercase">Tactical Schedule</h1>
          <p className="text-muted-foreground text-sm font-medium">Monitoring upcoming assessments and study milestones.</p>
        </div>
        
        <div className="flex gap-4 items-center">
           {wards.length > 1 && (
            <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border dark:border-zinc-800 shadow-sm overflow-x-auto scrollbar-hide mr-2">
              {wards.map((ward) => (
                <button
                  key={ward.id}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                    activeWardId === ward.id 
                      ? "bg-primary text-white" 
                      : "text-zinc-500 hover:text-zinc-800"
                  )}
                  onClick={() => setActiveWardId(ward.id)}
                >
                  {ward.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
           <Button variant="outline" className="rounded-2xl border-zinc-200 dark:border-zinc-800 font-black text-[10px] uppercase tracking-widest px-6 h-12">
              <CalendarIcon className="mr-2 h-4 w-4" />
              GOOGLE CALENDAR SYNC
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Test List */}
        <div className="lg:col-span-8 space-y-6">
           <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] animate-pulse" />
                ))
              ) : tests.length > 0 ? (
                tests.map((test) => (
                  <Card key={test.id} className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-900 overflow-hidden group hover:scale-[1.01] transition-all">
                     <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                           <div className="flex items-center gap-8">
                              <div className="h-24 w-24 rounded-[2rem] bg-zinc-950 flex flex-col items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group-hover:bg-primary transition-colors">
                                 <span className="text-[10px] font-black uppercase text-zinc-500 group-hover:text-white/60">{new Date(test.startTime).toLocaleDateString('en-US', { month: 'short' })}</span>
                                 <span className="text-3xl font-black  text-white leading-none whitespace-nowrap">{new Date(test.startTime).getDate()}</span>
                                 <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              
                              <div className="space-y-2">
                                 <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-[9px] font-black uppercase px-3 h-6 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">{test.subject}</Badge>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black uppercase px-3 h-6">
                                       {test.type}
                                    </Badge>
                                 </div>
                                 <h4 className="text-2xl font-black  uppercase  tracking-tighter leading-tight">{test.title}</h4>
                                 <div className="flex items-center gap-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">
                                    <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(test.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({test.duration})</div>
                                    <div className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {test.qCount} Questions</div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-4 w-full md:w-auto">
                              <Button className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                                 SET SMS REMINDER
                              </Button>
                              <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                                 <ChevronRight className="h-6 w-6" />
                              </Button>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                   <CalendarIcon className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                   <p className="text-zinc-500 font-black uppercase  tracking-widest text-xs">No imminent assessments detected.</p>
                </div>
              )}
           </div>
        </div>

        {/* Schedule Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl rounded-[3rem] bg-primary text-white p-10 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
                    <Bell className="h-7 w-7 text-white" />
                 </div>
                 <h3 className="text-2xl font-black  uppercase  tracking-tighter mb-4 leading-none">Smart Notifications</h3>
                 <p className="text-primary-foreground/80 text-xs font-medium leading-relaxed mb-10">
                    Get real-time updates on test readiness and system eligibility checks for your child.
                 </p>
                 <Button className="w-full bg-white text-black font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                    CONFIGURE ALERTS
                 </Button>
              </div>
              <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                 <CalendarIcon className="h-40 w-40" />
              </div>
           </Card>

           <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-950 text-white p-10">
              <div className="flex items-center gap-4 mb-10">
                 <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                 </div>
                 <div>
                    <h4 className="text-xl font-black  uppercase  tracking-tighter">System Health</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">READINESS VERIFIED</p>
                 </div>
              </div>

              <div className="space-y-6">
                 {[
                   { label: 'Device Compatible', value: 'YES', color: 'text-emerald-500' },
                   { label: 'Guardian App Link', value: 'SYNCED', color: 'text-emerald-500' },
                   { label: 'Avg Prep Level', value: 'OPTIMAL', color: 'text-white' }
                 ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/10 pb-4 last:border-0 last:pb-0">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
                       <span className={cn("text-[10px] font-black uppercase", stat.color)}>{stat.value}</span>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="border-none shadow-xl rounded-[2.5rem] bg-rose-50 dark:bg-rose-900/10 p-10 border border-rose-100 dark:border-rose-900/20">
              <div className="flex gap-4">
                 <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0" />
                 <div className="space-y-2">
                    <h4 className="text-sm font-black uppercase  tracking-tighter text-rose-600 dark:text-rose-400 ">Conflict Warning</h4>
                    <p className="text-[10px] font-bold text-rose-500/80 leading-relaxed uppercase">
                       Physics Drill #2 overlaps with Math Revision session on Mar 20. Please coordinate with regional head.
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
