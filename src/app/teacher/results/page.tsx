"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { Users, Award, Brain, ChevronLeft, FileText, TrendingUp } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface GeneralAnalytics {
  overall_avg: string;
  score_change?: string;
  active_students: string | number;
  participation_rate?: string;
  subject_performance: Array<{ name: string; avg: number }>;
  trends: Array<{ month: string; score: number }>;
  ai_analysis: {
    critical: Array<{ title: string; description: string }>;
    optimal: Array<{ title: string; description: string }>;
  };
}

interface StudentResult {
  id: string;
  test_title: string;
  test_type: string | null;
  score: number;
  total_marks: number;
  percentage: number;
  taken_at: string;
}

interface StudentProfile {
  student: { id: string; name: string; email: string };
  avg_score: number;
  tests_taken: number;
  results: StudentResult[];
}

// ─── Score colour helpers ───────────────────────────────────────────────────
const pct = (p: number) => (p >= 75 ? "text-emerald-600" : p >= 40 ? "text-amber-600" : "text-red-500");
const bar = (p: number) => (p >= 75 ? "bg-emerald-500" : p >= 40 ? "bg-amber-400" : "bg-red-400");

// ─── Student Results View ──────────────────────────────────────────────────
function StudentView({ studentId }: { studentId: string }) {
  const { token, tenantSlug } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlName  = decodeURIComponent(searchParams.get("name")  ?? "");
  const urlEmail = decodeURIComponent(searchParams.get("email") ?? "");

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !studentId) return;
    api(`/teacher/students/${studentId}/profile`, {
      token,
      tenant: tenantSlug ?? undefined,
    }).then((res) => {
      if (res.success) setProfile(res.data);
    }).finally(() => setLoading(false));
  }, [token, tenantSlug, studentId]);

  const displayName  = profile?.student.name  ?? urlName  ?? "Student";
  const displayEmail = profile?.student.email ?? urlEmail ?? "";
  const initials = (name: string) =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  const headerJSX = (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary">{initials(displayName)}</span>
      </div>
      <div>
        <h1 className="text-xl font-bold">{displayName}</h1>
        {displayEmail && <p className="text-sm text-muted-foreground">{displayEmail}</p>}
      </div>
    </div>
  );

  if (loading) return (
    <div className="space-y-6">
      {headerJSX}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );

  if (!profile) return (
    <div className="space-y-6">
      {headerJSX}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Avg Score",   icon: <Award className="h-3.5 w-3.5" /> },
          { label: "Tests Taken", icon: <FileText className="h-3.5 w-3.5" /> },
          { label: "Best Score",  icon: <TrendingUp className="h-3.5 w-3.5" /> },
        ].map(({ label, icon }) => (
          <Card key={label} className="opacity-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                {icon} {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-muted-foreground/40">—</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="opacity-50">
        <CardContent className="py-24 text-center text-sm text-muted-foreground">
          No test history available for this student yet.
        </CardContent>
      </Card>
    </div>
  );

  const barData = profile.results.map((r) => ({
    name: r.test_title.length > 20 ? r.test_title.slice(0, 18) + "…" : r.test_title,
    score: r.percentage,
  })).reverse();

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{initials(profile.student.name)}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.student.name}</h1>
            <p className="text-sm text-muted-foreground">{profile.student.email}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" /> Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${pct(profile.avg_score)}`}>{profile.avg_score}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Tests Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{profile.tests_taken}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Best Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">
              {profile.results.length > 0 ? `${Math.max(...profile.results.map((r) => r.percentage))}%` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score chart */}
      {barData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score by Test</CardTitle>
            <CardDescription>Latest 20 tests, oldest to newest</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={28}
                    fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {profile.results.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No tests taken yet.</p>
          ) : (
            <div className="divide-y">
              {profile.results.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{r.test_title}</p>
                    <p className="text-xs text-muted-foreground">{r.taken_at ?? "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 w-32 shrink-0">
                    <span className={`text-sm font-bold tabular-nums ${pct(r.percentage)}`}>
                      {r.percentage}%
                    </span>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bar(r.percentage)}`}
                        style={{ width: `${r.percentage}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {r.score} / {r.total_marks}
                    </span>
                  </div>
                  {r.test_type && (
                    <Badge variant="outline" className="text-[10px] shrink-0">{r.test_type}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── General Analytics View ────────────────────────────────────────────────
function GeneralView() {
  const { user, token, tenantSlug } = useAuth();
  const [data, setData] = useState<GeneralAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;
    api("/teacher/analytics", { token, tenant: tenantSlug || undefined })
      .then((res) => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, [user, token, tenantSlug]);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>;
  if (!data) return (
    <div className="py-24 text-center text-muted-foreground">
      <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
      <p>No analytics available yet.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-sm text-muted-foreground">Monitor student progress across all batches.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" /> Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.overall_avg || "0%"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Active Students
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.active_students || "0"}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Average</CardTitle>
            <CardDescription>Performance by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {data.subject_performance?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.subject_performance}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Trends</CardTitle>
            <CardDescription>Overall performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {data.trends?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {data.ai_analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-muted-foreground" />
              <CardTitle>AI Insights</CardTitle>
            </div>
            <CardDescription>Based on student response patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {data.ai_analysis.critical?.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-red-100 bg-red-50/30">
                  <h4 className="font-semibold text-sm">🚩 {item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
              {data.ai_analysis.optimal?.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                  <h4 className="font-semibold text-sm">✅ {item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function TeacherResultsPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("student");

  return (
    <div className="p-6">
      {studentId ? <StudentView studentId={studentId} /> : <GeneralView />}
    </div>
  );
}
