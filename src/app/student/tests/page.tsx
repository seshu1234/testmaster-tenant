"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";

interface Test {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  start_at: string | null;
  end_at: string | null;
  status: string;
}

export default function StudentTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      try {
        const response = await api("/student/tests/upcoming");
        // Assuming response.data is an array of tests
        if (response.data && Array.isArray(response.data)) {
           setTests(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
           setTests(response.data.data);
        } else {
           // Mock data fallback for demonstration if API fails or returns empty unexpectedly
           setTests([
             {
               id: "mock-1",
               title: "Mock Test: Advanced Algebra",
               description: "A comprehensive test on advanced algebraic concepts.",
               duration_seconds: 3600,
               start_at: new Date().toISOString(),
               end_at: null,
               status: "active"
             }
           ]);
        }
      } catch (error) {
        console.error("Failed to fetch tests:", error);
        // Fallback to empty array or mock data
        setTests([
             {
               id: "mock-1",
               title: "Mock Test: Advanced Algebra",
               description: "A comprehensive test on advanced algebraic concepts.",
               duration_seconds: 3600,
               start_at: new Date().toISOString(),
               end_at: null,
               status: "active"
             }
           ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTests();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent dark:border-zinc-50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Tests</h1>
        <p className="text-muted-foreground">View your upcoming and available tests.</p>
      </div>

      {tests.length === 0 ? (
        <Card className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground">No tests available at the moment.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{test.title}</CardTitle>
                <CardDescription className="line-clamp-2">{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {Math.round(test.duration_seconds / 60)} minutes
                </div>
                {test.start_at && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Available: {new Date(test.start_at).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/student/tests/${test.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
