"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  BookOpen,
  TrendingUp,
  Calendar as CalendarIcon,
  ArrowRightLeft
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BatchForm } from "@/components/admin/batch-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Batch {
  id: string;
  name: string;
  description?: string;
  teacher_ids: string[];
  student_count: number;
  avg_score: number;
  status: string;
  created_at: string;
}

export default function BatchesPage() {
  const { token, tenantSlug } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | undefined>();

  const fetchBatches = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api("/admin/batches", {
        token,
        tenant: tenantSlug || undefined,
      });
      setBatches(response.data);
    } catch {
      setBatches([]);
      toast.error("Error", {
        description: "Failed to fetch batches from the server.",
      });
    } finally {
      setLoading(false);
    }
  }, [token, tenantSlug]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleDelete = async (batch: Batch) => {
    if (!confirm(`Are you sure you want to delete ${batch.name}? This will unassign all students.`)) return;

    try {
      await api(`/admin/batches/${batch.id}`, {
        method: "DELETE",
        token: token || undefined,
        tenant: tenantSlug || undefined,
      });
      
      toast.success("Success", {
        description: "Batch deleted successfully",
      });
      
      fetchBatches();
    } catch (err: unknown) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to delete batch",
      });
    }
  };

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedBatch(undefined);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchBatches();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Batch Management</h2>
          <p className="text-zinc-600">
            Organize students into groups and monitor their collective performance.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Batch
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-zinc-600 font-medium">Total Batches</CardTitle>
             <BookOpen className="h-4 w-4 text-zinc-600" />
           </CardHeader>
           <CardContent>
             <div className="text-xl font-bold">{batches.length}</div>
           </CardContent>
         </Card>
         <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-zinc-600 font-medium">Avg Student/Batch</CardTitle>
             <Users className="h-4 w-4 text-zinc-600" />
           </CardHeader>
           <CardContent>
             <div className="text-xl font-bold">
               {batches.length > 0 ? Math.round(batches.reduce((acc, b) => acc + b.student_count, 0) / batches.length) : 0}
             </div>
           </CardContent>
         </Card>
         <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-zinc-600 font-medium">Top Performance</CardTitle>
             <TrendingUp className="h-4 w-4 text-zinc-600" />
           </CardHeader>
           <CardContent>
             <div className="text-xl font-bold">
               {batches.length > 0 ? Math.max(...batches.map(b => b.avg_score)) : 0}%
             </div>
           </CardContent>
         </Card>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="directory" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Batch Directory
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Academic Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-6 space-y-6">
          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Batch Directory</CardTitle>
              <CardDescription>
                All active, completed, and archived academic groups.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50">
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Batch Name</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Teachers</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Students</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Avg Score</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xl font-bold text-[10px] uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-zinc-600 py-8 animate-pulse text-zinc-600">
                        Loading batches...
                      </TableCell>
                    </TableRow>
                  ) : batches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-zinc-600 py-8 text-zinc-600">
                        No batches found. Click &quot;New Batch&quot; to begin.
                      </TableCell>
                    </TableRow>
                  ) : (
                    batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{batch.name}</span>
                            <span className="text-[10px] text-zinc-600 line-clamp-1 max-w-[200px]">{batch.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {batch.teacher_ids.map((id) => (
                               <div key={id} className="h-6 w-6 rounded-full border-2 border-background bg-zinc-200 flex items-center justify-center text-[8px] font-bold" title={id}>
                                  {id.charAt(0).toUpperCase()}
                               </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {batch.student_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col gap-1 w-24">
                              <div className="flex justify-between text-[10px]">
                                <span>{batch.avg_score}%</span>
                              </div>
                              <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-primary" style={{ width: `${batch.avg_score}%` }} />
                              </div>
                           </div>
                        </TableCell>
                        <TableCell>
                           <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-tight ${
                             batch.status === 'active' ? 'bg-green-100 text-green-700' :
                             batch.status === 'completed' ? 'bg-zinc-100 text-zinc-700' :
                             'bg-zinc-50 text-zinc-500'
                           }`}>
                             {batch.status}
                           </span>
                        </TableCell>
                        <TableCell className="text-zinc-600">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(batch)} title="Edit Batch">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Transfer Students">
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(batch)} className="text-zinc-600  hover:bg-red-50" title="Delete Batch">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Institutional Calendar</CardTitle>
              <CardDescription>Manage holidays, exam schedules, and academic events.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-4">
                   <h4 className="text-xl font-bold uppercase tracking-wider text-zinc-600">Upcoming Events</h4>
                   {[
                     { date: "Oct 24", event: "Mid-Term Examination", type: "exam" },
                     { date: "Oct 31", event: "Diwali Break", type: "holiday" },
                     { date: "Nov 05", event: "Parent-Teacher Meeting", type: "event" },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-zinc-100 bg-zinc-50/50">
                       <div className="flex flex-col items-center justify-center h-12 w-12 rounded bg-white border border-zinc-200">
                         <span className="text-[10px] uppercase font-bold text-zinc-600">{item.date.split(' ')[0]}</span>
                         <span className="text-xl font-bold leading-none">{item.date.split(' ')[1]}</span>
                       </div>
                       <div className="flex-1">
                         <p className="text-xl font-bold">{item.event}</p>
                         <Badge variant="secondary" className="text-[9px] uppercase font-bold bg-zinc-200">{item.type}</Badge>
                       </div>
                       <Button variant="ghost" size="sm">Edit</Button>
                     </div>
                   ))}
                   <Button variant="outline" className="w-full gap-2 text-zinc-600">
                     <Plus className="h-3 w-3" />
                     Add Event
                   </Button>
                 </div>
                 <div className="rounded-xl border border-zinc-100 bg-zinc-50/30 p-8 flex flex-col items-center justify-center text-zinc-600 space-y-4">
                    <CalendarIcon className="h-12 w-12 text-zinc-600" />
                    <div className="space-y-1">
                      <p className="font-bold">Full Calendar View</p>
                      <p className="text-zinc-600">Manage academic events and scheduling.</p>
                    </div>
                    <Button size="sm">Launch Full Scheduler</Button>
                 </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BatchForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        batch={selectedBatch} 
        onSuccess={handleFormSuccess} 
      />
    </div>
  );
}
