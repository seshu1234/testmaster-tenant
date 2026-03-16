"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Search, 
  BookOpen, 
  Users, 
  ChevronRight, 
  Star,
  Zap,
  LayoutGrid,
  TrendingUp,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface TestSeries {
  id: string;
  title: string;
  description: string;
  exam_type: string;
  image_url?: string;
  is_premium: boolean;
  tests_count: number;
  metadata?: {
    languages?: string[];
    enrolled_count?: string;
  };
}

export default function StudentTestSeriesGallery() {
  const router = useRouter();
  const { token, tenantSlug } = useAuth();
  const [seriesList, setSeriesList] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchSeries() {
      if (!token) return;
      try {
        const response = await api('/student/test-series', {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setSeriesList(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch test series:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSeries();
  }, [token, tenantSlug]);

  const filteredSeries = seriesList.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.exam_type?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="p-12 space-y-8 max-w-7xl mx-auto">
      <div className="h-10 w-64 bg-zinc-100 animate-pulse rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => <div key={i} className="h-80 bg-zinc-100 animate-pulse rounded-3xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 p-8 space-y-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
             <Badge className="bg-primary/10 text-primary border-none text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Explore Catalog</Badge>
             <h1 className="text-zinc-900 font-black tracking-tighter uppercase leading-none">
                Mock Test <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Universe</span>
             </h1>
             <p className="text-xl font-bold text-zinc-500 max-w-2xl leading-relaxed">
                Boost your exam preparation with structured online test series for SSC, Banking, Railways & State Exams.
             </p>
          </div>
          <div className="w-full md:w-96 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
             <Input 
                placeholder="Search for your Exam (e.g. RRB NTPC)" 
                className="h-14 pl-12 rounded-2xl border-2 focus-visible:ring-primary/20 font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
           {['All', 'Banking', 'SSC', 'Railways', 'Teaching', 'Civil Services', 'Medical'].map((cat, i) => (
              <Button 
                key={i} 
                variant={i === 0 ? 'default' : 'outline'} 
                className="rounded-full px-8 font-black uppercase tracking-widest h-12 shrink-0 border-2"
              >
                {cat}
              </Button>
           ))}
        </div>

        {/* Featured Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {filteredSeries.map((series) => (
              <Card 
                key={series.id} 
                className="group relative border-2 shadow-sm rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white"
                onClick={() => router.push(`/student/test-series/${series.id}`)}
              >
                 <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-6">
                       <div className="h-16 w-16 rounded-3xl bg-zinc-100 flex items-center justify-center p-3 group-hover:bg-primary/10 transition-colors">
                          <LayoutGrid className="h-full w-full text-zinc-900" />
                       </div>
                       {series.is_premium && (
                          <Badge className="bg-amber-500 text-white border-none font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5">
                             <Award className="h-3.5 w-3.5" /> Pass Pro
                          </Badge>
                       )}
                    </div>
                    <CardTitle className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
                       {series.title}
                    </CardTitle>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mt-2">
                       <TrendingUp className="h-3 w-3" /> {series.exam_type}
                    </p>
                 </CardHeader>

                 <CardContent className="p-8 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-3xl bg-zinc-50 border border-zinc-100">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Total Tests</span>
                          <span className="text-xl font-black text-zinc-900">{series.tests_count} ITEMS</span>
                       </div>
                       <div className="p-4 rounded-3xl bg-zinc-50 border border-zinc-100">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Free Access</span>
                          <span className="text-xl font-black text-zinc-900">7 TESTS</span>
                       </div>
                    </div>
                    
                    <div className="mt-8 flex items-center gap-3">
                       <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                             <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-zinc-200" />
                          ))}
                       </div>
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {series.metadata?.enrolled_count || '15.4k'} Users Enrolled
                       </span>
                    </div>
                 </CardContent>

                 <CardFooter className="p-8 pt-0">
                    <Button className="w-full bg-zinc-900 text-white font-black h-14 rounded-2xl flex items-center justify-between px-6 group-hover:bg-primary transition-all">
                       VIEW TEST SERIES
                       <ChevronRight className="h-5 w-5" />
                    </Button>
                 </CardFooter>
              </Card>
           ))}
        </div>
      </div>
    </div>
  );
}
