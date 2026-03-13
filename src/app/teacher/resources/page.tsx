"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FolderOpen, 
  FileText, 
  Video, 
  FileArchive, 
  Plus, 
  Search,
  MoreVertical,
  Download,
  Share2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'doc' | 'zip';
  size: string;
  uploaded_at: string;
  batch_count: number;
}

export default function TeacherResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const { token, tenantSlug } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      if (!token) return;
      try {
        const response = await api("/teacher/resources", {
          token,
          tenant: tenantSlug || undefined
        });
        setResources(response.data || []);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, [token, tenantSlug]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-rose-500" />;
      case 'video': return <Video className="h-5 w-5 text-indigo-500" />;
      case 'zip': return <FileArchive className="h-5 w-5 text-amber-500" />;
      default: return <FileText className="h-5 w-5 text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground">Upload and distribute course resources to your assigned batches.</p>
        </div>
        <div className="flex gap-2">
           <Button className="gap-2 bg-zinc-900 rounded-xl h-11 px-6 text-white shadow-sm hover:bg-black transition-all">
             <Plus className="h-4 w-4" />
             Upload Material
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border shadow-sm">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search materials..." 
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none text-xs focus:ring-2 ring-primary/20 outline-none"
                  />
               </div>
               <div className="flex gap-2">
                  <Badge variant="outline" className="rounded-full px-4 py-1.5 cursor-pointer hover:bg-zinc-50">All</Badge>
                  <Badge variant="outline" className="rounded-full px-4 py-1.5 cursor-pointer hover:bg-zinc-50 text-zinc-400 border-none">PDFs</Badge>
                  <Badge variant="outline" className="rounded-full px-4 py-1.5 cursor-pointer hover:bg-zinc-50 text-zinc-400 border-none">Videos</Badge>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground animate-pulse text-xs uppercase font-bold tracking-widest">
                    Retrieving resources...
                  </div>
                ) : resources.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                    No resources uploaded yet. Click &quot;Upload Material&quot; to begin.
                  </div>
                ) : (
                  resources.map((res) => (
                  <Card key={res.id} className="group border shadow-sm hover:shadow-md transition-all bg-white dark:bg-zinc-900 overflow-hidden">
                     <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                              {getIcon(res.type)}
                           </div>
                           <div>
                              <h4 className="font-bold text-sm tracking-tight">{res.name}</h4>
                              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">
                                 {res.size} • {res.uploaded_at} • Shared with {res.batch_count} batches
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-1">
                           <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Share2 className="h-4 w-4 text-zinc-400" /></Button>
                           <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Download className="h-4 w-4 text-zinc-400" /></Button>
                           <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-4 w-4 text-zinc-400" /></Button>
                        </div>
                     </CardContent>
                  </Card>
                ))
               )}
            </div>
         </div>

         <div className="space-y-6">
            <Card className="border shadow-sm bg-primary text-white p-6 rounded-2xl overflow-hidden relative">
               <div className="relative z-10 space-y-4">
                  <h3 className="text-lg font-black tracking-tight">Cloud Storage</h3>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Used Storage</span>
                        <span>-- / 10 GB</span>
                     </div>
                     <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-[0%]" />
                     </div>
                  </div>
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white text-white hover:text-primary rounded-xl font-bold">
                     Upgrade Storage
                  </Button>
               </div>
               <FolderOpen className="absolute -bottom-10 -right-10 h-40 w-40 text-black/10 rotate-12" />
            </Card>

            <Card className="border shadow-sm bg-zinc-900 text-white p-6 rounded-2xl">
               <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6">Recent Activities</h3>
               <div className="space-y-6">
                  <div className="text-center py-4 text-xs text-zinc-500 uppercase font-bold tracking-widest">
                     No recent activities.
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
