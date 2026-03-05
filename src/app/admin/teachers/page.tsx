// src/app/admin/teachers/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeacherForm } from "@/components/admin/teacher-form";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

export default function TeachersPage() {
  const { token, tenantSlug } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>();

  const fetchTeachers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api("/admin/teachers", {
        token,
        tenant: tenantSlug || undefined,
      });
      setTeachers(response.data);
    } catch (err: unknown) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to load teachers",
      });
    } finally {
      setLoading(false);
    }
  }, [token, tenantSlug]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleDelete = async (teacher: Teacher) => {
    if (!confirm(`Are you sure you want to delete ${teacher.name}?`)) return;

    try {
      await api(`/v1/admin/teachers/${teacher.id}`, {
        method: "DELETE",
        token: token || undefined,
        tenant: tenantSlug || undefined,
      });
      
      toast.success("Success", {
        description: "Teacher deleted successfully",
      });
      
      fetchTeachers();
    } catch (err: unknown) {
      toast.error("Error", {
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

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchTeachers();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">
            Manage your teaching staff and their platform access.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Directory</CardTitle>
          <CardDescription>
            A list of all educators registered in your centre.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground animate-pulse">
                    Loading teachers...
                  </TableCell>
                </TableRow>
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No teachers found. Click &quot;Add Teacher&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        teacher.status === 'active' ? 'bg-green-100 text-green-800' : 
                        teacher.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {teacher.status || 'active'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(teacher.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(teacher)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
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

      <TeacherForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        teacher={selectedTeacher} 
        onSuccess={handleFormSuccess} 
      />
    </div>
  );
}
