"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
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
  ArrowRightLeft,
  Search,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Filter
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const { data, isLoading, mutate } = useSWR(
    token ? [`/admin/batches`, currentPage, entriesPerPage, debouncedSearchTerm] : null,
    ([url, page, limit, search]) => api(url, { 
      token: token || undefined, 
      tenant: tenantSlug || undefined,
      params: { 
        page, 
        per_page: limit,
        search: search || ""
      }
    }),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const batches: Batch[] = useMemo(() => {
    const rawData = data?.data || [];
    if (!searchTerm) return rawData;

    return rawData.filter((b: Batch) => 
      (b.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      ((b as Batch & { subject?: string }).subject?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);
  const pagination = data?.meta || { current_page: 1, last_page: 1, total: 0 };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | undefined>();

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pagination.last_page)));
  };

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
      
      mutate();
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
    mutate();
  };

  // Stats (using actual data total if available, otherwise just current slice)
  const totalBatches = pagination.total || batches.length;
  const avgStudentPerBatch = useMemo(() => {
    if (batches.length === 0) return 0;
    return Math.round(batches.reduce((acc, b) => acc + (b.student_count || 0), 0) / batches.length);
  }, [batches]);
  
  const topScore = useMemo(() => {
    if (batches.length === 0) return 0;
    return Math.max(...batches.map(b => b.avg_score || 0));
  }, [batches]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Batch Management</h2>
          <p className="text-zinc-500 text-sm">
            Organize students into groups and monitor their collective performance.
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto gap-2 bg-zinc-900 text-white h-10 hover:bg-zinc-800 transition-all">
          <Plus className="h-4 w-4" />
          New Batch
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
         <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-zinc-50/50 border-b border-zinc-100">
             <CardTitle className="text-zinc-600 font-bold text-xs uppercase tracking-wider">Total Batches</CardTitle>
             <BookOpen className="h-4 w-4 text-zinc-400" />
           </CardHeader>
           <CardContent className="pt-4">
             <div className="text-2xl font-bold text-zinc-900">{totalBatches}</div>
             <p className="text-[10px] text-zinc-500 mt-1">Active academic groups</p>
           </CardContent>
         </Card>
         <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-zinc-50/50 border-b border-zinc-100">
             <CardTitle className="text-zinc-600 font-bold text-xs uppercase tracking-wider">Avg Student/Batch</CardTitle>
             <Users className="h-4 w-4 text-zinc-400" />
           </CardHeader>
           <CardContent className="pt-4">
             <div className="text-2xl font-bold text-zinc-900">{avgStudentPerBatch}</div>
             <p className="text-[10px] text-zinc-500 mt-1">Learners per classroom</p>
           </CardContent>
         </Card>
         <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-zinc-50/50 border-b border-zinc-100">
             <CardTitle className="text-zinc-600 font-bold text-xs uppercase tracking-wider">Top Performance</CardTitle>
             <TrendingUp className="h-4 w-4 text-zinc-400" />
           </CardHeader>
           <CardContent className="pt-4">
             <div className="text-2xl font-bold text-zinc-900">{topScore}%</div>
             <p className="text-[10px] text-green-600 font-medium mt-1">Highest achieving group</p>
           </CardContent>
         </Card>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 text-zinc-500 w-full sm:w-auto max-w-sm mb-4">
          <TabsTrigger value="directory" className="rounded-sm px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm flex-1 sm:flex-none gap-2">
            <BookOpen className="h-4 w-4" />
            Batch Directory
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-sm px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm flex-1 sm:flex-none gap-2">
            <CalendarIcon className="h-4 w-4" />
            Academic Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search batches by name or subject..." 
                className="pl-9 h-11 border-zinc-200 bg-white shadow-sm focus:ring-2 focus:ring-zinc-900 transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none gap-2 h-11 border-zinc-200 bg-white">
                <Filter className="h-4 w-4" />
                Filter Status
              </Button>
              <Button variant="outline" size="icon" onClick={() => mutate()} className="h-11 w-11 border-zinc-200 bg-white shrink-0 group">
                <RefreshCcw className={`h-4 w-4 text-zinc-500 group-hover:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <CardTitle className="text-base text-zinc-900">Academic Groups</CardTitle>
                <CardDescription className="text-xs">
                  {isLoading ? <Skeleton className="h-4 w-32 inline-block align-middle" /> : `Total ${pagination.total} batches configured.`}
                </CardDescription>
              </div>
              <div className="h-9 w-9 bg-zinc-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-zinc-600" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-zinc-100 bg-zinc-50/30">
                      <TableHead className="py-4 pl-4 sm:pl-6 font-semibold text-[10px] sm:text-xs text-zinc-500 uppercase tracking-tight text-left sm:text-center border-x border-zinc-100">Batch Name</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden md:table-cell">Subjects</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden sm:table-cell">Students</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Performance</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Status</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 pr-4 sm:pr-6">Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && batches.length === 0 ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-b border-zinc-50">
                          <TableCell className="py-4 pl-6 border-x border-zinc-100">
                             <div className="space-y-2">
                               <Skeleton className="h-4 w-32" />
                               <Skeleton className="h-3 w-40" />
                             </div>
                          </TableCell>
                          <TableCell className="py-4 hidden md:table-cell border-r border-zinc-100">
                             <div className="flex justify-center">
                               <Skeleton className="h-5 w-16" />
                             </div>
                          </TableCell>
                          <TableCell className="py-4 hidden sm:table-cell border-r border-zinc-100">
                             <div className="flex justify-center">
                               <Skeleton className="h-5 w-8 rounded-md" />
                             </div>
                          </TableCell>
                          <TableCell className="py-4 border-r border-zinc-100">
                             <div className="flex flex-col items-center gap-1">
                               <Skeleton className="h-4 w-10" />
                               <Skeleton className="h-1.5 w-16 rounded-full" />
                             </div>
                          </TableCell>
                          <TableCell className="py-4 border-r border-zinc-100">
                             <div className="flex justify-center">
                               <Skeleton className="h-5 w-14 rounded-full" />
                             </div>
                          </TableCell>
                          <TableCell className="py-4 border-r border-zinc-100 pr-6">
                             <div className="flex justify-center gap-2">
                               <Skeleton className="h-8 w-8 rounded-md" />
                               <Skeleton className="h-8 w-8 rounded-md" />
                             </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : batches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20">
                          <BookOpen className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                          <p className="text-sm font-medium text-zinc-500">No batch records found.</p>
                          <Button variant="link" className="text-zinc-400 text-xs mt-1" onClick={() => setSearchTerm("")}>Clear filters</Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      batches.map((batch) => (
                        <TableRow key={batch.id} className="group hover:bg-zinc-100/50 transition-colors border-b border-zinc-100 even:bg-zinc-50/50">
                          <TableCell className="py-4 pl-4 sm:pl-6 border-x border-zinc-100">
                            <div className="flex flex-col items-start sm:items-center">
                              <span className="font-bold text-zinc-900 text-xs sm:text-sm">{batch.name}</span>
                              <span className="text-[10px] sm:text-xs text-zinc-500 truncate max-w-[150px] sm:max-w-[250px]">{batch.description || "No description provided."}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4 text-center border-r border-zinc-100 hidden md:table-cell">
                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-transparent font-bold text-[10px] uppercase">
                              {(batch as Batch & { subject?: string }).subject || "General"}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="py-4 text-center border-r border-zinc-100 hidden sm:table-cell">
                             <Badge variant="outline" className="font-mono text-[10px] font-bold border-zinc-200 bg-zinc-50 px-1.5 py-0">
                               {batch.student_count || 0}
                             </Badge>
                          </TableCell>
    
                          <TableCell className="py-4 text-center border-r border-zinc-100">
                            <div className="flex flex-col items-center gap-1">
                               <span className="text-xs font-bold text-zinc-700">{batch.avg_score || 0}%</span>
                               <div className="h-1.5 w-16 bg-zinc-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-zinc-900" style={{ width: `${batch.avg_score || 0}%` }} />
                               </div>
                            </div>
                          </TableCell>
    
                          <TableCell className="py-4 text-center border-r border-zinc-100 uppercase tracking-tight">
                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                               batch.status === 'active' ? 'bg-green-100 text-green-700' :
                               batch.status === 'completed' ? 'bg-zinc-100 text-zinc-700' :
                               'bg-zinc-50 text-zinc-500'
                             }`}>
                               {batch.status || 'active'}
                             </span>
                          </TableCell>
    
                          <TableCell className="py-4 text-center border-r border-zinc-100 pr-4 sm:pr-6">
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-zinc-500 hover:text-zinc-900" onClick={() => handleEdit(batch)}>
                                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-zinc-500 hover:text-zinc-900 hidden xs:inline-flex">
                                <ArrowRightLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-zinc-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(batch)}>
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="bg-zinc-50/50 border-t border-zinc-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 order-2 sm:order-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-medium">Rows per page:</span>
                    <select 
                      className="bg-transparent text-xs font-bold text-zinc-900 border-none focus:ring-0 cursor-pointer"
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      {[5, 10, 20, 50].map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                    Showing {Math.min(pagination.total, (currentPage - 1) * entriesPerPage + 1)}-{Math.min(pagination.total, currentPage * entriesPerPage)} of {pagination.total}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 order-1 sm:order-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-zinc-200 disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - currentPage) <= 1)
                    .map((p, i, arr) => (
                      <div key={p} className="flex items-center">
                        {i > 0 && arr[i-1] !== p - 1 && <span className="text-zinc-400 px-1 text-xs">...</span>}
                        <Button 
                          variant={currentPage === p ? "default" : "outline"}
                          size="icon"
                          className={`h-8 w-8 text-xs font-bold border-zinc-200 ${currentPage === p ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'}`}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </Button>
                      </div>
                    ))
                  }
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-zinc-200 disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page || pagination.last_page === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
              <CardTitle className="text-lg">Institutional Calendar</CardTitle>
              <CardDescription>Manage holidays, exam schedules, and academic events.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-4">
                   <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Upcoming Events</h4>
                   {[
                     { date: "Oct 24", event: "Mid-Term Examination", type: "exam" },
                     { date: "Oct 31", event: "Diwali Break", type: "holiday" },
                     { date: "Nov 05", event: "Parent-Teacher Meeting", type: "event" },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-all">
                       <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800 text-white">
                         <span className="text-[8px] uppercase font-bold text-zinc-400">{item.date.split(' ')[0]}</span>
                         <span className="text-lg font-bold leading-none">{item.date.split(' ')[1]}</span>
                       </div>
                       <div className="flex-1">
                         <p className="font-bold text-zinc-900 text-sm">{item.event}</p>
                         <Badge variant="secondary" className="text-[8px] uppercase font-bold bg-zinc-100 text-zinc-600 border-transparent">{item.type}</Badge>
                       </div>
                       <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-900">Edit</Button>
                     </div>
                   ))}
                   <Button variant="outline" className="w-full gap-2 text-zinc-600 border-dashed border-zinc-300 h-10 hover:bg-zinc-50 transition-all rounded-xl">
                     <Plus className="h-3.5 w-3.5" />
                     Add Event
                   </Button>
                 </div>
                 <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-8 flex flex-col items-center justify-center text-zinc-500 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                       <CalendarIcon className="h-8 w-8 text-zinc-400" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-bold text-zinc-900">Full Calendar View</p>
                      <p className="text-xs text-zinc-500">Manage academic events and scheduling.</p>
                    </div>
                    <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 transition-all rounded-xl px-6">Launch Full Scheduler</Button>
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
