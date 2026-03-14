"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  BarChart3, 
  Filter
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

const performanceData = [
  { name: "JEE-2026-A", avg: 72, target: 80 },
  { name: "NEET-2025-T", avg: 68, target: 75 },
  { name: "Class-12-B", avg: 85, target: 82 },
  { name: "Foundation-9", avg: 62, target: 70 },
];

const trendData = [
  { month: "Jan", attempts: 1200 },
  { month: "Feb", attempts: 1800 },
  { month: "Mar", attempts: 2400 },
  { month: "Apr", attempts: 3200 },
];

export default function ReportBuilderPage() {
  const [loading, setLoading] = useState(false);

  const handleExport = (type: string) => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Success", {
        description: `Academic report exported as ${type} successfully.`,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Advanced Analytics & Reports</h2>
          <p className="text-zinc-600">
            Generate deep-dive academic reports and data exports for institutional analysis.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-zinc-600" />
            Report Configuration
          </CardTitle>
          <CardDescription>
            Select parameters to filter and generate your custom report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
             <div className="space-y-2">
               <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Academic Batch</label>
               <Select defaultValue="all">
                 <SelectTrigger>
                   <SelectValue placeholder="Select Batch" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Batches</SelectItem>
                   <SelectItem value="jee">JEE-2026-Alpha</SelectItem>
                   <SelectItem value="neet">NEET-2025-Turbo</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Test Category</label>
               <Select defaultValue="all">
                 <SelectTrigger>
                   <SelectValue placeholder="Select Category" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Full Tests</SelectItem>
                   <SelectItem value="quiz">Daily Quizzes</SelectItem>
                   <SelectItem value="practice">Subject Tests</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Time Period</label>
               <Select defaultValue="30d">
                 <SelectTrigger>
                   <SelectValue placeholder="Select period" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="7d">Last 7 Days</SelectItem>
                   <SelectItem value="30d">Last 30 Days</SelectItem>
                   <SelectItem value="90d">Last quarter</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="flex items-end">
               <Button className="w-full gap-2" variant="secondary">
                 <BarChart3 className="h-4 w-4" />
                 Update Preview
               </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Batch Performance Comparison</CardTitle>
            <CardDescription>Average scores vs institutional targets.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px2px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Bar dataKey="avg" fill="#000" radius={[4, 4, 0, 0]} name="Avg Score" />
                <Bar dataKey="target" fill="#e2e2e2" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
            <CardDescription>Total test attempts per month.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px2px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attempts" 
                  stroke="#000" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: '#000' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button 
          variant="outline" 
          className="gap-2 bg-white" 
          onClick={() => handleExport("Excel")}
          disabled={loading}
        >
          <FileSpreadsheet className="h-4 w-4 text-zinc-600" />
          Export to CSV
        </Button>
        <Button 
          variant="outline" 
          className="gap-2 bg-white" 
          onClick={() => handleExport("PDF")}
          disabled={loading}
        >
          <FileText className="h-4 w-4 text-zinc-600" />
          Export as PDF
        </Button>
        <Button 
          variant="outline" 
          className="gap-2 bg-white" 
          onClick={() => handleExport("Print")}
          disabled={loading}
        >
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
        <div className="flex-1" />
        <Button className="gap-2" disabled={loading}>
          <Download className="h-4 w-4" />
          {loading ? "Generating..." : "Download Full Bundle"}
        </Button>
      </div>
    </div>
  );
}
