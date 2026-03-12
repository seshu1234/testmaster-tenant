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
  Target, 
  Zap,
  ShieldAlert,
  ChevronRight,
  FileText
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
      // Fallback for UI testing
      setTests([
        { id: "t1", title: "JEE Mains Mock 1", teacher_name: "Prof. Verma", subject: "Physics", status: "pending_approval", student_count: 0, created_at: new Date().toISOString() },
        { id: "t2", title: "Chemical Bonding Quiz", teacher_name: "Dr. Sharma", subject: "Chemistry", status: "published", student_count: 42, created_at: new Date().toISOString() },
        { id: "t3", title: "Algebra Basics", teacher_name: "Mrs. Kapoor", subject: "Maths", status: "draft", student_count: 0, created_at: new Date().toISOString() },
      ]);
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
          <h2 className="text-3xl font-bold tracking-tight">Assessment Oversight</h2>
          <p className="text-muted-foreground">
            Centralized monitoring, moderation, and quality control of institutional tests.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Tests Scheduled", value: "24", icon: Clock, color: "text-blue-600" },
          { label: "Live Tests", value: "2", icon: Zap, color: "text-amber-500" },
          { label: "Avg. Pass Rate", value: "72%", icon: Target, color: "text-green-600" },
          { label: "Incomplete", value: "8", icon: AlertCircle, color: "text-red-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
            <Zap className="h-4 w-4 text-amber-500" />
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search title, teacher or subject..." 
                className="pl-9 h-10 border-zinc-100 bg-zinc-50/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 overflow-hidden">
            <CardHeader className="bg-zinc-900 text-white py-4">
              <CardTitle className="text-lg">Assessment Queue</CardTitle>
              <CardDescription className="text-zinc-400">Moderation and lifecycle management for all center tests.</CardDescription>
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
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-right pr-6">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 animate-pulse text-muted-foreground text-xs uppercase font-bold tracking-widest">
                        Initializing secure assessment chain...
                      </TableCell>
                    </TableRow>
                  ) : filteredTests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                        No active assessments detected.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTests.map((test) => (
                      <TableRow key={test.id} className="hover:bg-zinc-50/50 border-zinc-100 h-16 transition-colors group">
                        <TableCell className="pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">{test.title}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">MD_{test.id.toUpperCase()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{test.teacher_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] bg-zinc-50 font-bold uppercase">{test.subject}</Badge>
                        </TableCell>
                        <TableCell>
                           {test.status === "pending_approval" ? (
                             <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100/50 px-2 py-0.5 rounded-full w-fit">
                               <Clock className="h-3 w-3 animate-pulse" />
                               Under Review
                             </span>
                           ) : test.status === "published" ? (
                             <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-green-700 bg-green-100/50 px-2 py-0.5 rounded-full w-fit">
                               <CheckCircle className="h-3 w-3" />
                               Active
                             </span>
                           ) : (
                             <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100/50 px-2 py-0.5 rounded-full w-fit">
                               <AlertCircle className="h-3 w-3" />
                               Staged
                             </span>
                           )}
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1 px-1">
                              <div className="flex justify-between text-[8px] font-bold uppercase text-muted-foreground">
                                 <span>Activity</span>
                                 <span>{test.student_count} Users</span>
                              </div>
                              <Progress value={Math.min(test.student_count * 2, 100)} className="h-1 bg-zinc-100" />
                           </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                           <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 group-hover:text-primary transition-colors">
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
              <Card className="border-none shadow-sm bg-zinc-900 text-white overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity className="h-24 w-24 animate-pulse" />
                 </div>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                       <Zap className="h-4 w-4 text-amber-500" />
                       Real-time Session Feed
                    </CardTitle>
                    <CardDescription className="text-zinc-400">Active test attempts currently in progress.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {[
                      { student: "Aryan M.", test: "JEE Mains P-1", time: "24m elapsed", score: "84%" },
                      { student: "Sanya K.", test: "NEET Physics", time: "12m elapsed", score: "91%" },
                      { student: "Rahul S.", test: "JEE Mains P-1", time: "45m elapsed", score: "62%" },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 shadow-inner border border-white/5 group hover:bg-white/10 transition-colors">
                         <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">
                            {session.student.charAt(0)}
                         </div>
                         <div className="flex-1">
                            <p className="text-xs font-bold">{session.student} <span className="text-[10px] font-normal text-zinc-500">on {session.test}</span></p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                               <Clock className="h-2 w-2" /> {session.time} 
                               <span className="h-1 w-1 rounded-full bg-zinc-700" />
                               <span className="text-green-500 font-bold">{session.score} Potential</span>
                            </div>
                         </div>
                         <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-white transition-colors" />
                      </div>
                    ))}
                 </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white border-zinc-100">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <ShieldAlert className="h-4 w-4 text-red-500" />
                       Anomaly Detection
                    </CardTitle>
                    <CardDescription>Suspicious activity detected by the AI proctor.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="rounded-xl border border-dashed border-red-100 bg-red-50/30 p-8 flex flex-col items-center justify-center text-center space-y-4">
                       <AlertCircle className="h-12 w-12 text-red-200" />
                       <div className="space-y-1">
                          <p className="font-bold text-red-700">Security Breach (Mock)</p>
                          <p className="text-xs text-red-600/70 max-w-[200px]">Tab switching detected for 3 sessions in Batch JEE-Alpha.</p>
                       </div>
                       <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">Broadcast Alert</Button>
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
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Standardized Templates</CardTitle>
            <CardDescription>Reusable assessment structures for institutional consistency.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { name: "JEE Main (Full)", questions: 90, duration: "180m" },
                { name: "NEET Mini-Mock", questions: 45, duration: "60m" },
                { name: "Monthly Cumulative", questions: 60, duration: "120m" },
              ].map((template, i) => (
                <div key={i} className="p-4 rounded-xl border border-zinc-100 bg-white shadow-sm flex flex-col justify-between h-32">
                  <div>
                    <p className="font-bold text-sm">{template.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{template.questions} Qs • {template.duration}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest">Apply Template</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
}
