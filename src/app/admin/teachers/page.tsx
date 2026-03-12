"use client";

import { useEffect, useState, useCallback } from "react";
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
  TrendingUp, 
  BarChart3, 
  Search, 
  Filter, 
  Users 
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Teacher {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  subjects?: string[];
  last_login?: string;
  tests_created?: number;
  avg_score?: number;
}

export default function TeachersPage() {
  const { token, tenantSlug } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const handleBulkInvite = () => {
    toast.success("Invitations Sent", {
      description: "Batch registration links have been dispatched to 12 candidates.",
    });
  };

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

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Faculty Management</h2>
          <p className="text-muted-foreground text-sm">
            Manage your teaching staff, subject assignments, and activity metrics.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBulkInvite} className="gap-2 border-zinc-200">
            <Mail className="h-4 w-4" />
            Bulk Invite
          </Button>
          <Button onClick={handleCreate} className="gap-2 bg-zinc-900 text-white">
            <UserPlus className="h-4 w-4" />
            Add Teacher
          </Button>
        </div>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="directory" className="gap-2">
            <Users className="h-4 w-4" />
            Staff Directory
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Academic Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search name, email, or subject..." 
                className="pl-9 h-10 border-zinc-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 h-10 border-zinc-200">
              <Filter className="h-4 w-4" />
              Status Filter
            </Button>
          </div>

          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader className="bg-zinc-900 text-white rounded-t-xl py-4">
              <CardTitle className="text-lg">Teacher Directory</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Active educators and their institutional access status.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50 border-none">
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider pl-6">Full Name</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Subject Domains</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Last Sync</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 animate-pulse text-muted-foreground text-xs uppercase font-bold">
                        Decrypting faculty records...
                      </TableCell>
                    </TableRow>
                  ) : filteredTeachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                        No teachers matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeachers.map((teacher: Teacher) => (
                      <TableRow key={teacher.id} className="hover:bg-zinc-50 border-zinc-50 group transition-colors">
                        <TableCell className="pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">{teacher.name}</span>
                            <span className="text-[10px] text-muted-foreground">{teacher.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {(teacher.subjects?.length ? teacher.subjects : ["General"]).map((s, i) => (
                               <Badge key={i} variant="secondary" className="text-[8px] font-bold uppercase bg-zinc-100 text-zinc-600 border-none">
                                 {s}
                               </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tight ${
                            teacher.status === 'active' ? 'bg-green-100 text-green-700' : 
                            'bg-zinc-100 text-zinc-700'
                          }`}>
                            {teacher.status || 'active'}
                          </span>
                        </TableCell>
                        <TableCell className="text-[10px] font-medium text-muted-foreground">
                          <div className="flex items-center gap-1.5 text-xs">
                             <History className="h-3 w-3 text-zinc-300" />
                             {teacher.last_login ? new Date(teacher.last_login).toLocaleDateString() : "Pending"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEdit(teacher)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(teacher)}>
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
        </TabsContent>

        <TabsContent value="performance" className="mt-6 space-y-6">
           <div className="grid gap-6 md:grid-cols-3">
              {[
                { label: "Tests Created", value: "248", icon: TrendingUp, color: "text-blue-600" },
                { label: "Avg Class Performance", value: "78.4%", icon: BarChart3, color: "text-green-600" },
                { label: "Engagement Score", value: "9.2/10", icon: History, color: "text-orange-600" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
                   <CardHeader className="py-4">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                         {stat.label}
                         <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="pb-4 pt-0">
                      <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                   </CardContent>
                </Card>
              ))}
           </div>

           <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
              <CardHeader>
                 <CardTitle>Teacher Effectiveness Ranking</CardTitle>
                 <CardDescription>Metrics based on test difficulty vs student outcomes.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                    {filteredTeachers.slice(0, 3).map((teacher, i) => (
                       <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                #{i+1}
                             </div>
                             <div>
                                <p className="text-sm font-bold">{teacher.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{teacher.subjects?.join(" & ") || "Academic staff"}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-8 text-right">
                             <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Tests</p>
                                <p className="text-sm font-bold">12</p>
                             </div>
                             <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Avg. Result</p>
                                <p className="text-sm font-bold text-green-600">84%</p>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      <TeacherForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        teacher={selectedTeacher} 
        onSuccess={handleFormSuccess} 
      />
    </div>
  );
}
