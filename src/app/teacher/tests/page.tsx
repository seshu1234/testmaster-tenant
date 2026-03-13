"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface Test {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  status: string;
  created_at: string;
}

export default function TeacherTestsPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTests() {
      if (!token) return;
      try {
         const response = await api("/v1/teacher/tests", {
            token,
            tenant: user?.tenant_id || undefined
         });
         setTests(response.data);
      } catch (err: unknown) {
         setError(err instanceof Error ? err.message : "Failed to load tests.");
      } finally {
         setLoading(false);
      }
    }
    fetchTests();
  }, [token, user]);

  const handleCreateTest = async () => {
     try {
         const response = await api("/v1/teacher/tests", {
             method: "POST",
             token: token || undefined,
             tenant: user?.tenant_id || undefined,
             body: JSON.stringify({
                 title: "New Custom Assessment",
                 description: "Enter a brief overview of this test...",
                 duration_seconds: 3600,
                 settings: {}
             })
         });
         
         if (response.success) {
           router.push(`/teacher/tests/${response.data.id}/build`);
         }
     } catch(err) {
         console.error(err);
         setError("Failed to create test. Please try again.");
     }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading tests...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Tests</h1>
            <p className="text-muted-foreground">Create and publish assessments for your students.</p>
          </div>
          <Button onClick={handleCreateTest}>
             <Plus className="mr-2 h-4 w-4" /> Create Test
          </Button>
       </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map(test => (
             <Card key={test.id} className="flex flex-col border shadow-sm">
                <CardHeader>
                   <div className="flex justify-between items-start">
                     <CardTitle className="line-clamp-1">{test.title}</CardTitle>
                     <span className={`text-xs px-2 py-1 rounded-full ${test.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {test.status}
                     </span>
                   </div>
                   <CardDescription className="line-clamp-2 mt-2">{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                   <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><Clock className="h-4 w-4"/> {test.duration_seconds / 60} mins</div>
                      <div className="flex items-center gap-2"><Activity className="h-4 w-4"/> Created {new Date(test.created_at).toLocaleDateString()}</div>
                   </div>
                </CardContent>
             </Card>
          ))}
          {tests.length === 0 && (
              <div className="col-span-full p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                  No tests created yet. Click the button above to start!
              </div>
          )}
       </div>
    </div>
  );
}
