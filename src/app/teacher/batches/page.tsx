"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, Search, GraduationCap, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import Link from "next/link";

interface Batch {
  id: string;
  name: string;
  students_count: number;
  subject: string;
}

export default function TeacherBatchesPage() {
  const { user, token, tenantSlug } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      if (!user || !token) return;
      try {
        const response = await api("/teacher/batches", {
          token,
          tenant: tenantSlug || undefined,
        });
        if (response.success) {
          setBatches(response.data || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [user, token, tenantSlug]);

  const filtered = batches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          <p className="text-sm text-muted-foreground">
            Manage students and monitor progress across your assigned batches.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search batches..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 border-2 border-dashed rounded-lg text-muted-foreground">
          <GraduationCap className="h-10 w-10" />
          <p className="font-medium">
            {search ? "No batches match your search." : "No batches assigned yet."}
          </p>
          {!search && (
            <p className="text-sm">Contact your coordinator to assign classes.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((batch) => (
            <Card key={batch.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {batch.name}
                  <Badge variant="secondary">Active</Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {batch.subject || "Multi-Subject"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{batch.students_count ?? 0} Students</span>
                </div>
                <Link href={`/teacher/batches/${batch.id}`}>
                  <Button className="w-full gap-2" variant="outline">
                    View Details <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
