"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BookOpen,
  CheckCircle2,
  Trophy,
  BrainCircuit,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Ward {
  id: string;
  name: string;
  email: string;
}

interface WardOverview {
  student: { id: string; name: string };
  overview: {
    average_score_percentage: number;
    tests_completed: number;
  };
  recent_results: {
    id: string;
    test: { id: string; title: string };
    percentage: number;
    created_at: string;
  }[];
  ai_prediction: {
    predicted_percentile: number;
    insight_summary: string;
    generated_at: string;
  } | null;
}

export default function ParentDashboard() {
  const { token, tenantSlug } = useAuth();
  const [wards, setWards] = useState<Ward[]>([]);
  const [activeWardId, setActiveWardId] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<WardOverview | null>(null);

  const [loadingWards, setLoadingWards] = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch wards on mount
  useEffect(() => {
    async function fetchWards() {
      if (!token) return;
      try {
        const response = await api("/parent/wards", {
          token,
          tenant: tenantSlug || undefined,
        });
        const fetchedWards = response.data;
        setWards(fetchedWards);

        if (fetchedWards.length > 0) {
          setActiveWardId(fetchedWards[0].id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load wards.");
      } finally {
        setLoadingWards(false);
      }
    }
    fetchWards();
  }, [token, tenantSlug]);

  // 2. Fetch specific ward overview when activeWardId changes
  useEffect(() => {
    async function fetchOverview() {
      if (!token || !activeWardId) return;
      setLoadingOverview(true);
      setError(null);
      try {
        const response = await api(`/parent/wards/${activeWardId}/overview`, {
          token,
          tenant: tenantSlug || undefined,
        });
        setOverviewData(response.data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load overview.",
        );
      } finally {
        setLoadingOverview(false);
      }
    }
    fetchOverview();
  }, [token, tenantSlug, activeWardId]);

  if (loadingWards)
    return (
      <div className="p-8 text-center animate-pulse">
        Loading Guardian Portal...
      </div>
    );
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  if (wards.length === 0) {
    return (
      <Card className="flex h-48 items-center justify-center m-8">
        <div className="text-center text-muted-foreground">
          <BookOpen className="mx-auto h-8 w-8 mb-4 opacity-50" />
          <p>No students are currently linked to your account.</p>
          <p className="text-sm">
            Please contact the administration to link your ward.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guardian Portal</h1>
          <p className="text-muted-foreground">
            Monitor academic progress and insights.
          </p>
        </div>

        {wards.length > 1 && (
          <div className="w-full md:w-64">
            <Select value={activeWardId!} onValueChange={setActiveWardId}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {wards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.id}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {loadingOverview ? (
        <div className="h-64 flex items-center justify-center animate-pulse">
          Loading overview...
        </div>
      ) : overviewData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overviewData.overview.average_score_percentage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all subjects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tests Completed
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overviewData.overview.tests_completed}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total attempts recorded
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-indigo-100 dark:border-indigo-900/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-col">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    AI Prediction{" "}
                    <BrainCircuit className="h-4 w-4 text-indigo-500" />
                  </CardTitle>
                  {overviewData.ai_prediction && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Generated{" "}
                      {new Date(
                        overviewData.ai_prediction.generated_at,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {overviewData.ai_prediction && (
                  <Badge
                    variant="outline"
                    className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-none"
                  >
                    Top {100 - overviewData.ai_prediction.predicted_percentile}%
                    Percentile Tracking
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium mt-2 leading-relaxed">
                  {overviewData.ai_prediction ? (
                    overviewData.ai_prediction.insight_summary
                  ) : (
                    <span className="text-muted-foreground italic">
                      AI is still analyzing early performance data. More tests
                      are required for a projection.
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Assessments</CardTitle>
                <CardDescription>
                  The last 5 tests {overviewData.student.name} has completed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overviewData.recent_results.length > 0 ? (
                  <div className="space-y-4">
                    {overviewData.recent_results.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-background rounded-md shadow-sm border">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {result.test.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Taken on{" "}
                              {new Date(result.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {Math.round(result.percentage)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                    No recent test results found.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
