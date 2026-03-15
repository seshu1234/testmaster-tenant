"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Pencil, Trash2, Search, Filter, Download, Upload, MoreHorizontal } from "lucide-react";
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

interface Student {
  id: string;
  name: string;
  email: string;
  batch?: string;
  status: string;
  created_at: string;
}

export default function StudentsPage() {
  const { token, tenantSlug } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    toast.success(`Bulk ${action}`, {
      description: `Applied ${action} to ${selectedIds.length} students.`,
    });
    setSelectedIds([]);
  };

  const fetchStudents = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api("/admin/students", {
        token,
        tenant: tenantSlug || undefined,
      });
      setStudents(response.data);
    } catch {
      setStudents([]);
      toast.error("Error", {
        description: "Failed to fetch students from the server.",
      });
    } finally {
      setLoading(false);
    }
  }, [token, tenantSlug]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.name}?`)) return;

    try {
      await api(`/admin/students/${student.id}`, {
        method: "DELETE",
        token: token || undefined,
        tenant: tenantSlug || undefined,
      });
      
      toast.success("Success", {
        description: "Student deleted successfully",
      });
      
      fetchStudents();
    } catch (err: unknown) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to delete student",
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

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchStudents();
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Student Directory</h2>
          <p className="text-zinc-600">
            Total {students.length} students enrolled in your center.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-zinc-200">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button variant="outline" className="gap-2 border-zinc-200">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleCreate} className="gap-2 bg-zinc-900 text-white">
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            <Input 
              placeholder="Search name, email, or batch..." 
              className="pl-9 h-10 border-zinc-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 h-10 border-zinc-200">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
            <span className="text-xl font-bold text-zinc-600">{selectedIds.length} Selected</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-2 h-10 bg-primary/10 text-zinc-600 hover:bg-primary/20 border-none px-4">
                  Bulk Operations
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction("Assign Batch")}>
                   Batch Assignment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("Send Email")}>
                   Send Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("Suspend")}>
                   Suspend Accounts
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction("Delete")} className="text-zinc-600">
                   Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-zinc-600">Students</CardTitle>
          <CardDescription className="text-zinc-600">
            Manage your learners, batch assignments, and academic status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 border-none">
                <TableHead className="w-[40px] pl-6">
                  <Checkbox 
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Student Details</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Batch</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Joined</TableHead>
                <TableHead className="text-zinc-600 pr-6 font-bold text-[10px] uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-zinc-600 py-12 text-zinc-600 animate-pulse text-zinc-600 uppercase font-bold tracking-widest">
                    Loading student records...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-zinc-600 py-12 text-zinc-600">
                    No students matching your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-zinc-100/30 border-zinc-50 group transition-colors">
                    <TableCell className="pl-6">
                      <Checkbox 
                        checked={selectedIds.includes(student.id)}
                        onCheckedChange={() => toggleSelect(student.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-600">{student.name}</span>
                        <span className="text-[10px] text-zinc-600">{student.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-primary/10 text-zinc-600">
                        {student.batch || "Unassigned"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tight ${
                        student.status === 'active' ? 'bg-green-100 text-green-700' : 
                        student.status === 'suspended' ? 'bg-red-100 text-red-700' : 
                        'bg-zinc-100 text-zinc-600'
                      }`}>
                        {student.status || 'active'}
                      </span>
                    </TableCell>
                    <TableCell className="text-[10px] font-medium text-zinc-600">
                      {new Date(student.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-zinc-600 pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEdit(student)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity  hover:bg-red-50" onClick={() => handleDelete(student)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StudentForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        student={selectedStudent} 
        onSuccess={handleFormSuccess} 
      />
    </div>
  );
}
