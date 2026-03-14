"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
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
  Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  overview: {
    total_tests_taken: number;
    average_score: number;
    weakest_subject: string;
    strongest_subject: string;
    predicted_rank: number;
    percentile: number;
  };
  subject_performance: Array<{ subject: string; correct: number; total: number; accuracy: number }>;
  recent_trend: Array<{ percentage: number; date: string; test_title: string }>;
  ai_recommendation: string;
}

export default function StudentAnalyticsPage() {
  const { token, tenantSlug } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!token) return;
      setLoading(true);
      try {
        const response = await api("/student/analytics/insights", {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Analytics fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [token, tenantSlug]);

  const chartData = data?.recent_trend.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.percentage,
    // avg: 70 // Removed hardcoded average
  })) || [];

  const radarData = data?.subject_performance.map(item => ({
    subject: item.subject,
    value: item.accuracy,
    fullMark: 100
  })) || [];
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-zinc-600 font-black tracking-tighter uppercase">Growth Matrix</h1>
          <p className="text-zinc-600 font-medium">Deep dive into your performance metrics and AI-driven growth forecasting.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl font-bold bg-white border-zinc-200">
              UPCOMING TESTS
           </Button>
           <Button className="bg-primary text-white font-black rounded-xl">
              GOAL TRACKER
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Score Trend - Large Chart */}
        <Card className="lg:col-span-8 border shadow-md rounded-2xl overflow-hidden bg-white">
           <CardHeader className="p-6 border-b bg-zinc-50/50">
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="text-zinc-600 font-black uppercase tracking-tighter">Performance Velocity</CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase tracking-widest mt-1">Your score trend compared to class average</CardDescription>
                 </div>
                  {data && (
                    <Badge className="bg-emerald-500/10 text-zinc-600 border-none font-black text-[10px]">
                       {data.overview.average_score}% Avg Score
                    </Badge>
                 )}
              </div>
           </CardHeader>
           <CardContent className="p-8 h-[400px]">
              {loading ? (
                <div className="h-full w-full bg-secondary/20 animate-pulse rounded-2xl" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <defs>
                         <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#181b" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#181b" stopOpacity={0}/>
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
                         domain={[0, 100]}
                      />
                      <Tooltip 
                         contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: 900 }} 
                         cursor={{ stroke: '#181b', strokeWidth: 2 }}
                      />
                       <Area type="monotone" dataKey="score" stroke="#181b" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                       {/* Line removed as it depended on hardcoded avg */}
                   </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-600 font-black uppercase tracking-widest bg-secondary/10 rounded-2xl">
                   No test data to visualize performance.
                </div>
              )}
           </CardContent>
        </Card>

        {/* Radar Chart - Subject Breakdown */}
        <Card className="lg:col-span-4 border shadow-md rounded-2xl bg-zinc-900 text-white p-6 overflow-hidden relative">
           <div className="relative z-10 h-full flex flex-col">
              <h3 className="text-zinc-600 font-black uppercase tracking-tighter mb-2">Aptitude Radar</h3>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-8">Conceptual mapping across disciplines</p>
              
              <div className="flex-1 min-h-[300px]">
                 {loading ? (
                    <div className="h-full w-full bg-white/5 animate-pulse rounded-full" />
                 ) : radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#3f3f46" />
                          <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 900, fill: '#717a'}} />
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
                 ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-600 font-black uppercase tracking-widest text-zinc-600">
                       Radar requires multi-subject data.
                    </div>
                 )}
              </div>

              {data && (
                 <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Strongest Subject</span>
                       <span className="text-zinc-600 font-black text-zinc-600">{data.overview.strongest_subject}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Critical Area</span>
                       <span className="text-zinc-600 font-black text-zinc-600">{data.overview.weakest_subject}</span>
                    </div>
                 </div>
              )}
           </div>
           <Activity className="absolute -bottom-12 -right-12 h-48 w-48 opacity-5 rotate-12" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {/* Detailed Metrics */}
         <Card className="border shadow-md rounded-2xl p-6 bg-white flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-orange-5020 flex items-center justify-center">
               <TrendingUp className="h-8 w-8 text-zinc-600" />
            </div>
            <div className="text-zinc-600">
               <h4 className="text-zinc-600 font-black uppercase tracking-widest">Tests Taken</h4>
               <p className="text-zinc-600 font-black mt-1">{data?.overview.total_tests_taken || 0}</p>
               <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">Active Assessments</p>
            </div>
         </Card>

         <Card className="border shadow-md rounded-2xl p-6 bg-white flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-emerald-5020 flex items-center justify-center">
               <Target className="h-8 w-8 text-zinc-600" />
            </div>
            <div className="text-zinc-600">
               <h4 className="text-zinc-600 font-black uppercase tracking-widest">Avg Accuracy</h4>
               <p className="text-zinc-600 font-black mt-1">{data?.overview.average_score || 0}%</p>
               <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">Overall Proficiency</p>
            </div>
         </Card>

         <Card className="border shadow-md rounded-2xl p-6 bg-white flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-blue-5020 flex items-center justify-center">
               <Activity className="h-8 w-8 text-zinc-600" />
            </div>
            <div className="text-zinc-600">
               <h4 className="text-zinc-600 font-black uppercase tracking-widest">Stability Index</h4>
               <p className="text-zinc-600 font-black mt-1">{data ? (data.overview.average_score > 70 ? 'High' : 'Medium') : 'N/A'}</p>
               <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">Performance consistency</p>
            </div>
         </Card>
      </div>

      {/* AI Intelligence recommendations */}
      <Card className="border shadow-md rounded-2xl bg-black text-zinc-600 p-10 relative overflow-hidden group">
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="max-w-2xl space-y-6">
               <Badge className="bg-primary text-white border-none text-[10px] font-black uppercase tracking-widest px-4 py-1.5">
                  AI Recommendation Engine
               </Badge>
               <h2 className="text-zinc-600 font-black tracking-tighter uppercase leading-none">
                  Predictive Analysis: Score Forecast
               </h2>
               <p className="text-zinc-600 font-medium leading-relaxed">
                  {data?.ai_recommendation || "Take more tests to generate deep AI-driven growth forecasting and personalized study plans."}
               </p>
               <Button size="sm" className="bg-white text-zinc-600 font-black px-8 h-12 rounded-xl group-hover:scale-105 transition-all">
                  UNFOLD DETAIL STUDY PLAN <ArrowUpRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
            <div className="flex gap-4">
               {[
                  { label: 'Forecasted Rank', val: data?.overview.predicted_rank ? `#${data.overview.predicted_rank}` : 'Calculating...' },
                  { label: 'Current Percentile', val: data?.overview.percentile ? `${data.overview.percentile.toFixed(1)}%` : 'TBD' }
               ].map((m, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-zinc-600 min-w-[140px]">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">{m.label}</p>
                     <p className="text-zinc-600 font-black">{m.val}</p>
                  </div>
               ))}
            </div>
         </div>
         <Zap className="absolute -bottom-20 -left-20 h-64 w-64 text-zinc-600 opacity-10 rotate-[-15deg] group-hover:rotate-[5deg] transition-all duration-700" />
      </Card>
    </div>
  );
}
