"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Activity,
  ShieldAlert,
  Zap,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { TestApprovalDialog } from "@/components/admin/test-approval-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Test {
  id: string;
  title: string;
  teacher_name: string;
  subject: string;
  status: "draft" | "pending_approval" | "published";
  student_count: number;
  created_at: string;
}

export default function TestsOversightPage() {
  const { token, tenantSlug } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  const fetchTests = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api("/admin/tests", {
        token,
        tenant: tenantSlug || undefined,
      });
      setTests(response.data);
    } catch {
      setTests([]);
      toast.error("Error", {
        description: "Failed to fetch assessments from the server.",
      });
    } finally {
      setLoading(false);
    }
  }, [token, tenantSlug]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const filteredTests = tests.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Assessment Oversight</h2>
          <p className="text-zinc-600">
            Centralized monitoring, moderation, and quality control of institutional tests.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Tests Scheduled", value: tests.length, icon: Clock, color: "text-zinc-600" },
          { label: "Live Tests", value: tests.filter(t => t.status === 'published').length, icon: Zap, color: "text-zinc-600" },
          { label: "Needs Approval", value: tests.filter(t => t.status === 'pending_approval').length, icon: ShieldAlert, color: "text-zinc-600" },
          { label: "Drafts", value: tests.filter(t => t.status === 'draft').length, icon: FileText, color: "text-zinc-600" },
        ].map((stat, i) => (
          <Card key={i} className="border shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all-tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[500px]">
          <TabsTrigger value="all-tests" className="gap-2">
            <Activity className="h-4 w-4" />
            Master Directory
          </TabsTrigger>
          <TabsTrigger value="live-monitoring" className="gap-2">
            <Zap className="h-4 w-4 text-zinc-600" />
            Live Monitoring
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Test Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-tests" className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <Input 
                placeholder="Search title, teacher or subject..." 
                className="pl-9 h-10 border-zinc-100 bg-zinc-50/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="py-4">
              <CardTitle className="text-zinc-600">Assessment Queue</CardTitle>
              <CardDescription>Moderation and lifecycle management for all center tests.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50 border-none shadow-none">
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider pl-6">Test Identifier</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Assigned Faculty</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Academic Lead</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Engagement</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-600 pr-6">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-zinc-600 py-12 animate-pulse text-zinc-600 uppercase font-bold tracking-widest">
                        Initializing secure assessment chain...
                      </TableCell>
                    </TableRow>
                  ) : filteredTests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-zinc-600 py-12 text-zinc-600">
                        No active assessments detected.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTests.map((test) => (
                      <TableRow key={test.id} className="hover:bg-zinc-50/50 border-zinc-100 h-16 transition-colors group">
                        <TableCell className="pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-600 tracking-tight">{test.title}</span>
                            <span className="text-[10px] text-zinc-600 font-mono">MD_{test.id.toUpperCase()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-600 font-medium">{test.teacher_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] bg-zinc-50 font-bold uppercase">{test.subject}</Badge>
                        </TableCell>
                        <TableCell>
                           {test.status === "pending_approval" ? (
                             <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600 bg-orange-100/50 px-2 py-0.5 rounded-full w-fit">
                               <Clock className="h-3 w-3 animate-pulse" />
                               Under Review
                             </span>
                           ) : test.status === "published" ? (
                             <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600 bg-green-100/50 px-2 py-0.5 rounded-full w-fit">
                               <CheckCircle className="h-3 w-3" />
                               Active
                             </span>
                           ) : (
                             <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600 bg-zinc-100/50 px-2 py-0.5 rounded-full w-fit">
                               <AlertCircle className="h-3 w-3" />
                               Staged
                             </span>
                           )}
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1 px-1">
                              <div className="flex justify-between text-[8px] font-bold uppercase text-zinc-600">
                                 <span>Activity</span>
                                 <span>{test.student_count} Users</span>
                              </div>
                              <Progress value={Math.min(test.student_count * 2, 100)} className="h-1 bg-zinc-100" />
                           </div>
                        </TableCell>
                        <TableCell className="text-zinc-600 pr-6">
                           <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 transition-colors">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {test.status === "pending_approval" && (
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-8 py-0 px-3 text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-white hover:bg-zinc-800"
                                  onClick={() => setSelectedTest(test)}
                                >
                                   Review Submission
                                </Button>
                              )}
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

        <TabsContent value="live-monitoring" className="mt-6">
           <div className="grid gap-6 md:grid-cols-2">
              <Card className="border shadow-sm bg-zinc-900 text-white overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity className="h-24 w-24 animate-pulse" />
                 </div>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold uppercase tracking-widest">
                       <Zap className="h-4 w-4 text-zinc-600" />
                       Real-time Session Feed
                    </CardTitle>
                    <CardDescription className="text-zinc-600">Active test attempts currently in progress.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="p-8 text-zinc-600 uppercase font-bold tracking-widest">
                       Scanning for active sessions...
                    </div>
                 </CardContent>
              </Card>

              <Card className="border shadow-sm bg-white">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-zinc-600">
                       <ShieldAlert className="h-4 w-4" />
                       Anomaly Detection
                    </CardTitle>
                    <CardDescription>Security monitoring for suspicious activity.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="rounded-xl border border-dashed p-8 flex flex-col items-center justify-center text-zinc-600 space-y-4">
                       <CheckCircle className="h-12 w-12 text-zinc-600" />
                       <p className="text-zinc-600">No security anomalies detected in active sessions.</p>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>

      {selectedTest && (
        <TestApprovalDialog 
          open={!!selectedTest} 
          onOpenChange={(open) => !open && setSelectedTest(null)} 
          testId={selectedTest.id}
          testTitle={selectedTest.title}
          onAction={() => {
            setSelectedTest(null);
            fetchTests();
          }}
        />
      )}

      <TabsContent value="templates" className="mt-6">
        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Standardized Templates</CardTitle>
            <CardDescription>Reusable assessment structures for institutional consistency.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-12 text-zinc-600 border-2 border-dashed rounded-xl text-zinc-600">
               No test templates configured.
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
}
