"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  Search,
  ArrowUpRight,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QuestionStat {
  id: string;
  text: string;
  total_attempts: number;
  success_rate: number;
  avg_time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
}

export default function QuestionAnalyticsPage() {
  const [stats] = useState<QuestionStat[]>([
    { id: '1', text: 'Explain Heisenberg Uncertainty Principle...', success_rate: 45, total_attempts: 120, avg_time: '4.5m', difficulty: 'Hard', topics: ['Physics', 'Quantum'] },
    { id: '2', text: 'Solve for x: 2x + 5 = 15', success_rate: 92, total_attempts: 250, avg_time: '45s', difficulty: 'Easy', topics: ['Math', 'Algebra'] },
    { id: '3', text: 'Describe the Krebs Cycle phase 1...', success_rate: 68, total_attempts: 85, avg_time: '3.2m', difficulty: 'Medium', topics: ['Biology', 'Cells'] },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Question Intelligence</h1>
          <p className="text-muted-foreground text-sm font-medium">Item-level performance metrics and discrimination index analysis.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl gap-2 h-11 px-5">
              <Filter className="h-4 w-4" />
              Analyze Over Time
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-xl bg-zinc-900 text-white p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
               <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
               </div>
               <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase tracking-widest">Global Index</Badge>
            </div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Avg Discrimination Index</h3>
            <div className="flex items-baseline gap-2 mt-2">
               <span className="text-4xl font-black">0.72</span>
               <span className="text-xs font-bold text-emerald-400">+12% vs last month</span>
            </div>
         </Card>

         <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
               <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
               </div>
               <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-none text-[8px] font-black uppercase tracking-widest">Attention Required</Badge>
            </div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Low Success Questions</h3>
            <div className="flex items-baseline gap-2 mt-2">
               <span className="text-4xl font-black">14</span>
               <span className="text-xs font-bold text-rose-400">Trend: Stable</span>
            </div>
         </Card>

         <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
               <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
               </div>
               <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border-none text-[8px] font-black uppercase tracking-widest">High Integrity</Badge>
            </div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Optimal Difficulty Mix</h3>
            <div className="flex items-baseline gap-2 mt-2">
               <span className="text-4xl font-black">82%</span>
               <span className="text-xs font-bold text-emerald-400">Target Achieved</span>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-zinc-900">
               <CardHeader className="p-6 border-b bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div className="flex items-center justify-between">
                     <div>
                        <CardTitle className="text-lg font-black tracking-tight uppercase">Top Problem Areas</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Identifying questions with lowest concept mastery</CardDescription>
                     </div>
                     <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input 
                           type="text" 
                           placeholder="Search bank items..." 
                           className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border rounded-xl text-[10px] outline-none"
                        />
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y dark:divide-zinc-800">
                     {stats.map((item) => (
                        <div key={item.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                           <div className="space-y-2 flex-1 max-w-2xl">
                              <div className="flex items-center gap-3">
                                 <Badge className={cn(
                                    "text-[8px] font-black uppercase tracking-widest",
                                    item.difficulty === 'Hard' ? "bg-rose-100 text-rose-600" : item.difficulty === 'Medium' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                                 )}>
                                    {item.difficulty}
                                 </Badge>
                                 <div className="flex gap-1">
                                    {item.topics.map(t => <span key={t} className="text-[9px] font-medium text-zinc-400">#{t}</span>)}
                                 </div>
                              </div>
                              <h4 className="font-bold text-zinc-800 dark:text-zinc-100 leading-snug">{item.text}</h4>
                              <div className="flex gap-6 mt-4">
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase">Attempts</span>
                                    <span className="text-sm font-bold">{item.total_attempts}</span>
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase">Avg Time</span>
                                    <span className="text-sm font-bold">{item.avg_time}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-right space-y-2">
                              <div className="inline-flex flex-col items-end">
                                 <span className="text-[9px] font-black text-zinc-400 uppercase mb-1">Success Rate</span>
                                 <div className="flex items-center gap-3">
                                    <div className="h-2 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                       <div 
                                          className={cn("h-full", item.success_rate < 50 ? "bg-rose-500" : item.success_rate < 80 ? "bg-amber-500" : "bg-emerald-500")}
                                          style={{ width: `${item.success_rate}%` }}
                                       />
                                    </div>
                                    <span className="text-xl font-black">{item.success_rate}%</span>
                                 </div>
                              </div>
                              <Button variant="ghost" size="sm" className="rounded-xl font-bold gap-2 text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                 View Detailed Logs
                                 <ArrowUpRight className="h-3 w-3" />
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="border-none shadow-xl bg-zinc-900 text-white p-6 rounded-3xl">
               <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">Difficulty Distribution</CardTitle>
               </CardHeader>
               <CardContent className="p-0 h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={[
                              { name: 'Easy', value: 30, color: '#10b981' },
                              { name: 'Medium', value: 45, color: '#f59e0b' },
                              { name: 'Hard', value: 25, color: '#f43f5e' }
                           ]}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {[0,1,2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#f43f5e'][index]} />
                           ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }}
                           itemStyle={{ color: '#fff' }}
                        />
                     </PieChart>
                  </ResponsiveContainer>
               </CardContent>
               <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                     <span className="text-emerald-400">Easy (30%)</span>
                     <span className="text-zinc-500">120 Qs</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                     <span className="text-amber-400">Medium (45%)</span>
                     <span className="text-zinc-500">180 Qs</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                     <span className="text-rose-400">Hard (25%)</span>
                     <span className="text-zinc-500">100 Qs</span>
                  </div>
               </div>
            </Card>

            <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 p-6 rounded-3xl">
               <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">AI Recommendation</CardTitle>
               </CardHeader>
               <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                  <p className="text-xs font-bold leading-relaxed">
                     Your <span className="text-primary">&quot;Quantum Mechanics&quot;</span> questions have a discrimination index of <span className="text-primary">0.12</span>. 
                     Consider reframing these to be more conceptual rather than factual to better distinguish top students.
                  </p>
               </div>
               <Button className="w-full mt-4 rounded-xl font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.02] transform transition-all h-10 text-[10px]">
                  REWRITE WITH AI
               </Button>
            </Card>
         </div>
      </div>
    </div>
  );
}
