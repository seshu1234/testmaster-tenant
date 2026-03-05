"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft,
  Search,
  RefreshCw,
  MonitorPlay,
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentLiveStatus {
  attempt_id: string;
  student_id: string;
  name: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  score: number | null;
  flags: number;
  last_active: string;
}

interface LiveStats {
  total_started: number;
  completed: number;
  in_progress: number;
  students: StudentLiveStatus[];
}

export default function TeacherLiveMonitorPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, tenantSlug } = useAuth();
  const testId = params.id as string;

  const [stats, setStats] = useState<LiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'flagged'>('all');
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchLiveStats = useCallback(async () => {
    if (!user || !token) return;
    try {
      const response = await api(`/v1/teacher/tests/${testId}/live`, { token, tenant: tenantSlug || undefined });
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch live stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [testId, user, token, tenantSlug]);

  const handleForceSubmit = async (attemptId: string, studentId: string) => {
    if (!user || !token || !confirm(`Force submit attempt for student ${studentId}?`)) return;
    try {
        const response = await api(`/v1/teacher/tests/${testId}/force-submit/${studentId}`, { 
            method: 'POST', 
            token, 
            tenant: tenantSlug || undefined 
        });
        if (response.success) {
            fetchLiveStats();
        }
    } catch (err) {
        console.error("Force submit failed:", err);
    }
  };

  const handleBroadcast = async () => {
    if (!user || !token || !broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    try {
        const response = await api(`/v1/teacher/tests/${testId}/broadcast`, {
            method: 'POST',
            token,
            tenant: tenantSlug || undefined,
            body: JSON.stringify({ message: broadcastMessage })
        });
        if (response.success) {
            setBroadcastMessage("");
            alert("Broadcast sent to all students.");
        }
    } catch (err) {
        console.error("Broadcast failed:", err);
    } finally {
        setIsBroadcasting(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchLiveStats]);

  const filteredStudents = stats?.students.filter(student => {
    const matchesSearch = student.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'in_progress') return matchesSearch && student.status === 'in_progress';
    if (filter === 'completed') return matchesSearch && student.status === 'completed';
    if (filter === 'flagged') return matchesSearch && student.flags > 0;
    return matchesSearch;
  }) || [];

  if (isLoading && !stats) {
      return <div className="p-8 text-center animate-pulse">Establishing secure link to exam nodes...</div>;
  }

  return (
    <div className="max-w-full mx-auto space-y-8 animate-in fade-in duration-500 pb-20 p-6">
      {/* 1. CONTROL HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl border shadow-lg">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                    <MonitorPlay className="h-8 w-8 text-primary" />
                    Live Assessment Command
                </h1>
                <p className="text-zinc-500 text-sm font-medium">Monitoring Test Node: <span className="text-primary font-bold">{testId.slice(0, 8)}</span></p>
            </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
                <input 
                    type="text" 
                    placeholder="Broadcast to all students..." 
                    className="w-full pl-4 pr-12 py-3 border-2 rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none bg-zinc-50 dark:bg-zinc-800 font-medium"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                />
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1.5 top-1.5 h-9 w-9 p-0 rounded-xl hover:bg-primary hover:text-white"
                    onClick={handleBroadcast}
                    disabled={isBroadcasting}
                >
                    <MonitorPlay className="h-5 w-5" />
                </Button>
            </div>
            <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-700 hidden md:block" />
            <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-2xl border">
                <Badge className="bg-emerald-500 text-white border-none py-2 px-4 rounded-xl flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                    LIVE
                </Badge>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl" onClick={fetchLiveStats}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>

      {/* 2. REAL-TIME TELEMETRY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <TelemetryCard 
            icon={<Users className="text-indigo-500" />} 
            label="Total Participants" 
            value={stats?.total_started || 0} 
          />
          <TelemetryCard 
            icon={<Activity className="text-amber-500" />} 
            label="In Progress" 
            value={stats?.in_progress || 0} 
            subValue="Actively answering"
          />
          <TelemetryCard 
            icon={<CheckCircle2 className="text-emerald-500" />} 
            label="Submissions" 
            value={stats?.completed || 0} 
            subValue="Final handshake done"
          />
          <TelemetryCard 
            icon={<AlertCircle className="text-rose-500" />} 
            label="Integrity Alerts" 
            value={stats?.students.reduce((acc, s) => acc + (s.flags || 0), 0) || 0} 
            subValue="Tab switches/refreshes"
          />
      </div>

      {/* 3. MONITORING GRID */}
      <Card className="rounded-3xl border-none shadow-xl bg-white dark:bg-zinc-900 border overflow-hidden">
          <CardHeader className="bg-zinc-50 dark:bg-zinc-800/30 border-b p-6 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input 
                        type="text" 
                        placeholder="Search By Student ID..." 
                        className="pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none w-64 bg-white dark:bg-zinc-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 shadow-sm">
                    {(['all', 'in_progress', 'completed', 'flagged'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === f ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
              </div>
              <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-50">
                      <StopCircle className="h-4 w-4 mr-2" />
                      Terminate Test
                  </Button>
              </div>
          </CardHeader>
          <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 divide-x divide-y dark:divide-zinc-800">
                  {filteredStudents.length > 0 ? filteredStudents.map(student => (
                      <div key={student.attempt_id} className="p-6 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/30 group">
                          <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                      {student.student_id.slice(-2).toUpperCase()}
                                  </div>
                                  <div>
                                      <h4 className="font-extrabold text-zinc-800 dark:text-zinc-100 truncate w-32 tracking-tight">ID: {student.student_id.slice(0, 10)}</h4>
                                      <div className="flex items-center gap-2">
                                          <div className={cn(
                                              "h-2 w-2 rounded-full",
                                              student.status === 'in_progress' ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"
                                          )} />
                                          <span className="text-[10px] font-bold text-zinc-400 uppercase">{student.status}</span>
                                      </div>
                                  </div>
                              </div>
                              {student.flags > 0 && (
                                  <Badge className="bg-rose-500 text-white border-none animate-bounce">
                                      {student.flags} FLAGS
                                  </Badge>
                              )}
                          </div>
                          
                          <div className="space-y-4">
                              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border">
                                  <div className="flex flex-col">
                                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Process Score</span>
                                      <span className="text-xl font-black text-primary">{student.score || '--'}</span>
                                  </div>
                                  <div className="text-right">
                                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Elapsed Time</span>
                                      <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-bold">
                                          <Clock className="h-3 w-3" />
                                          {Math.floor((Date.now() - new Date(student.started_at).getTime()) / 60000)}m
                                      </div>
                                  </div>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full transition-all duration-1000", student.status === 'completed' ? "bg-emerald-500" : "bg-primary animate-pulse")} 
                                    style={{ width: `${student.status === 'completed' ? 100 : 45}%` }} 
                                  />
                              </div>
                          </div>
                          
                          <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 rounded-lg text-[10px] font-bold h-8 border-rose-500/20 text-rose-500 hover:bg-rose-50"
                                onClick={() => handleForceSubmit(student.attempt_id, student.student_id)}
                                disabled={student.status === 'completed'}
                              >
                                {student.status === 'completed' ? 'SUBMITTED' : 'FORCE SUBMIT'}
                              </Button>
                          </div>
                      </div>
                  )) : (
                      <div className="col-span-full p-24 text-center">
                          <Activity className="h-16 w-16 text-zinc-200 mx-auto mb-6" />
                          <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest leading-loose">Waiting for Incoming Signals</h3>
                          <p className="text-zinc-300 text-sm">Active assessment telemetry will appear here in real-time.</p>
                      </div>
                  )}
              </div>
          </CardContent>
      </Card>
    </div>
  );
}

function TelemetryCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: number, subValue?: string }) {
    return (
        <Card className="rounded-3xl border-none shadow-lg bg-white dark:bg-zinc-900 border group">
            <CardContent className="p-6 flex items-center gap-6">
                <div className="h-[72px] w-[72px] rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div>
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</div>
                    <div className="text-4xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter">{value}</div>
                    {subValue && <div className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{subValue}</div>}
                </div>
            </CardContent>
        </Card>
    );
}
