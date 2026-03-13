"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Download,
  Share2,
  BookOpen,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

export default function StudentTestResultPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');

  const result = {
    score: 145,
    totalMarks: 180,
    percentage: 80.5,
    rank: 42,
    totalStudents: 1250,
    percentile: 96.6,
    accuracy: 85,
    timeSpent: '2h 45m',
    subjects: [
      { name: 'Physics', score: 52, total: 60, accuracy: 88, color: 'text-blue-500' },
      { name: 'Chemistry', score: 48, total: 60, accuracy: 82, color: 'text-emerald-500' },
      { name: 'Mathematics', score: 45, total: 60, accuracy: 75, color: 'text-amber-500' }
    ],
    questions: [
       { id: 1, text: 'Find the value of $x$ if $2x + 5 = 15$.', status: 'correct', userAnswer: '5', correctAnswer: '5', explanation: 'Subtracting 5 from both sides gives $2x = 10$, hence $x = 5$.' },
       { id: 2, text: 'The derivative of $\\sin(x)$ is $\\cos(x)$.', status: 'correct', userAnswer: 'True', correctAnswer: 'True', explanation: 'By definition of differentiation, $\\frac{d}{dx}\\sin(x) = \\cos(x)$.' },
       { id: 3, text: 'Evaluate the integral: $\\int e^x dx$.', status: 'incorrect', userAnswer: '$e^{-x}$', correctAnswer: '$e^x + C$', explanation: 'The integral of the exponential function $e^x$ is $e^x$ plus the constant of integration $C$.' }
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      {/* Hero Score Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border-b px-8 py-16 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex flex-col gap-4 text-center md:text-left">
              <Badge className="w-fit bg-emerald-500/20 text-emerald-400 border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 mx-auto md:mx-0">
                 Excellent Performance
              </Badge>
              <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">Victory!</h1>
              <p className="text-zinc-400 text-lg font-medium max-w-md">
                 You outperformed 96% of your peers in this assessment. Great work on Physics!
              </p>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                 <Button className="bg-white text-black font-black px-8 h-12 rounded-xl">
                    <Download className="h-4 w-4 mr-2" /> PDF REPORT
                 </Button>
                 <Button variant="outline" className="bg-white/5 border-white/10 text-white px-8 h-12 rounded-xl">
                    <Share2 className="h-4 w-4 mr-2" /> SHARE
                 </Button>
              </div>
           </div>

           <div className="flex items-center gap-12 bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-inner">
              <div className="text-center space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Final Score</p>
                 <div className="text-5xl font-black italic tracking-tighter text-primary">
                    {result.score}<span className="text-xl text-zinc-500 font-normal">/{result.totalMarks}</span>
                 </div>
              </div>
              <div className="h-16 w-[1px] bg-white/10" />
              <div className="text-center space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Percentile</p>
                 <div className="text-5xl font-black italic tracking-tighter">
                    {result.percentile}<span className="text-xl text-emerald-500 font-normal">%</span>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
           <Trophy className="h-64 w-64" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b dark:border-zinc-800 pb-2">
         {['overview', 'review'].map((tab) => (
            <button 
               key={tab}
               className={cn(
                  "px-6 py-3 text-xs font-black uppercase tracking-widest transition-all relative",
                  activeTab === tab ? "text-primary" : "text-zinc-400 hover:text-zinc-600"
               )}
               onClick={() => setActiveTab(tab as 'overview' | 'review')}
            >
               {tab}
               {activeTab === tab && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-primary rounded-full transition-all" />}
            </button>
         ))}
      </div>

      {activeTab === 'overview' ? (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               {/* Subject Breakdown */}
               <Card className="border-none shadow-2xl rounded-[3rem] bg-white dark:bg-zinc-950 p-8">
                  <h3 className="text-lg font-black uppercase italic italic mb-8 tracking-tighter">Subject Insights</h3>
                  <div className="grid gap-6">
                     {result.subjects.map((sub) => (
                        <div key={sub.name} className="space-y-3">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h4 className="font-black text-sm uppercase">{sub.name}</h4>
                                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Efficiency: {sub.accuracy}%</p>
                              </div>
                              <div className="text-lg font-black italic">
                                 {sub.score}<span className="text-xs text-zinc-400 font-normal">/{sub.total}</span>
                              </div>
                           </div>
                           <Progress value={(sub.score/sub.total)*100} className="h-2 bg-zinc-100 dark:bg-zinc-900" />
                        </div>
                     ))}
                  </div>
               </Card>

               <div className="grid grid-cols-2 gap-8 text-center">
                  <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 p-8 flex flex-col items-center gap-2">
                     <Clock className="h-6 w-6 text-zinc-400" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Time Spent</p>
                     <div className="text-2xl font-black italic">{result.timeSpent}</div>
                  </Card>
                  <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 p-8 flex flex-col items-center gap-2">
                     <Target className="h-6 w-6 text-zinc-400" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Overall Accuracy</p>
                     <div className="text-2xl font-black italic text-emerald-500">{result.accuracy}%</div>
                  </Card>
               </div>
            </div>

            <div className="space-y-8">
               <Card className="border-none shadow-2xl rounded-[3.5rem] bg-primary p-12 text-white relative overflow-hidden group">
                  <div className="relative z-10 text-center">
                     <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 text-primary-foreground/60">Global Ranking</h4>
                     <div className="text-7xl font-black italic tracking-tighter mb-4">#{result.rank}</div>
                     <p className="text-xs font-bold text-primary-foreground/80 leading-relaxed">
                        Currently leading in the top 3% of the October Batch.
                     </p>
                     <Button className="w-full mt-8 bg-white text-black font-black rounded-[2rem] h-14 group-hover:scale-105 transition-transform">
                        VIEW LEADERBOARD
                     </Button>
                  </div>
                  <TrendingUp className="absolute -bottom-12 -right-12 h-48 w-48 opacity-10 rotate-[-15deg]" />
               </Card>
               
               <Card className="border-none shadow-xl rounded-[2.5rem] bg-zinc-950 p-8 text-white">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-6">AI Growth Engine</h4>
                  <div className="space-y-4">
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-xs font-bold leading-relaxed">
                           Focus on <span className="text-primary italic">Mechanics</span>. You spent 4 minutes more on it but accuracy was only 60%.
                        </p>
                     </div>
                     <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                        GENERATE PRACTICE PLAN
                        <ArrowUpRight className="h-3 w-3" />
                     </Button>
                  </div>
               </Card>
            </div>
         </div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               {result.questions.map((q, i) => (
                  <Card key={q.id} className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 overflow-hidden group">
                     <div className="flex min-h-[300px]">
                        <div className={cn(
                           "w-2 shrink-0",
                           q.status === 'correct' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <div className="flex-1 p-8 space-y-8">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                 <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none text-[10px] font-black px-3 py-1">Q {i + 1}</Badge>
                                 <Badge className={cn(
                                    "border-none text-[8px] font-black uppercase px-3 py-1",
                                    q.status === 'correct' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                 )}>
                                    {q.status}
                                 </Badge>
                              </div>
                              <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                                 <BookOpen className="h-4 w-4 text-zinc-400" />
                              </div>
                           </div>

                           <div className="text-xl font-bold leading-relaxed text-zinc-800 dark:text-zinc-200">
                              {q.text.split('$').map((part, idx) => 
                                 idx % 2 === 0 ? part : <InlineMath key={idx} math={part} />
                              )}
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Your Answer</p>
                                 <div className={cn("text-sm font-black italic", q.status === 'correct' ? "text-emerald-500" : "text-rose-500")}>{q.userAnswer}</div>
                              </div>
                              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Correct Answer</p>
                                 <div className="text-sm font-black italic text-emerald-500">{q.correctAnswer}</div>
                              </div>
                           </div>

                           <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 border-dashed">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                                 <AlertCircle className="h-3 w-3" /> Step-by-Step Explanation
                              </h5>
                              <p className="text-xs font-bold leading-relaxed text-zinc-600 dark:text-zinc-400">
                                 {q.explanation.split('$').map((part, idx) => 
                                    idx % 2 === 0 ? part : <InlineMath key={idx} math={part} />
                                 )}
                              </p>
                           </div>
                        </div>
                     </div>
                  </Card>
               ))}
            </div>

            <div className="space-y-8">
               <Card className="border-none shadow-2xl rounded-[3rem] bg-white dark:bg-zinc-950 p-8">
                  <h4 className="text-sm font-black uppercase tracking-tight italic mb-6">Filter by Status</h4>
                  <div className="grid gap-4">
                     {[
                        { label: 'All Questions', count: 45, icon: BookOpen },
                        { label: 'Correct', count: 32, icon: CheckCircle2, color: 'text-emerald-500' },
                        { label: 'Incorrect', count: 8, icon: XCircle, color: 'text-rose-500' },
                        { label: 'Unattempted', count: 5, icon: AlertCircle, color: 'text-amber-500' }
                     ].map((f) => (
                        <button key={f.label} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:scale-[1.02] transition-transform group text-left">
                           <div className="flex items-center gap-3">
                              <f.icon className={cn("h-4 w-4", f.color || "text-zinc-400")} />
                              <span className="text-[11px] font-black uppercase tracking-tight">{f.label}</span>
                           </div>
                           <Badge variant="ghost" className="bg-white dark:bg-zinc-950 font-black text-xs h-7 w-7 rounded-lg flex items-center justify-center p-0">{f.count}</Badge>
                        </button>
                     ))}
                  </div>
               </Card>
            </div>
         </div>
      )}
    </div>
  );
}
