"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, Search, AlertTriangle, TrendingUp, FileText, ChevronLeft,
  Mail, Star, Trophy, CheckCircle, PlusCircle, MinusCircle, Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Student {
  id: string;
  name: string;
  email: string;
  avg_score: number;
  status: "active" | "at-risk" | "outstanding";
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avg_score: number;
  tests_taken: number;
}

interface BatchTest {
  id: string;
  title: string;
  test_type: string;
  test_pattern: string;
  is_assigned: boolean;
  created_at: string;
}

interface BatchData {
  batch: {
    id: string;
    name: string;
    subject: string;
    students_count: number;
    created_at: string;
  };
  students: Student[];
  metrics: {
    avg_score: number;
    total_students: number;
    critical_students: number;
  };
}

const statusVariant = (status: Student["status"]) => {
  if (status === "outstanding") return "default" as const;
  if (status === "at-risk") return "destructive" as const;
  return "secondary" as const;
};

const patternLabel: Record<string, string> = {
  nta: "NTA", tcs: "TCS iON", ssc: "SSC", custom: "Standard",
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function BatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, tenantSlug } = useAuth();

  const [data, setData] = useState<BatchData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tests, setTests] = useState<BatchTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const tenant = tenantSlug ?? undefined;

  const loadAll = useCallback(async () => {
    if (!token || !id) return;
    try {
      const [batchRes, leaderRes, testsRes] = await Promise.all([
        api(`/teacher/batches/${id}`, { token, tenant }),
        api(`/teacher/batches/${id}/leaderboard`, { token, tenant }),
        api(`/teacher/batches/${id}/tests`, { token, tenant }),
      ]);
      if (batchRes.success) setData(batchRes.data);
      if (leaderRes.success) setLeaderboard(leaderRes.data ?? []);
      if (testsRes.success) setTests(testsRes.data ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, id, tenant]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const toggleAssign = async (test: BatchTest) => {
    setTogglingId(test.id);
    try {
      if (test.is_assigned) {
        await api(`/teacher/batches/${id}/tests/${test.id}`, { method: "DELETE", token: token ?? undefined, tenant: tenantSlug ?? undefined });
      } else {
        await api(`/teacher/batches/${id}/tests/${test.id}`, { method: "POST", token: token ?? undefined, tenant: tenantSlug ?? undefined });
      }
      setTests((prev) =>
        prev.map((t) => t.id === test.id ? { ...t, is_assigned: !t.is_assigned } : t)
      );
    } catch {
      // ignore
    } finally {
      setTogglingId(null);
    }
  };

  const filteredStudents = (data?.students ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const atRisk = (data?.students ?? []).filter((s) => s.status === "at-risk");
  const outstanding = (data?.students ?? []).filter((s) => s.status === "outstanding");
  const assignedTests = tests.filter((t) => t.is_assigned);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 mt-4" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Batch not found or you don&apos;t have access.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{data.batch.name}</h1>
          <p className="text-sm text-muted-foreground">
            {data.batch.subject || "Multi-Subject"} · {data.metrics.total_students} students ·{" "}
            {assignedTests.length} tests assigned
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Total Students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.metrics.total_students}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Batch Average
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.metrics.avg_score}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" /> At-Risk Students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${data.metrics.critical_students > 0 ? "text-destructive" : ""}`}>
              {data.metrics.critical_students}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="students" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Students ({data.metrics.total_students})
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" /> Leaderboard
          </TabsTrigger>
          <TabsTrigger value="at-risk" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> At-Risk ({atRisk.length})
          </TabsTrigger>
          <TabsTrigger value="outstanding" className="gap-1.5">
            <Star className="h-3.5 w-3.5" /> Outstanding ({outstanding.length})
          </TabsTrigger>
          <TabsTrigger value="tests" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Tests ({assignedTests.length}/{tests.length})
          </TabsTrigger>
        </TabsList>

        {/* ─── All Students ─── */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle>Student Roster</CardTitle>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <StudentTable students={filteredStudents} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Leaderboard ─── */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Batch Leaderboard</CardTitle>
              <CardDescription>Students ranked by average score across all tests taken.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Tests Taken</TableHead>
                    <TableHead>Avg Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                        No test results yet to build a leaderboard.
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaderboard.map((entry, i) => (
                      <TableRow key={entry.id} className={i < 3 ? "font-medium" : ""}>
                        <TableCell>
                          <span className={`font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                          </span>
                        </TableCell>
                        <TableCell>{entry.name}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.tests_taken}</TableCell>
                        <TableCell>
                          <Badge variant={entry.avg_score >= 75 ? "default" : entry.avg_score < 40 ? "destructive" : "secondary"}>
                            {entry.avg_score}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── At-Risk ─── */}
        <TabsContent value="at-risk">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Students Needing Attention</CardTitle>
              <CardDescription>Scoring below 40%. Consider reaching out directly.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {atRisk.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">🎉 No at-risk students in this batch.</div>
              ) : (
                <StudentTable students={atRisk} showEmail />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Outstanding ─── */}
        <TabsContent value="outstanding">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Students scoring 75% or above across all tests.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {outstanding.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No outstanding students yet.</div>
              ) : (
                <StudentTable students={outstanding} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tests ─── */}
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Assignment</CardTitle>
                  <CardDescription>
                    Toggle which tests are visible to students in this batch.{" "}
                    <span className="font-medium text-foreground">{assignedTests.length} assigned</span> of {tests.length} total.
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => router.push("/teacher/tests")}>
                  Manage Tests
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Pattern</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Assign</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                        No tests created yet.{" "}
                        <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/teacher/tests/new")}>
                          Create your first test →
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tests.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{t.test_type || "full"}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {patternLabel[t.test_pattern] ?? t.test_pattern ?? "Standard"}
                        </TableCell>
                        <TableCell>
                          {t.is_assigned ? (
                            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                              <CheckCircle className="h-3.5 w-3.5" /> Assigned
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={t.is_assigned ? "destructive" : "default"}
                            className="gap-1.5"
                            disabled={togglingId === t.id}
                            onClick={() => toggleAssign(t)}
                          >
                            {togglingId === t.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : t.is_assigned ? (
                              <><MinusCircle className="h-3.5 w-3.5" /> Remove</>
                            ) : (
                              <><PlusCircle className="h-3.5 w-3.5" /> Assign</>
                            )}
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
      </Tabs>
    </div>
  );
}

// ─── Shared Student Table ──────────────────────────────────────────────────
function StudentTable({ students, showEmail = false }: { students: Student[]; showEmail?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {showEmail && <TableHead>Email</TableHead>}
          <TableHead>Avg Score</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Contact</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">No students to show.</TableCell>
          </TableRow>
        ) : (
          students.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{s.name}</p>
                  {!showEmail && <p className="text-xs text-muted-foreground">{s.email}</p>}
                </div>
              </TableCell>
              {showEmail && <TableCell className="text-muted-foreground">{s.email}</TableCell>}
              <TableCell>{s.avg_score}%</TableCell>
              <TableCell>
                <Badge variant={statusVariant(s.status)}>{s.status.replace("-", " ")}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" className="gap-1" onClick={() => window.open(`mailto:${s.email}`)}>
                  <Mail className="h-3.5 w-3.5" /> Email
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
