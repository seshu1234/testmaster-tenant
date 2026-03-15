"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Target, 
  ArrowUpRight, 
  DollarSign, 
  PieChart as PieChartIcon,
  HelpCircle,
  Activity,
  Calculator,
  RotateCcw,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const roiData = [
  { segment: "JEE-2026", cost: 4200, value: 125, margin: 66 },
  { segment: "NEET-2025", cost: 3800, value: 9800, margin: 61 },
  { segment: "Foundation", cost: 1200, value: 4500, margin: 73 },
  { segment: "Crash Course", cost: 800, value: 3200, margin: 75 },
];

const engagementData = [
  { name: "Active Learners", value: 65, color: "#181b" },
  { name: "Passive Learners", value: 25, color: "#717a" },
  { name: "At Risk", value: 10, color: "#ef4444" },
];

const costTrend = [
  { month: "Jan", cost: 15.2 },
  { month: "Feb", cost: 14.8 },
  { month: "Mar", cost: 14.1 },
  { month: "Apr", cost: 13.5 },
  { month: "May", cost: 12.9 },
  { month: "Jun", cost: 12.2 },
];

export default function FinancialsPage() {
  const [manualCost, setManualCost] = useState("500");
  const [studentCount, setStudentCount] = useState("500");
  
  const digitalCost = Number(studentCount) * 15; // Placeholder math
  const savings = Number(manualCost) - digitalCost;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Financial Intelligence</h2>
          <p className="text-zinc-600">
            Analyze institutional ROI, student lifetime value, and engagement-driven financials.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800">
              <Calculator className="h-4 w-4" />
              ROI Calculator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle>Return on Investment Calculator</DialogTitle>
              <DialogDescription>
                Compare manual operational costs vs. TestMaster digital efficiency.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-zinc-600">Manual Monthly Ops Cost (₹)</label>
                 <Input 
                   type="number" 
                   value={manualCost} 
                   onChange={(e) => setManualCost(e.target.value)}
                   className="font-mono"
                 />
                 <p className="text-[9px] text-zinc-600">Includes printing, proctoring, and manual grading hours.</p>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-zinc-600">Total Students</label>
                 <Input 
                   type="number" 
                   value={studentCount} 
                   onChange={(e) => setStudentCount(e.target.value)}
                   className="font-mono"
                 />
               </div>
               
               <div className="mt-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Manual Projection</span>
                    <span className="text-xl font-bold">₹{Number(manualCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Digital Projection (TM)</span>
                    <span className="text-xl font-bold text-zinc-600">₹{digitalCost.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className="text-xl font-bold">Estimated Monthly Savings</span>
                    <Badge className="bg-green-100 text-zinc-600 hover:bg-green-100">
                      ₹{savings.toLocaleString()}
                    </Badge>
                  </div>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Est. ROI", value: "3.2x", icon: TrendingUp, trend: "+12%" },
          { label: "Active Students", value: "1,450", icon: Users, trend: "+5%" },
          { label: "Avg LTV", value: "₹45k", icon: Target, trend: "+8%" },
          { label: "Acquisition Cost", value: "₹2.4k", icon: DollarSign, trend: "-3%" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold uppercase tracking-wider text-zinc-600">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stat.value}</div>
              <p className={`text-[10px] font-medium mt-1 ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.trend} from last quarter
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-zinc-600" />
                Resource Allocation Value
              </CardTitle>
              <CardDescription>ROI analysis across major academic segments.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="text-zinc-600">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="segment" type="category" fontSize={10} axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px2px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#000" radius={[0, 4, 4, 0]} name="Value Gen" />
                <Bar dataKey="cost" fill="#d4d4d8" radius={[0, 4, 4, 0]} name="Platform Cost" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-zinc-600" />
              Cost Per Test Trend
            </CardTitle>
            <CardDescription>Operational cost efficiency over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costTrend}>
                <defs>
                   <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#181b" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#181b" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip />
                <Area type="monotone" dataKey="cost" stroke="#181b" fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Activity className="h-5 w-5 text-zinc-600" />
               Engagement Distribution
             </CardTitle>
             <CardDescription>Performance vs Platform Usage correlation.</CardDescription>
           </CardHeader>
           <CardContent className="flex flex-col items-center justify-center">
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={engagementData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {engagementData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="flex gap-4 mt-2">
                {engagementData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                     <span className="text-[10px] uppercase font-bold text-zinc-600">{item.name}</span>
                  </div>
                ))}
             </div>
           </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-zinc-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <TrendingUp className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-zinc-600 text-xl font-bold uppercase tracking-widest">Profitability by Batch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               {roiData.map((batch, i) => (
                 <div key={i} className="space-y-2 relative z-10">
                    <div className="flex justify-between items-end">
                       <span className="text-xl font-bold">{batch.segment}</span>
                       <span className="text-zinc-600 font-mono text-zinc-600">{batch.margin}% Margin</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-primary transition-all duration-1000" 
                         style={{ width: `${batch.margin}%` }} 
                       />
                    </div>
                 </div>
               ))}
               <Button variant="link" className="text-zinc-600 p-0 h-auto text-[10px] uppercase font-bold tracking-widest gap-1 hover:no-underline">
                  View Full breakdown
                  <ChevronRight className="h-3 w-3" />
               </Button>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 rounded-full bg-primary/5 text-zinc-600">
          <HelpCircle className="h-8 w-8" />
        </div>
        <div className="flex-1 text-zinc-600 md:te">
          <h4 className="font-bold">Institutional Intelligence Tip</h4>
          <p className="text-zinc-600">
            Your JEE-2026 Batch shows a5% higher engagement rate but 5% lower test completion. 
            Consider re-allocating teacher focus for doubt-clearing sessions to improve overall ROI.
          </p>
        </div>
        <Button variant="outline" className="gap-2 border-zinc-200">
          Download PDF Forecast
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  );
}
