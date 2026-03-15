"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import Link from "next/link";
import { 
  Award, 
  BookOpen, 
  Flame, 
  Target,
  Trophy,
  Calendar as CalendarIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UpcomingTest {
  id: string;
  title: string;
  start_at: string;
}

interface RecentResult {
  title: string;
  score: number;
  percentage: number;
  created_at: string;
}

interface RecentBadge {
  id: string;
  name: string;
  icon?: string;
  earned_at: string;
}

interface StudentDashboardData {
  student: {
    name: string;
    points: number;
    streak: number;
    level: number;
    badges_count: number;
  };
  stats: {
    tests_taken: number;
    avg_score: number;
    rank: number | string;
  };
  upcoming_tests: UpcomingTest[];
  recent_results: RecentResult[];
  recent_badges: RecentBadge[];
  encouragement: string;
  achievements: {
    level: number;
    progress: number;
    points: number;
    title: string;
    next_level_points: number;
    insight: string;
  };
  streak_history?: number[];
}

export default function StudentDashboard() {
  const { user, token, tenantSlug } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) return;
      try {
        const response = await api("/student/dashboard", {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          const raw = response.data;
          const mapped: StudentDashboardData = {
            ...raw,
            achievements: {
              level: raw.student?.level || 1,
              points: raw.student?.points || 0,
              progress: Math.min(100, Math.round(((raw.student?.points || 0) % 1000) / 10)),
              title: raw.student?.level > 5 ? "Elite" : "Aspirant",
              next_level_points: 1000,
              insight: raw.encouragement || "Keep going!"
            },
            streak_history: raw.streak_history || [0, 0, 0, 0, 0, 0, 0]
          };
          setData(mapped);
        }
      } catch (error) {
        console.error("Student dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [token, tenantSlug]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-32 bg-secondary rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const dashboard: StudentDashboardData = data || {
    student: { name: "", points: 0, streak: 0, level: 1, badges_count: 0 },
    stats: { tests_taken: 0, avg_score: 0, rank: 0 },
    upcoming_tests: [],
    recent_results: [],
    recent_badges: [],
    encouragement: "",
    achievements: {
      level: 1,
      progress: 0,
      points: 0,
      title: "Novice",
      next_level_points: 100,
      insight: "Start your first test!"
    },
    streak_history: [0, 0, 0, 0, 0, 0, 0]
  };

  const kpis = [
    { title: "Tests Taken", value: dashboard.stats.tests_taken, icon: BookOpen, color: "text-blue-600" },
    { title: "Avg Score", value: `${dashboard.stats.avg_score}%`, icon: Target, color: "text-emerald-600" },
    { title: "Rank", value: `#${dashboard.stats.rank || "--"}`, icon: Trophy, color: "text-amber-600" },
    { title: "Streak", value: `${dashboard.student.streak} Days`, icon: Flame, color: "text-orange-600" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}
        </h1>
        <p className="text-zinc-600">
          {dashboard.encouragement || "Track your progress and upcoming tests here."}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-zinc-600 font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming Tests */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Tests</CardTitle>
                <CardDescription>Assessments scheduled for you</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/student/tests">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.upcoming_tests.length > 0 ? (
                dashboard.upcoming_tests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{test.title}</p>
                      <p className="text-zinc-600">
                        {new Date(test.start_at).toLocaleDateString()} at{" "}
                        {new Date(test.start_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/student/tests/${test.id}/lobby`}>Enter</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-zinc-600 py-8 text-zinc-600">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tests scheduled at the moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress & Achievements */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Level {dashboard.achievements.level} {dashboard.achievements.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-zinc-600">
                <span>Next Level Progress</span>
                <span className="font-bold">{dashboard.achievements.progress}%</span>
              </div>
              <Progress value={dashboard.achievements.progress} className="h-2" />
              <p className="text-zinc-600">
                {dashboard.achievements.points} / {dashboard.achievements.next_level_points} Points
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-zinc-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{dashboard.achievements.insight}</p>
                  <p className="text-zinc-600">Keep it up!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
