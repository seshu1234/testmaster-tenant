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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Users, Search, AlertTriangle, TrendingUp, FileText, ChevronLeft,
  Star, Trophy, CheckCircle, PlusCircle, MinusCircle, Loader2, UserPlus, UserMinus,
} from "lucide-react";

interface StudentSearch {
  id: string;
  name: string;
  email: string;
  in_batch: boolean;
  batch_id: string | null;
  current_batch_name: string | null;
}

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

  // Enrollment dialog state
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollSearch, setEnrollSearch] = useState("");
  const [enrollResults, setEnrollResults] = useState<StudentSearch[]>([]);
  const [enrollSearching, setEnrollSearching] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const tenant = tenantSlug ?? undefined;

  const loadAll = useCallback(async () => {
    if (!token || !id) return;
    try {
      const [batchRes, leaderRes, testsRes] = await Promise.all([
        api(`/teacher/batches/${id}`, { token: token ?? undefined, tenant }),
        api(`/teacher/batches/${id}/leaderboard`, { token: token ?? undefined, tenant }),
        api(`/teacher/batches/${id}/tests`, { token: token ?? undefined, tenant }),
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

  // Student enrollment search
  const searchEnrollStudents = useCallback(async (q: string) => {
    if (!token || !id) return;
    setEnrollSearching(true);
    try {
      const res = await api(`/teacher/batches/${id}/students/search?q=${encodeURIComponent(q)}`, {
        token: token ?? undefined, tenant,
      });
      if (res.success) setEnrollResults(res.data ?? []);
    } catch {
      // ignore
    } finally {
      setEnrollSearching(false);
    }
  }, [token, id, tenant]);

  useEffect(() => {
    if (enrollOpen) searchEnrollStudents(enrollSearch);
  }, [enrollSearch, enrollOpen, searchEnrollStudents]);

  const toggleEnroll = async (student: StudentSearch) => {
    setEnrollingId(student.id);
    try {
      if (student.in_batch) {
        await api(`/teacher/batches/${id}/students/${student.id}`, {
          method: "DELETE", token: token ?? undefined, tenant,
        });
      } else {
        await api(`/teacher/batches/${id}/students/${student.id}`, {
          method: "POST", token: token ?? undefined, tenant,
        });
      }
      setEnrollResults((prev) =>
        prev.map((s) => s.id === student.id ? { ...s, in_batch: !s.in_batch } : s)
      );
      // Reload batch data to update student count
      loadAll();
    } catch {
      // ignore
    } finally {
      setEnrollingId(null);
    }
  };

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
      <div className="flex items-center justify-between gap-3">
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
        <Button variant="outline" size="sm" className="gap-2" onClick={() => { setEnrollSearch(""); setEnrollOpen(true); }}>
          <UserPlus className="h-3.5 w-3.5" /> Manage Students
        </Button>
      </div>

      {/* Student Enrollment Dialog */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Students</DialogTitle>
            <DialogDescription>
              Search for students in your institution and add them to <strong>{data.batch.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name or email..."
                value={enrollSearch}
                onChange={(e) => setEnrollSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {enrollSearching ? (
                <div className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
              ) : enrollResults.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  {enrollSearch ? "No students found." : "Start typing to search students."}
                </p>
              ) : (
                enrollResults.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-background">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        {s.in_batch && (
                          <Badge variant="secondary" className="text-xs h-4 px-1.5">In this batch</Badge>
                        )}
                        {s.batch_id && !s.in_batch && (
                          <Badge variant="outline" className="text-xs h-4 px-1.5 text-amber-700 border-amber-300 bg-amber-50">
                            In: {s.current_batch_name ?? "Another batch"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={s.in_batch ? "destructive" : "default"}
                      disabled={enrollingId === s.id}
                      onClick={() => toggleEnroll(s)}
                      className="gap-1.5 shrink-0"
                    >
                      {enrollingId === s.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : s.in_batch ? (
                        <><UserMinus className="h-3.5 w-3.5" /> Remove</>
                      ) : (
                        <><UserPlus className="h-3.5 w-3.5" /> Add</>
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              <StudentTable
                students={filteredStudents}
                batchId={id as string}
                token={token}
                tenant={tenantSlug ?? undefined}
                onRemoved={(sid) => setData((d) => d ? { ...d, students: d.students.filter((s) => s.id !== sid), metrics: { ...d.metrics, total_students: d.metrics.total_students - 1, at_risk: d.students.filter(s => s.id !== sid && s.status === 'at-risk').length } } : d)}
              />
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
                <StudentTable
                  students={atRisk}
                  batchId={id as string}
                  token={token}
                  tenant={tenantSlug ?? undefined}
                  onRemoved={(sid) => setData((d) => d ? { ...d, students: d.students.filter((s) => s.id !== sid) } : d)}
                />
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
                <StudentTable
                  students={outstanding}
                  batchId={id as string}
                  token={token}
                  tenant={tenantSlug ?? undefined}
                  onRemoved={(sid) => setData((d) => d ? { ...d, students: d.students.filter((s) => s.id !== sid) } : d)}
                />
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
                    <TableHead className="font-semibold text-xs uppercase tracking-wide">Assign</TableHead>
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
                        <TableCell>
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
function StudentTable({
  students,
  batchId,
  token,
  tenant,
  onRemoved,
}: {
  students: Student[];
  batchId: string;
  token: string | null;
  tenant: string | undefined;
  onRemoved?: (id: string) => void;
}) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const initials = (name: string) =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  const scoreColor = (score: number) =>
    score >= 75 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-500";

  const barColor = (score: number) =>
    score >= 75 ? "bg-emerald-500" : score >= 40 ? "bg-amber-400" : "bg-red-400";

  const statusConfig: Record<string, { label: string; class: string }> = {
    "outstanding": { label: "Outstanding ⭐", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    "active":      { label: "Active",          class: "bg-blue-50 text-blue-700 border-blue-200" },
    "at-risk":     { label: "At Risk ⚠️",      class: "bg-red-50 text-red-700 border-red-200" },
  };

  const handleRemove = async (s: Student) => {
    if (!confirm(`Remove ${s.name} from this batch?`)) return;
    setRemovingId(s.id);
    try {
      await api(`/teacher/batches/${batchId}/students/${s.id}`, {
        method: "DELETE", token: token ?? undefined, tenant,
      });
      onRemoved?.(s.id);
    } catch { /* ignore */ } finally {
      setRemovingId(null);
    }
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
        <Users className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm">No students to show.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {students.map((s) => {
        const cfg = statusConfig[s.status] ?? statusConfig["active"];
        return (
          <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{initials(s.name)}</span>
            </div>

            {/* Name + email + status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm text-foreground">{s.name}</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.class}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{s.email}</p>
            </div>

            {/* Score */}
            <div className="flex flex-col items-end gap-1 shrink-0 w-28">
              <span className={`text-sm font-bold tabular-nums ${scoreColor(s.avg_score)}`}>
                {s.avg_score}%
              </span>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor(s.avg_score)}`}
                  style={{ width: `${s.avg_score}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">Avg Score</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8"
                onClick={() => { window.location.href = `/teacher/results?student=${s.id}`; }}
              >
                <FileText className="h-3 w-3" /> Results
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                disabled={removingId === s.id}
                onClick={() => handleRemove(s)}
              >
                {removingId === s.id
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <MinusCircle className="h-3 w-3" />}
                Remove
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
