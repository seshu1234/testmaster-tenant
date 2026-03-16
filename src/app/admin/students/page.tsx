"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  RefreshCcw,
  AlertCircle,
  GraduationCap,
  CalendarDays,
  Users,
  ChevronLeft,
  ChevronRight,
  Key
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { StudentForm } from "@/components/admin/student-form";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Student {
  id: string;
  name: string;
  email: string;
  batch?: {
    id: string;
    name: string;
  };
  status: string;
  created_at: string;
}

export default function StudentsPage() {
  const { token, tenantSlug } = useAuth();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("batch") ?? "");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const { data, error: swrError, isLoading: swrLoading, mutate } = useSWR(
    token ? [`/admin/students`, currentPage, entriesPerPage, debouncedSearchTerm] : null,
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
  
  const students: Student[] = useMemo(() => {
    const rawData = data?.data || [];
    if (!searchTerm) return rawData;

    return rawData.filter((s: Student) => 
      (s.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.batch?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);
  const pagination = data?.meta || { current_page: 1, last_page: 1, total: 0 };
  const loading = swrLoading;
  const error = swrError?.message || null;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pagination.last_page)));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length && students.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s: Student) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    toast.success(`Bulk Operation`, {
      description: `Successfully applied ${action} to ${selectedIds.length} students.`,
    });
    setSelectedIds([]);
  };

  const fetchStudents = mutate;

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.name}?`)) return;

    try {
      await api(`/admin/students/${student.id}`, {
        method: "DELETE",
        token: token || undefined,
        tenant: tenantSlug || undefined,
      });
      
      toast.success("Student Removed", {
        description: `${student.name} has been deleted.`,
      });
      
      fetchStudents();
    } catch (err: unknown) {
      toast.error("Delete Failed", {
        description: err instanceof Error ? err.message : "Failed to delete student",
      });
    }
  };

  const handleResetPassword = async (student: Student) => {
    if (!confirm(`Are you sure you want to reset the password for ${student.name}? A new temporary password will be sent to ${student.email}.`)) return;

    try {
      await api(`/admin/students/${student.id}/reset-password`, {
        method: "POST",
        token: token || undefined,
        tenant: tenantSlug || undefined,
      });
      
      toast.success("Password Reset", {
        description: `Password has been reset for ${student.name}.`,
      });
    } catch (err: unknown) {
      toast.error("Failed to Reset Password", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedStudent(undefined);
    setIsFormOpen(true);
  };


  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-white rounded-xl border border-zinc-200 border-dashed p-12 mt-6">
        <div className="p-3 bg-red-50 rounded-full">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-zinc-900">Data Synchronization Failed</h3>
          <p className="text-zinc-500 max-w-sm mx-auto mt-1">
            We&apos;re having trouble reaching the database. This usually resolves itself with a quick refresh.
          </p>
        </div>
        <Button onClick={() => mutate()} variant="outline" className="gap-2 border-zinc-200">
          <RefreshCcw className="h-4 w-4" />
          Reconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-zinc-600">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Student Directory</h2>
          <p className="text-zinc-500 text-sm">
            Manage your learners, batch assignments, and academic status.
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2 border-zinc-200 h-10 hover:bg-zinc-50">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden text-xs">Import</span>
          </Button>
          <Button onClick={handleCreate} className="flex-1 sm:flex-none gap-2 bg-zinc-900 text-white h-10 hover:bg-zinc-800 transition-all shadow-sm">
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search by name, email, or batch..." 
              className="pl-9 h-11 border-zinc-200 bg-white shadow-sm focus:ring-2 focus:ring-zinc-900 transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button variant="outline" className="h-11 border-zinc-200 bg-white group" size="icon" onClick={() => mutate()}>
            <RefreshCcw className={`h-4 w-4 text-zinc-500 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 w-full justify-between sm:justify-start">
              <span className="text-sm font-bold text-zinc-900 whitespace-nowrap bg-zinc-100 px-3 py-1.5 rounded-lg">
                {selectedIds.length} Selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="gap-2 h-10 bg-zinc-900 text-white hover:bg-zinc-800 border-none px-4">
                    Actions
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction("Assign Batch")}>
                     Assign to Batch
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("Send SMS/Email")}>
                     Broadcast Message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("Suspend")}>
                     Suspend Accounts
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction("Delete")} className="text-red-600 focus:text-red-600">
                     Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none gap-2 h-11 border-zinc-200 bg-white">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
              <Button variant="outline" className="flex-1 md:flex-none gap-2 h-11 border-zinc-200 bg-white">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export List</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-0.5">
            <CardTitle className="text-base text-zinc-900">Enrolled Students</CardTitle>
            <CardDescription className="text-xs">
              {loading ? <Skeleton className="h-4 w-32 inline-block align-middle" /> : `Showing ${students.length} of ${pagination.total} total learners.`}
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
                  <TableHead className="w-[40px] sm:w-[50px] pl-4 sm:pl-6 py-4 border-x border-zinc-100">
                    <div className="flex justify-center">
                      <Checkbox 
                        checked={selectedIds.length === students.length && students.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-[10px] sm:text-xs text-zinc-500 uppercase tracking-tight text-left sm:text-center border-r border-zinc-100">Student Details</TableHead>
                  <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden md:table-cell">Batch</TableHead>
                  <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Status</TableHead>
                  <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden lg:table-cell">Admission</TableHead>
                  <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 pr-4 sm:pr-6">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && students.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-zinc-50">
                       <TableCell className="pl-6 py-4 border-x border-zinc-100">
                          <Skeleton className="h-4 w-4 mx-auto" />
                       </TableCell>
                       <TableCell className="py-4 border-r border-zinc-100">
                          <div className="flex flex-col items-center gap-2">
                             <Skeleton className="h-4 w-28" />
                             <Skeleton className="h-3 w-36" />
                          </div>
                       </TableCell>
                       <TableCell className="py-4 hidden md:table-cell border-r border-zinc-100">
                          <div className="flex justify-center">
                             <Skeleton className="h-5 w-16" />
                          </div>
                       </TableCell>
                       <TableCell className="py-4 border-r border-zinc-100">
                          <div className="flex justify-center">
                             <Skeleton className="h-5 w-14 rounded-full" />
                          </div>
                       </TableCell>
                       <TableCell className="py-4 hidden lg:table-cell border-r border-zinc-100">
                          <div className="flex justify-center">
                             <Skeleton className="h-4 w-20" />
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
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <Users className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                      <p className="text-sm font-medium text-zinc-500">No student records match your query.</p>
                      <Button variant="link" className="text-zinc-400 text-xs mt-1" onClick={() => setSearchTerm("")}>Clear search</Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student: Student) => (
                    <TableRow key={student.id} className="group hover:bg-zinc-100/50 transition-colors border-b border-zinc-100 even:bg-zinc-50/50">
                      <TableCell className="pl-4 sm:pl-6 py-4 text-zinc-600 border-x border-zinc-100 text-center">
                        <div className="flex justify-center">
                          <Checkbox 
                            checked={selectedIds.includes(student.id)}
                            onCheckedChange={() => toggleSelect(student.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-600 border-r border-zinc-100 text-left sm:text-center">
                        <div className="flex flex-col items-start sm:items-center min-w-0">
                          <span className="font-bold text-zinc-900 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{student.name}</span>
                          <span className="text-[10px] sm:text-xs text-zinc-500 truncate max-w-[120px] sm:max-w-none">{student.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 hidden md:table-cell text-zinc-600 border-r border-zinc-100 text-center">
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-transparent font-bold text-[10px] uppercase">
                          {student.batch?.name || "Unassigned"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center border-r border-zinc-100">
                        <Badge variant="outline" className={`h-6 px-2.5 items-center justify-center inline-flex font-bold text-[9px] sm:text-[10px] uppercase rounded-full border-none ${
                          student.status === 'active' ? 'bg-green-100 text-green-700' : 
                          student.status === 'suspended' ? 'bg-red-100 text-red-700' : 
                          'bg-zinc-100 text-zinc-600'
                        }`}>
                          {student.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 hidden lg:table-cell border-r border-zinc-100 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 font-medium">
                           <CalendarDays className="h-3.5 w-3.5" />
                           {new Date(student.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center border-r border-zinc-100 pr-4 sm:pr-6">
                        <div className="flex justify-center gap-1 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-zinc-500 hover:text-zinc-900" onClick={() => handleEdit(student)}>
                            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-zinc-500 hover:text-zinc-900" onClick={() => handleResetPassword(student)}>
                            <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-zinc-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(student)}>
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

      <StudentForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        student={selectedStudent} 
        onSuccess={() => {
          setIsFormOpen(false);
          mutate();
        }} 
      />
    </div>
  );
}
