"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TestDetails {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  settings?: Record<string, unknown>;
}

export default function TestInstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [test, setTest] = useState<TestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestDetails() {
      try {
        const response = await api(`/student/tests/${testId}`);
        setTest(response.data);
      } catch (err: unknown) {
        console.error("Failed to fetch test details:", err);
        // Fallback for demonstration
        setTest({
          id: testId,
          title: "Mock Test: Advanced Algebra",
          description: "This test evaluates your knowledge on advanced algebra topics including polynomials, rational functions, and complex numbers.",
          duration_seconds: 3600,
        });
      } finally {
         setIsLoading(false);
      }
    }

    if (testId) {
      fetchTestDetails();
    }
  }, [testId]);

  const handleStartTest = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');
      const rootDomain = isLocal ? 'localhost' : 'testmaster.in';
      const tenant = hostname && hostname.split('.')[0] !== rootDomain ? hostname.split('.')[0] : undefined;

      const response = await api(`/student/tests/${testId}/start`, {
        method: "POST",
        token: token || undefined,
        tenant: tenant
      });
      
      router.push(`/student/tests/${testId}/take?attempt=${response.data.attempt_id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start the test.";
      setError(message);
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent dark:border-zinc-50" />
      </div>
    );
  }

  if (!test) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Test not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{test.title}</CardTitle>
          <CardDescription>{test.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-medium p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <Clock className="h-5 w-5 text-zinc-500" />
            <span>Duration: {Math.round(test.duration_seconds / 60)} minutes</span>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Info className="h-5 w-5" />
              Instructions
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm flex flex-col">
              <li>Read each question carefully before submitting your answer.</li>
              <li>You can navigate between questions using the previous and next buttons.</li>
              <li>You can flag questions to review them later before submitting.</li>
              <li>Once the timer runs out, the test will be automatically submitted.</li>
              <li>Ensure you have a stable internet connection.</li>
            </ul>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleStartTest} disabled={isStarting}>
            {isStarting ? "Starting..." : "Start Test"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
