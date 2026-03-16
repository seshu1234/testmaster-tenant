"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, ArrowRight, BookOpen, CheckCircle, Timer } from "lucide-react";

interface StudentTest {
  id: string;
  title: string;
  test_type: string;
  test_pattern: string;
  start_at: string;
  end_at: string;
  duration_seconds: number;
  status: "active" | "upcoming" | "expired" | "completed";
}

const patternLabel: Record<string, string> = {
  nta: "NTA", tcs: "TCS iON", ssc: "SSC", custom: "Standard",
};

function fmtDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function TestCard({ test }: { test: StudentTest }) {
  const isLive = test.status === "active";
  const isUpcoming = test.status === "upcoming";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base leading-tight">{test.title}</CardTitle>
            <CardDescription className="flex items-center gap-3">
              {test.test_pattern && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {patternLabel[test.test_pattern] ?? test.test_pattern}
                </span>
              )}
              {test.duration_seconds > 0 && (
                <span className="flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  {fmtDuration(test.duration_seconds)}
                </span>
              )}
            </CardDescription>
          </div>
          <Badge variant={isLive ? "default" : isUpcoming ? "secondary" : "outline"}>
            {isLive ? "Live" : isUpcoming ? "Upcoming" : test.test_type || "Test"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {test.start_at ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {isUpcoming ? "Starts" : "Started"} {new Date(test.start_at).toLocaleString()}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Available now</p>
        )}
        <Link href={`/student/tests/${test.id}/lobby`}>
          <Button size="sm" variant={isLive ? "default" : "outline"} className="gap-1.5">
            {isLive ? "Enter Lobby" : "View"} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function StudentTestsPage() {
  const { token, tenantSlug } = useAuth();
  const [tests, setTests] = useState<StudentTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTests() {
      if (!token) return;
      try {
        const res = await api("/student/tests", {
          token,
          tenant: tenantSlug || undefined,
        });
        if (res.success) setTests(res.data ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, [token, tenantSlug]);

  const filtered = tests.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );
  const live = filtered.filter((t) => t.status === "active");
  const upcoming = filtered.filter((t) => t.status === "upcoming");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Tests</h1>
          <p className="text-sm text-muted-foreground">
            Tests assigned to your batch, ready to take.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <Tabs defaultValue="live">
          <TabsList>
            <TabsTrigger value="live" className="gap-1.5">
              Live ({live.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="grid gap-3 mt-4">
            {live.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No live tests right now. Check back soon.
                </CardContent>
              </Card>
            ) : (
              live.map((t) => <TestCard key={t.id} test={t} />)
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="grid gap-3 mt-4">
            {upcoming.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                  No upcoming tests scheduled.
                </CardContent>
              </Card>
            ) : (
              upcoming.map((t) => <TestCard key={t.id} test={t} />)
            )}
          </TabsContent>

          <TabsContent value="all" className="grid gap-3 mt-4">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {search ? "No tests match your search." : "No tests assigned to your batch yet."}
                </CardContent>
              </Card>
            ) : (
              filtered.map((t) => <TestCard key={t.id} test={t} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
