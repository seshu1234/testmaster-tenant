"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  Mail, 
  History, 
  BarChart3, 
  Search, 
  Filter, 
  Users,
  RefreshCcw,
  AlertCircle,
  MoreVertical,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TeacherForm } from "@/components/admin/teacher-form";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  subjects?: string[];
  last_login?: string;
  tests_count?: number;
  avg_score?: number;
}

export default function TeachersPage() {
  const { token, tenantSlug } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const { data, error: swrError, isLoading: swrLoading, mutate } = useSWR(
    token ? [`/admin/teachers`, currentPage, entriesPerPage, searchTerm] : null,
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
  
  const teachers = useMemo(() => data?.data || [], [data]);
  const pagination = data?.meta || { current_page: 1, last_page: 1, total: 0 };
  const loading = swrLoading;
  const error = swrError?.message || null;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>();

  const handleDelete = async (teacher: Teacher) => {
    if (!confirm(`Are you sure you want to delete ${teacher.name}?`)) return;

    try {
      await api(`/admin/teachers/${teacher.id}`, {
        method: "DELETE",
        token: token || undefined,
        tenant: tenantSlug || undefined,
      });
      
      toast.success("Teacher Deleted", {
        description: `${teacher.name} has been removed from faculty.`,
      });
      
      mutate();
    } catch (err: unknown) {
      toast.error("Delete Failed", {
        description: err instanceof Error ? err.message : "Failed to delete teacher",
      });
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedTeacher(undefined);
    setIsFormOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pagination.last_page)));
  };

  // Performance data (can be optimized further with a separate endpoint if needed)
  const performanceData = useMemo(() => {
    return (teachers || []).map((t: Teacher) => ({
      name: (t.name || "").split(' ')[0],
      score: t.avg_score || 75,
    })).sort((a: { score: number }, b: { score: number }) => b.score - a.score);
  }, [teachers]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-white rounded-xl border border-zinc-200 border-dashed p-12">
        <div className="p-3 bg-red-50 rounded-full">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-zinc-900">Unable to load records</h3>
          <p className="text-zinc-500 max-w-sm mx-auto mt-1">
            We encountered a problem while fetching the faculty data. This might be a temporary server issue.
          </p>
        </div>
        <Button onClick={() => mutate()} variant="outline" className="gap-2 border-zinc-200">
          <RefreshCcw className="h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Faculty Management</h2>
          <p className="text-zinc-500 text-sm">
            Overview of your teaching staff, specializations, and performance metrics.
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2 border-zinc-200 h-10">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Invite</span>
            <span className="sm:hidden text-xs">Invite</span>
          </Button>
          <Button onClick={handleCreate} className="flex-1 sm:flex-none gap-2 bg-zinc-900 text-white h-10 hover:bg-zinc-800 transition-all">
            <UserPlus className="h-4 w-4" />
            Add Teacher
          </Button>
        </div>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 text-zinc-500 w-full sm:w-auto max-w-sm mb-4">
          <TabsTrigger value="directory" className="rounded-sm px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm flex-1 sm:flex-none gap-2">
            <Users className="h-4 w-4" />
            Staff Directory
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-sm px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm flex-1 sm:flex-none gap-2">
            <BarChart3 className="h-4 w-4" />
            Academic Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search by name, email, or subject..." 
                className="pl-9 h-11 border-zinc-200 bg-white shadow-sm focus:ring-2 focus:ring-zinc-900 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none gap-2 h-11 border-zinc-200 bg-white">
                <Filter className="h-4 w-4" />
                Filter Status
              </Button>
              <Button variant="outline" size="icon" onClick={() => mutate()} className="h-11 w-11 border-zinc-200 bg-white shrink-0 group">
                <RefreshCcw className={`h-4 w-4 text-zinc-500 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <CardTitle className="text-base text-zinc-900">Faculty List</CardTitle>
                <CardDescription className="text-xs">
                  {loading ? <Skeleton className="h-4 w-32 inline-block align-middle" /> : `Total ${pagination.total} educators active.`}
                </CardDescription>
              </div>
              <div className="h-9 w-9 bg-zinc-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-zinc-600" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-zinc-100 bg-zinc-50/30">
                      <TableHead className="py-4 pl-4 sm:pl-6 font-semibold text-[10px] sm:text-xs text-zinc-500 uppercase tracking-tight text-left sm:text-center border-x border-zinc-100">Teacher</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden lg:table-cell">Subjects</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden md:table-cell">Activity</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Score</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 pr-4 sm:pr-6">Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && teachers.length === 0 ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-b border-zinc-50">
                          <TableCell className="py-4 pl-6 border-x border-zinc-100">
                             <div className="flex items-center gap-3">
                               <Skeleton className="h-9 w-9 rounded-full" />
                               <div className="space-y-2">
                                 <Skeleton className="h-4 w-24" />
                                 <Skeleton className="h-3 w-32" />
                               </div>
                             </div>
                          </TableCell>
                          <TableCell className="py-4 hidden lg:table-cell border-r border-zinc-100">
                             <div className="flex justify-center gap-1.5">
                               <Skeleton className="h-5 w-12" />
                               <Skeleton className="h-5 w-12" />
                             </div>
                          </TableCell>
                          <TableCell className="py-4 hidden md:table-cell border-r border-zinc-100">
                             <div className="flex flex-col items-center gap-2">
                               <Skeleton className="h-4 w-20" />
                               <Skeleton className="h-3 w-16" />
                             </div>
                          </TableCell>
                          <TableCell className="py-4 border-r border-zinc-100">
                             <div className="flex justify-center">
                               <Skeleton className="h-8 w-12 rounded-lg" />
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
                    ) : teachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20">
                          <Users className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                          <p className="text-sm font-medium text-zinc-500">No faculty records found.</p>
                          <Button variant="link" className="text-zinc-400 text-xs mt-1" onClick={() => setSearchTerm("")}>Clear filters</Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      teachers.map((teacher: Teacher) => (
                        <TableRow key={teacher.id} className="group hover:bg-zinc-100/50 transition-colors border-b border-zinc-100 even:bg-zinc-50/50">
                          <TableCell className="py-4 pl-4 sm:pl-6 border-x border-zinc-100">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-900 text-[10px] sm:text-sm uppercase shrink-0">
                                {teacher.name.charAt(0)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-zinc-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{teacher.name}</span>
                                <span className="text-[10px] sm:text-xs text-zinc-500 truncate max-w-[100px] sm:max-w-none">{teacher.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4 text-center border-r border-zinc-100 hidden lg:table-cell">
                            <div className="flex flex-wrap justify-center gap-1.5 max-w-[200px] mx-auto">
                              {(teacher.subjects?.length ? teacher.subjects : ["General"]).map((s: string, i: number) => (
                                 <Badge key={i} variant="secondary" className="px-2 py-0 text-[10px] font-bold bg-zinc-100 text-zinc-600 rounded-md border-transparent">
                                   {s}
                                 </Badge>
                              ))}
                            </div>
                          </TableCell>
    
                          <TableCell className="py-4 text-center border-r border-zinc-100 hidden md:table-cell">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
                                 <History className="h-3 w-3 text-zinc-400" />
                                 {teacher.last_login ? new Date(teacher.last_login).toLocaleDateString() : "New member"}
                              </div>
                              <span className="text-[10px] text-zinc-400 pl-4.5">{teacher.tests_count || 0} tests monitored</span>
                            </div>
                          </TableCell>
    
                          <TableCell className="py-4 text-center border-r border-zinc-100">
                            <Badge variant="outline" className={`h-7 w-10 sm:h-8 sm:w-12 items-center justify-center inline-flex font-bold text-[10px] sm:text-xs rounded-lg ${
                              Number(teacher.avg_score) >= 75 ? 'bg-green-50 text-green-700 border-green-200' :
                              Number(teacher.avg_score) >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-zinc-50 text-zinc-600 border-zinc-200'
                            }`}>
                              {teacher.avg_score || 0}%
                            </Badge>
                          </TableCell>
    
                          <TableCell className="py-4 text-center border-r border-zinc-100 pr-4 sm:pr-6">
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-zinc-500 hover:text-zinc-900" onClick={() => handleEdit(teacher)}>
                                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-zinc-500">
                                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => handleEdit(teacher)} className="gap-2">
                                    <Pencil className="h-4 w-4" /> Edit Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600" onClick={() => handleDelete(teacher)}>
                                    <Trash2 className="h-4 w-4" /> Remove Faculty
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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

        <TabsContent value="performance" className="space-y-6 animate-in zoom-in-95 duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border shadow-sm">
                <CardHeader>
                   <CardTitle className="text-lg">Faculty Proficiency Index</CardTitle>
                   <CardDescription>Average student performance across subjects per instructor.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                   {performanceData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={performanceData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                         <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            fontSize={12} 
                            tick={{ fill: '#71717a' }}
                            dy={10}
                         />
                         <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            fontSize={12} 
                            tick={{ fill: '#71717a' }}
                            dx={-10}
                            domain={[0, 100]}
                         />
                         <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', background: '#18181b', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                         />
                         <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={40}>
                            {performanceData.map((entry: { score: number }, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.score >= 80 ? '#18181b' : entry.score >= 50 ? '#3f3f46' : '#71717a'} 
                              />
                            ))}
                         </Bar>
                       </BarChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="flex items-center justify-center h-full text-zinc-400">
                        Insufficient data for charts
                     </div>
                   )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                 <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Global Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="text-3xl font-bold font-mono">72.4%</div>
                       <p className="text-xs text-green-600 font-medium mt-1">+4.2% from last month</p>
                    </CardContent>
                 </Card>
                 <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Top Performer</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="text-xl font-bold truncate">
                          {performanceData[0]?.name || "N/A"}
                       </div>
                       <p className="text-xs text-zinc-500 mt-1">Consistency Rating: High</p>
                    </CardContent>
                 </Card>
                 <div className="p-6 rounded-xl bg-zinc-900 text-white flex items-center justify-between">
                    <div>
                       <h4 className="font-bold">Staff Training</h4>
                       <p className="text-xs text-zinc-400">3 modules due this week</p>
                    </div>
                    <Button variant="outline" className="h-8 bg-transparent border-white/20 hover:bg-white/10 text-white text-[10px] font-bold uppercase transition-all">
                       View All
                    </Button>
                 </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>

      <TeacherForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        teacher={selectedTeacher} 
        onSuccess={() => {
          setIsFormOpen(false);
          mutate();
        }} 
      />
    </div>
  );
}
