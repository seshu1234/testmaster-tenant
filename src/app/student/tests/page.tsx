"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface Test {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  start_at: string | null;
  end_at: string | null;
  status: 'active' | 'upcoming' | 'expired';
  subject?: string;
}

export default function StudentTestsPage() {
  const { user, token } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      if (!user || !token) return;
      try {
        const response = await api("/v1/student/tests", {
          token,
          tenant: user.tenant_id
        });
        setTests(response.data || []);
      } catch (error) {
        console.error("Failed to fetch tests:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTests();
  }, [user, token]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">Live Now</Badge>;
      case 'upcoming': return <Badge variant="outline" className="text-amber-600 border-amber-500/20 bg-amber-500/5">Upcoming</Badge>;
      default: return <Badge variant="secondary">Expired</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse italic">Synchronizing your assessments...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Available Assessments</h1>
        <p className="text-muted-foreground italic">Good luck with your exams!</p>
      </div>

      {tests.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-20 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-zinc-400" />
          </div>
          <p className="text-muted-foreground font-medium">No tests are currently assigned to you.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id} className="group overflow-hidden border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 hover:shadow-xl hover:translate-y--1 transition-all duration-300">
              <div className="h-2 bg-gradient-to-r from-primary/40 to-primary/10" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary/60">{test.subject || "General"}</span>
                  {getStatusBadge(test.status)}
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{test.title}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px] italic">{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{Math.round(test.duration_seconds / 60)} Mins</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{test.start_at ? new Date(test.start_at).toLocaleDateString() : "Anytime"}</span>
                   </div>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/20 pt-4">
                <Link href={`/student/tests/${test.id}`} className="w-full">
                  <Button className="w-full h-11 rounded-xl shadow-[0_4px_10px_rgba(var(--primary),0.2)] hover:shadow-primary/30 transition-all font-semibold">
                    Review Instructions
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
