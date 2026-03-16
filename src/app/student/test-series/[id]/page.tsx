"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  Play, 
  ChevronRight, 
  Lock,
  CheckCircle2,
  BookOpen,
  Zap,
  Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface Test {
  id: string;
  title: string;
  test_type: string;
  chapter_name?: string;
  duration_seconds: number;
}

interface SeriesData {
  series: {
    id: string;
    title: string;
    description: string;
    exam_type: string;
  };
  groups: Record<string, Test[]>;
}

export default function StudentSeriesDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token, tenantSlug } = useAuth();
  const [data, setData] = useState<SeriesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeriesDetail() {
      if (!token) return;
      try {
        const response = await api(`/student/test-series/${params.id}`, {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch series detail:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSeriesDetail();
  }, [token, params.id, tenantSlug]);

  if (loading) return <div className="p-12 text-zinc-600 animate-pulse font-black uppercase tracking-widest text-center">Synchronizing Course Data...</div>;
  if (!data) return <div className="p-12 text-zinc-600 font-black uppercase tracking-widest text-center">Series not found.</div>;

  const typeLabels: Record<string, string> = {
    'chapter': 'Chapter Tests',
    'sectional': 'Sectional Tests',
    'full': 'Full Mock Tests',
    'pyp': 'Previous Year Papers',
    'live': 'Live Tests'
  };

  return (
    <div className="min-h-screen bg-zinc-50 animate-in fade-in duration-700">
      {/* Header Sticky */}
      <div className="bg-white border-b px-8 py-10 sticky top-0 z-30 shadow-sm">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-4 py-1.5 rounded-full">
                     {data.series.exam_type}
                  </Badge>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Updated Today</span>
               </div>
               <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none">
                  {data.series.title}
               </h1>
               <p className="text-zinc-500 font-bold max-w-2xl">{data.series.description}</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
               <Button className="flex-1 md:flex-none h-14 px-10 bg-primary text-white font-black rounded-2xl shadow-lg hover:scale-[1.02] transform transition-all uppercase tracking-widest">
                  Add to My Exam
               </Button>
               <Button variant="outline" className="h-14 w-14 rounded-2xl border-2" onClick={() => router.back()}>
                  <Layout className="h-6 w-6" />
               </Button>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 py-12">
         <Tabs defaultValue={Object.keys(data.groups)[0] || 'all'} className="space-y-10">
            <TabsList className="bg-transparent h-auto p-0 flex space-x-2 overflow-x-auto no-scrollbar">
               {Object.keys(data.groups).map((type) => (
                  <TabsTrigger 
                    key={type} 
                    value={type}
                    className="h-14 px-8 rounded-2xl border-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:text-primary font-black uppercase tracking-widest transition-all"
                  >
                    {typeLabels[type] || type.toUpperCase()} ({data.groups[type].length})
                  </TabsTrigger>
               ))}
            </TabsList>

            {Object.keys(data.groups).map((type) => (
               <TabsContent key={type} value={type} className="animate-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {data.groups[type].map((test) => (
                        <Card key={test.id} className="border-2 rounded-[2rem] overflow-hidden group hover:border-primary transition-all bg-white relative">
                           <CardHeader className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center border group-hover:bg-primary/5">
                                    <FileText className="h-6 w-6 text-zinc-600 group-hover:text-primary" />
                                 </div>
                                 <Badge variant="outline" className="font-black text-[9px] uppercase px-3 py-1">
                                    {test.test_type}
                                 </Badge>
                              </div>
                              <CardTitle className="text-xl font-black text-zinc-900 uppercase tracking-tight group-hover:text-primary transition-colors">
                                 {test.title}
                              </CardTitle>
                              {test.chapter_name && (
                                 <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2">{test.chapter_name}</p>
                              )}
                           </CardHeader>
                           
                           <CardContent className="px-6 pb-6">
                              <div className="flex items-center gap-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-6">
                                 <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" /> {Math.floor(test.duration_seconds / 60)} MIN
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <BookOpen className="h-3.5 w-3.5" /> 100 QUES
                                 </div>
                              </div>
                              <Button 
                                 className="w-full bg-zinc-50 border-2 text-zinc-900 font-black h-12 rounded-xl flex items-center justify-between px-6 group-hover:bg-black group-hover:text-white transition-all"
                                 onClick={() => router.push(`/student/tests/${test.id}/lobby`)}
                              >
                                 START TEST
                                 <ArrowIcon />
                              </Button>
                           </CardContent>
                        </Card>
                     ))}
                  </div>
               </TabsContent>
            ))}
         </Tabs>
      </div>
    </div>
  );
}

function ArrowIcon() {
   return (
      <div className="h-6 w-6 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm rotate-[-45deg] group-hover:rotate-0 transition-transform">
         <Play className="h-3 w-3 fill-current text-black" />
      </div>
   );
}
