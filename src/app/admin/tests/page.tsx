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

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Tests Scheduled", value: tests.length, icon: Clock, color: "text-zinc-600" },
          { label: "Live Tests", value: tests.filter(t => t.status === 'published').length, icon: Zap, color: "text-zinc-600" },
          { label: "Needs Approval", value: tests.filter(t => t.status === 'pending_approval').length, icon: ShieldAlert, color: "text-zinc-600" },
          { label: "Drafts", value: tests.filter(t => t.status === 'draft').length, icon: FileText, color: "text-zinc-600" },
        ].map((stat, i) => (
          <Card key={i} className="border shadow-sm bg-white overflow-hidden rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
              <CardTitle className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-lg sm:text-xl font-bold text-zinc-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all-tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[500px]">
          <TabsTrigger value="all-tests" className="gap-2 text-xs sm:text-sm">
            <Activity className="h-4 w-4" />
            <span className="hidden xs:inline">Master Directory</span>
            <span className="xs:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="live-monitoring" className="gap-2 text-xs sm:text-sm">
            <Zap className="h-4 w-4" />
            <span className="hidden xs:inline">Live Monitoring</span>
            <span className="xs:hidden">Live</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden xs:inline">Test Templates</span>
            <span className="xs:hidden">Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-tests" className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search title, teacher or subject..." 
                className="pl-9 h-11 border-zinc-200 bg-white shadow-sm focus:ring-2 focus:ring-zinc-900 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6">
              <CardTitle className="text-base text-zinc-900">Assessment Queue</CardTitle>
              <CardDescription className="text-xs text-zinc-500">Moderation and lifecycle management for all center tests.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-zinc-100 bg-zinc-50/30">
                      <TableHead className="py-4 pl-4 sm:pl-6 font-semibold text-[10px] sm:text-xs text-zinc-500 uppercase tracking-tight text-left sm:text-center border-x border-zinc-100">Test Identifier</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden md:table-cell">Assigned Faculty</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden xs:table-cell">Subject</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Status</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden lg:table-cell">Engagement</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 pr-4 sm:pr-6">Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="animate-pulse">
                          <TableCell colSpan={6} className="py-8 px-6">
                            <div className="h-8 bg-zinc-100 rounded-md"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredTests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20">
                          <FileText className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                          <p className="text-sm font-medium text-zinc-500">No matching assessments found.</p>
                          <Button variant="link" className="text-zinc-400 text-xs mt-1" onClick={() => setSearchTerm("")}>Clear search</Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTests.map((test) => (
                        <TableRow key={test.id} className="group hover:bg-zinc-100/50 transition-colors border-b border-zinc-100 even:bg-zinc-50/50">
                          <TableCell className="py-4 pl-4 sm:pl-6 border-x border-zinc-100 text-left sm:text-center">
                            <div className="flex flex-col items-start sm:items-center min-w-[120px] max-w-[200px] sm:max-w-none">
                              <span className="font-bold text-xs sm:text-sm text-zinc-900 truncate w-full">{test.title}</span>
                              <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono">MD_{test.id.toUpperCase()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-center border-r border-zinc-100 hidden md:table-cell font-bold text-sm text-zinc-700">{test.teacher_name}</TableCell>
                          <TableCell className="py-4 text-center border-r border-zinc-100 hidden xs:table-cell">
                            <Badge variant="outline" className="text-[9px] bg-zinc-100 font-bold uppercase border-none text-zinc-600 px-2 py-0">
                              {test.subject}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 text-center border-r border-zinc-100">
                             <div className="flex justify-center">
                               {test.status === "pending_approval" ? (
                                 <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                   <Clock className="h-2.5 w-2.5 animate-pulse" />
                                   Reviewing
                                 </span>
                               ) : test.status === "published" ? (
                                 <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                   <CheckCircle className="h-2.5 w-2.5" />
                                   Active
                                 </span>
                               ) : (
                                 <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full">
                                   <AlertCircle className="h-2.5 w-2.5" />
                                   Staged
                                 </span>
                               )}
                             </div>
                          </TableCell>
                          <TableCell className="py-4 text-center border-r border-zinc-100 hidden lg:table-cell">
                             <div className="flex flex-col items-center gap-1 px-4">
                                <div className="flex justify-between w-full text-[8px] font-bold uppercase text-zinc-500">
                                   <span>Activity</span>
                                   <span>{test.student_count} Users</span>
                                </div>
                                <Progress value={Math.min(test.student_count * 2, 100)} className="h-1 bg-zinc-100" />
                             </div>
                          </TableCell>
                          <TableCell className="py-4 text-center border-r border-zinc-100 pr-4 sm:pr-6">
                             <div className="flex justify-center gap-1.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 transition-colors">
                                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                                {test.status === "pending_approval" && (
                                  <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="h-8 py-0 px-2 sm:px-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-white hover:bg-zinc-800"
                                    onClick={() => setSelectedTest(test)}
                                  >
                                     Review
                                  </Button>
                                )}
                             </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
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
