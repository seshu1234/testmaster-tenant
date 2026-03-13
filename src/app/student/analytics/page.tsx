"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Activity, 
  ArrowUpRight,
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  AreaChart,
  Area,
  Line
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const scoreHistory = [
  { date: 'Sep 1', score: 120, avg: 105 },
  { date: 'Sep 15', score: 135, avg: 110 },
  { date: 'Oct 1', score: 128, avg: 108 },
  { date: 'Oct 15', score: 145, avg: 115 },
  { date: 'Nov 1', score: 142, avg: 112 },
  { date: 'Nov 15', score: 158, avg: 120 },
];

const subjectData = [
  { subject: 'Math', value: 85, fullMark: 100 },
  { subject: 'Physics', value: 78, fullMark: 100 },
  { subject: 'Chemistry', value: 92, fullMark: 100 },
  { subject: 'Biology', value: 65, fullMark: 100 },
  { subject: 'English', value: 88, fullMark: 100 },
];

export default function StudentAnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase">Growth Matrix</h1>
          <p className="text-muted-foreground text-sm font-medium">Deep dive into your performance metrics and AI-driven growth forecasting.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl font-bold bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              UPCOMING TESTS
           </Button>
           <Button className="bg-primary text-white font-black rounded-xl">
              GOAL TRACKER
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Score Trend - Large Chart */}
        <Card className="lg:col-span-8 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-zinc-950">
           <CardHeader className="p-8 border-b bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="text-xl font-black uppercase italic italic tracking-tighter">Performance Velocity</CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase tracking-widest mt-1">Your score trend compared to class average</CardDescription>
                 </div>
                 <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] italic">+12% Monthly Gain</Badge>
              </div>
           </CardHeader>
           <CardContent className="p-8 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={scoreHistory}>
                    <defs>
                       <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 900, fill: '#A1A1AA'}}
                       dy={10}
                    />
                    <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 900, fill: '#A1A1AA'}}
                    />
                    <Tooltip 
                       contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: 900 }} 
                       cursor={{ stroke: '#18181b', strokeWidth: 2 }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#18181b" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                    <Line type="monotone" dataKey="avg" stroke="#A1A1AA" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                 </AreaChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        {/* Radar Chart - Subject Breakdown */}
        <Card className="lg:col-span-4 border-none shadow-2xl rounded-[3rem] bg-zinc-900 text-white p-8 overflow-hidden relative">
           <div className="relative z-10 h-full flex flex-col">
              <h3 className="text-xl font-black uppercase italic italic tracking-tighter mb-2">Aptitude Radar</h3>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-8">Conceptual mapping across disciplines</p>
              
              <div className="flex-1 min-h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
                       <PolarGrid stroke="#3f3f46" />
                       <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 900, fill: '#71717a'}} />
                       <Radar
                          name="Competency"
                          dataKey="value"
                          stroke="#ffffff"
                          strokeWidth={3}
                          fill="#ffffff"
                          fillOpacity={0.15}
                       />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-4">
                 <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Strongest Subject</span>
                    <span className="text-sm font-black italic text-emerald-500">Chemistry (92%)</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Critical Area</span>
                    <span className="text-sm font-black italic text-rose-500">Biology (65%)</span>
                 </div>
              </div>
           </div>
           <Activity className="absolute -bottom-12 -right-12 h-48 w-48 opacity-5 rotate-12" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {/* Detailed Metrics */}
         <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white dark:bg-zinc-950 flex flex-col items-center gap-6">
            <div className="h-20 w-20 rounded-[2rem] bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
               <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-center">
               <h4 className="text-sm font-black uppercase tracking-widest italic">Improvement Rate</h4>
               <p className="text-3xl font-black italic mt-1">+18.4%</p>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Vs Previous Quarter</p>
            </div>
         </Card>

         <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white dark:bg-zinc-950 flex flex-col items-center gap-6">
            <div className="h-20 w-20 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
               <Target className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="text-center">
               <h4 className="text-sm font-black uppercase tracking-widest italic">Precision Index</h4>
               <p className="text-3xl font-black italic mt-1">94.2%</p>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Accuracy on Easy/Med Items</p>
            </div>
         </Card>

         <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white dark:bg-zinc-950 flex flex-col items-center gap-6">
            <div className="h-20 w-20 rounded-[2rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
               <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-center">
               <h4 className="text-sm font-black uppercase tracking-widest italic">Stability Score</h4>
               <p className="text-3xl font-black italic mt-1">8.5/10</p>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Performance Consistency</p>
            </div>
         </Card>
      </div>

      {/* AI Intelligence recommendations */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-black text-white p-12 relative overflow-hidden group">
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="max-w-2xl space-y-6">
               <Badge className="bg-primary text-white border-none text-[10px] font-black uppercase tracking-widest px-4 py-1.5">
                  AI Recommendation Engine
               </Badge>
               <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                  Predictive Analysis: Score Forecast
               </h2>
               <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                  Based on your current trajectory and consistency, our AI predicts a <span className="text-white italic font-bold">165+ score</span> in the upcoming All-India Series. To guarantee this, focus on high-weightage topics in Biology.
               </p>
               <Button className="bg-white text-black font-black px-8 h-12 rounded-xl group-hover:scale-105 transition-all">
                  UNFOLD DETAIL STUDY PLAN <ArrowUpRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
            <div className="flex gap-4">
               {[
                  { label: 'Predicted Rank', val: 'AIR 450' },
                  { label: 'Syllabus Health', val: '86%' }
               ].map((m, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] text-center min-w-[160px]">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{m.label}</p>
                     <p className="text-2xl font-black italic">{m.val}</p>
                  </div>
               ))}
            </div>
         </div>
         <Zap className="absolute -bottom-20 -left-20 h-64 w-64 text-primary opacity-10 rotate-[-15deg] group-hover:rotate-[5deg] transition-all duration-700" />
      </Card>
    </div>
  );
}
