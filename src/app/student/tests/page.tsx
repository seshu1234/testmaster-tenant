"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Clock, 
  BookOpen, 
  ArrowUpRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StudentTest {
  id: string;
  title: string;
  type: string;
  start_time: string;
  duration_seconds: number;
  status: string;
}

export default function StudentTestsPage() {
  const { token, tenantSlug } = useAuth();
  const [tests, setTests] = useState<StudentTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      if (!token) return;
      try {
        const response = await api("/student/tests", {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setTests(response.data);
        }
      } catch (error) {
        console.error("Tests fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, [token, tenantSlug]);

  if (loading) return <div className="p-8 text-zinc-600 animate-pulse font-black uppercase tracking-widest text-zinc-600">Loading Assessment Vault...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-zinc-600 font-black tracking-tight uppercase">Assessment Vault</h1>
          <p className="text-zinc-600 font-medium">Manage your schedule, enter lobbies, and review upcoming challenges.</p>
        </div>
        <div className="flex gap-2">
           <Link href="/student/practice">
              <Button variant="outline" className="rounded-xl font-bold bg-white border-zinc-200 h-11">
                 <Plus className="h-4 w-4 mr-2" />
                 SELF PRACTICE
              </Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calendar View */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="border shadow-md rounded-2xl bg-white p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black uppercase text-zinc-600 tracking-widest px-2">
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                 </h3>
                 <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ChevronRight className="h-4 w-4" /></Button>
                 </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-zinc-600 mb-2">
                 {['S','M','T','W','T','F','S'].map(d => (
                    <span key={d} className="text-[10px] font-black text-zinc-600">{d}</span>
                 ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                 {Array.from({ length: 30 }).map((_, i) => {
                    const day = i + 1;
                    const today = new Date();
                    const hasTest = tests.some(t => new Date(t.start_time).getDate() === day && new Date(t.start_time).getMonth() === today.getMonth());
                    const isToday = day === today.getDate();
                    return (
                       <div 
                          key={i} 
                          className={cn(
                             "h-10 rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all",
                             isToday ? "bg-primary text-white font-black" : "hover:bg-zinc-50 text-xl font-bold",
                             hasTest && !isToday && "te"
                          )}
                       >
                          {day}
                          {hasTest && (
                             <div className={cn("absolute bottom-1 h-1 w-1 rounded-full", isToday ? "bg-white" : "bg-primary")} />
                          )}
                       </div>
                    );
                 })}
              </div>
           </Card>

           <Card className="border shadow-md rounded-2xl bg-zinc-900 text-white p-6 relative overflow-hidden group">
              <div className="relative z-10">
                 <h3 className="text-zinc-600 font-black tracking-tight uppercase mb-4">Integrity Pro</h3>
                 <p className="text-zinc-600 font-medium leading-relaxed mb-6">
                    Our AI-powered proctoring is active. Ensure a stable connection and fullscreen mode for a smooth experience.
                 </p>
                 <Button className="w-full bg-white text-zinc-600 font-black rounded-xl h-11 text-[10px]">
                    GUIDELINES & RULES
                 </Button>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
                 <CalendarIcon className="h-40 w-40" />
              </div>
           </Card>
        </div>

        {/* Right Column: Detailed Test List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
              <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                 <input 
                    type="text" 
                    placeholder="Search for tests..." 
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 rounded-xl border-none text-xl font-bold outline-none"
                 />
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="rounded-xl"><Filter className="h-4 w-4" /></Button>
              </div>
           </div>

           <div className="grid gap-4">
              {tests.length > 0 ? tests.map((test) => (
                 <Card key={test.id} className="border shadow-md rounded-2xl overflow-hidden bg-white group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                       <div className="flex flex-col md:flex-row items-stretch">
                          <div className="w-1.5 bg-primary shrink-0" />
                          <div className="flex-1 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                             <div className="flex gap-6 items-center flex-1">
                                <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex flex-col items-center justify-center border group-hover:scale-110 transition-transform">
                                   <span className="text-[8px] font-black text-zinc-600 uppercase">DATE</span>
                                   <span className="text-zinc-600 font-black">{new Date(test.start_time).getDate()}</span>
                                </div>
                                <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <Badge className="bg-primary/10 text-zinc-600 border-none text-[8px] font-black h-5 px-3 uppercase tracking-widest">{test.type || 'Assessment'}</Badge>
                                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                         {Math.floor(test.duration_seconds / 60)}m
                                      </span>
                                   </div>
                                   <h4 className="text-zinc-600 font-black tracking-tight uppercase truncate">{test.title}</h4>
                                   <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-600 mt-2">
                                      <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Scheduled: {new Date(test.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                      <div className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> System Check: OK</div>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                                <Link href={`/student/tests/${test.id}/lobby`}>
                                   <Button 
                                      className={cn(
                                         "h-12 px-8 rounded-xl font-black text-zinc-600 min-w-[140px] shadow-lg hover:scale-105 transition-all",
                                         test.status !== 'completed' ? "bg-black text-zinc-600" : "bg-zinc-100 text-zinc-600"
                                      )}
                                      disabled={test.status === 'completed'}
                                   >
                                      {test.status === 'completed' ? 'COMPLETED' : 'ENTER LOBBY'}
                                      <ArrowUpRight className="ml-2 h-4 w-4" />
                                   </Button>
                                </Link>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                                   {test.status === 'completed' ? 'Result available in history' : 'System ready for launch'}
                                </p>
                             </div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              )) : (
                 <div className="text-zinc-600 py-20 bg-white rounded-2xl border-2 border-dashed border-zinc-100">
                    <p className="font-black uppercase tracking-widest text-zinc-600">No Assessments Available</p>
                 </div>
              )}
           </div>
           
           <Button variant="ghost" className="w-full mt-2 rounded-2xl h-16 border-2 border-dashed border-zinc-100 font-black text-[10px] uppercase tracking-widest text-zinc-600  transition-all">
              Load Previous History
           </Button>
        </div>
      </div>
    </div>
  );
}
