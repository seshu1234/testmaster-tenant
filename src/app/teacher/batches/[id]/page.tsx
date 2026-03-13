"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Search,
  MoreVertical,
  Mail,
  GraduationCap,
  Download,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
  attendance: number;
  avg_score: number;
  status: 'active' | 'at-risk' | 'outstanding';
  last_test: string;
}

export default function BatchDetailsPage() {
  const [students] = useState<Student[]>([
    { id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', attendance: 92, avg_score: 88, status: 'outstanding', last_test: 'Physics Mock' },
    { id: '2', name: 'Anita Gupta', email: 'anita@example.com', attendance: 85, avg_score: 42, status: 'at-risk', last_test: 'Math Unit 1' },
    { id: '3', name: 'Vikram Singh', email: 'vikram@example.com', attendance: 78, avg_score: 75, status: 'active', last_test: 'Chemistry Quiz' },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <Badge className="bg-primary/20 text-primary border-none mb-4 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            Detailed Performance Report
          </Badge>
          <h1 className="text-4xl font-black tracking-tight mb-2">IIT-JEE Batch A</h1>
          <div className="flex items-center gap-6 text-zinc-400 text-sm font-medium">
             <div className="flex items-center gap-2"><Users className="h-4 w-4" /> 42 Students</div>
             <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Physics, Chemistry, Math</div>
             <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Created Sep 2025</div>
          </div>
        </div>
        <div className="relative z-10 flex gap-3">
           <Button className="rounded-xl font-bold bg-white text-black hover:bg-zinc-100">MESSAGE BATCH</Button>
           <Button variant="outline" className="rounded-xl font-bold border-zinc-700 text-white hover:bg-zinc-800">EXPORT DATA</Button>
        </div>
        <CardDescription className="absolute -bottom-10 -right-10 opacity-5">
           <GraduationCap className="h-64 w-64 text-white" />
        </CardDescription>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-4">Batch Average</h3>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black italic">72.4%</span>
               <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold text-zinc-400 mt-2">+5% since last unit test</p>
         </Card>
         <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-4">Syllabus Progress</h3>
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-black">
                  <span>Units Completed</span>
                  <span>14/20</span>
               </div>
               <Progress value={70} className="h-1.5 bg-zinc-100 dark:bg-zinc-800" />
            </div>
         </Card>
         <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border-l-4 border-l-rose-500">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-4">Critical Students</h3>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black text-rose-500">04</span>
               <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest leading-none">Underperforming</span>
            </div>
         </Card>
         <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-4">Next Scheduled Test</h3>
            <div className="space-y-1">
               <p className="font-bold text-sm">Thermodynamics Final</p>
               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Oct 24, 2025 • 2:00 PM</p>
            </div>
         </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-zinc-950">
         <CardHeader className="p-8 border-b bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <CardTitle className="text-2xl font-black tracking-tighter uppercase">Student Roster</CardTitle>
                  <CardDescription className="font-bold text-[10px] uppercase tracking-widest">Manage enrollment and track individual progress</CardDescription>
               </div>
               <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                     type="text" 
                     placeholder="Search by name or email..." 
                     className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border rounded-2xl text-xs outline-none ring-primary/10 focus:ring-4 transition-all"
                  />
               </div>
            </div>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Student Name</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Attendance</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Avg Score</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-800">
                     {students.map((student) => (
                        <tr key={student.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black">
                                    {student.name.charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="font-bold text-sm">{student.name}</span>
                                    <span className="text-[10px] text-zinc-400 font-medium">{student.email}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="space-y-1.5 min-w-[120px]">
                                 <div className="flex justify-between text-[10px] font-bold">
                                    <span>{student.attendance}%</span>
                                 </div>
                                 <Progress value={student.attendance} className="h-1 rounded-full overflow-hidden" />
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-lg font-black italic">{student.avg_score}%</span>
                           </td>
                           <td className="px-8 py-6">
                              <Badge className={cn(
                                 "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none",
                                 student.status === 'outstanding' ? "bg-emerald-100 text-emerald-600" :
                                 student.status === 'at-risk' ? "bg-rose-100 text-rose-600" :
                                 "bg-blue-100 text-blue-600"
                              )}>
                                 {student.status.replace('-', ' ')}
                              </Badge>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Mail className="h-4 w-4" /></Button>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Download className="h-4 w-4" /></Button>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="border-none shadow-xl p-8 rounded-3xl bg-zinc-950 text-white">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black tracking-tight uppercase">Batch Transfers</h3>
               <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
               Moving students between batches allows for dynamic leveling based on performance.
               All test history and analytics will be preserved during the transfer.
            </p>
            <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black hover:scale-[1.02] transform transition-all shadow-xl">
               OPEN TRANSFER PORTAL
            </Button>
         </Card>

         <Card className="border-none shadow-xl p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black tracking-tight uppercase">Bulk Parent Comms</h3>
               <Mail className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
               Send automated performance summaries to all parents in this batch. 
               Includes detailed scorecards and attendance logs.
            </p>
            <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black">
               SCHEDULE ANNOUNCEMENT
            </Button>
         </Card>
      </div>
    </div>
  );
}
