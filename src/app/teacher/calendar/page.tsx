"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Filter
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Test {
  id: string;
  title: string;
  status: string;
  scheduled_at?: string;
}

export default function TeacherCalendarPage() {
  const { user, token, tenantSlug } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    const fetchTests = async () => {
      if (!user || !token) return;
      try {
        const response = await api("/teacher/tests", {
          token,
          tenant: tenantSlug || undefined,
        });
        if (response.success) {
          setTests(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch tests:", error);
      }
    };
    fetchTests();
  }, [user, token, tenantSlug]);

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = [];
  const totalDays = daysInMonth(year, currentDate.getMonth());
  const startDay = firstDayOfMonth(year, currentDate.getMonth());

  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const getTestsForDay = (day: number) => {
    return tests.filter(test => {
      if (!test.scheduled_at) return false;
      const d = new Date(test.scheduled_at);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === year;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teaching Calendar</h1>
          <p className="text-muted-foreground">Manage your testing schedule and upcoming assessments.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
           </Button>
           <Link href="/teacher/tests/new">
             <Button className="gap-2">
               <Plus className="h-4 w-4" /> Schedule Test
             </Button>
           </Link>
        </div>
      </div>

      <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-zinc-50/50 dark:bg-zinc-800/30 p-6">
          <div className="flex items-center gap-4">
             <div className="bg-primary/10 p-2 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-primary" />
             </div>
              <div>
                <CardTitle className="text-2xl font-bold">{monthName} {year}</CardTitle>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-full h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="rounded-full px-4 h-9">
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full h-10 w-10">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b dark:border-zinc-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y dark:divide-zinc-800">
            {days.map((day, i) => (
              <div 
                key={i} 
                className={cn(
                  "min-h-[140px] p-2 transition-colors",
                  day ? "bg-white dark:bg-zinc-900/50" : "bg-zinc-50/30 dark:bg-zinc-900/10",
                  day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && "bg-primary/5"
                )}
              >
                {day && (
                  <div className="space-y-2">
                    <div className={cn(
                        "text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full ml-auto",
                        day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? "bg-primary text-white" : "text-zinc-500"
                    )}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {getTestsForDay(day).map(test => (
                        <Link key={test.id} href={`/teacher/tests/${test.id}/build`}>
                           <div className={cn(
                               "p-1.5 rounded-lg border text-[10px] font-medium truncate cursor-pointer hover:scale-105 transition-transform",
                               test.status === 'published' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-zinc-50 border-zinc-100 text-zinc-600'
                           )}>
                             {test.title}
                           </div>
                        </Link>
                      ))}
                      {getTestsForDay(day).length === 0 && day === new Date().getDate() && (
                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-primary/10 text-primary">
                             <Plus className="h-3 w-3" />
                           </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border shadow-sm bg-zinc-900 text-white">
            <CardHeader>
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Monthly Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex justify-between items-center text-sm font-medium">
                  <span>Tests Scheduled</span>
                  <span>{tests.filter(t => t.status === 'published').length} / 12</span>
               </div>
               <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min((tests.filter(t => t.status === 'published').length / 12) * 100, 100)}%` }} />
               </div>
               <p className="text-[10px] text-zinc-500">Target based on your 30-day academic pacing plan.</p>
            </CardContent>
         </Card>

         <Card className="border shadow-sm bg-white dark:bg-zinc-900">
            <CardHeader>
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Upcoming This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               {tests.filter(t => t.status === 'published').slice(0, 3).map(test => (
                 <div key={test.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                          <Plus className="h-4 w-4" />
                       </div>
                       <span className="text-xs font-medium">{test.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{new Date(test.scheduled_at || "").toLocaleDateString()}</span>
                 </div>
               ))}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
