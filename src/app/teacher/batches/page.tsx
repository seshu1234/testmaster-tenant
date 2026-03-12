"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  Search,
  Filter,
  Plus,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Batch {
  id: string;
  name: string;
  student_count: number;
  subject: string;
  last_test?: string;
}

export default function TeacherBatchesPage() {
  const { user, token, tenantSlug } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!user || !token) return;
      try {
        const response = await api("/v1/teacher/batches", {
          token,
          tenant: tenantSlug || undefined,
        });
        if (response.success) {
          setBatches(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [user, token, tenantSlug]);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading assigned batches...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">Manage students and monitor progress across your assigned batches.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search batches..." 
                className="w-full pl-9 pr-4 py-2 border rounded-xl bg-white dark:bg-zinc-900 focus:ring-2 ring-primary/20 outline-none transition-all"
              />
           </div>
           <Button variant="outline" size="icon" className="rounded-xl">
             <Filter className="h-4 w-4" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <Card key={batch.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div className="bg-primary/5 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                   <Users className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="rounded-full border-zinc-100 font-bold uppercase tracking-widest text-[8px]">Active</Badge>
              </div>
              <CardTitle className="mt-4 text-xl font-black tracking-tight">{batch.name}</CardTitle>
              <CardDescription className="text-sm font-medium text-zinc-500">{batch.subject}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Students</p>
                    <p className="text-xl font-black">{batch.student_count}</p>
                 </div>
                 <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Avg Score</p>
                    <p className="text-xl font-black">78%</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Course Completion</span>
                    <span>65%</span>
                 </div>
                 <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[65%]" />
                 </div>
              </div>

              <div className="pt-4 flex gap-2">
                 <Link href={`/teacher/batches/${batch.id}`} className="flex-1">
                    <Button className="w-full gap-2 rounded-xl group-hover:bg-primary/90">
                       Details
                       <ArrowRight className="h-4 w-4" />
                    </Button>
                 </Link>
                 <Button variant="outline" size="icon" className="rounded-xl">
                    <Plus className="h-4 w-4" />
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {batches.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
             <GraduationCap className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
             <p className="font-bold text-zinc-500">No batches assigned yet.</p>
             <p className="text-sm text-zinc-400">Contact coordinator to assign classes to your profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
