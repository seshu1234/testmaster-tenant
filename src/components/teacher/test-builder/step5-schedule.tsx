"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface Batch {
  id: string;
  name: string;
  subject: string;
}

interface TestData {
  start_at?: string;
  end_at?: string;
  batches?: Batch[];
}

interface Step5Props {
  data: TestData;
  onChange: (updates: Partial<TestData> & { batch_ids?: string[] }) => void;
}

export function Step5Schedule({ data, onChange }: Step5Props) {
  const { user, token } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatches, setSelectedBatches] = useState<string[]>(data.batches?.map((b: Batch) => b.id) || []);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/teacher/batches`, {
          token,
          tenant: user.tenant_id,
        });
        if (response.success) {
          setBatches(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [user, token]);

  const toggleBatch = (batchId: string) => {
    const newSelection = selectedBatches.includes(batchId)
      ? selectedBatches.filter(id => id !== batchId)
      : [...selectedBatches, batchId];
    
    setSelectedBatches(newSelection);
    onChange({ batch_ids: newSelection });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-2 text-sm">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            Start Date & Time
          </Label>
          <Input 
            type="datetime-local" 
            value={data.start_at ? new Date(data.start_at).toISOString().slice(0, 16) : ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ start_at: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            End Date & Time
          </Label>
          <Input 
            type="datetime-local" 
            value={data.end_at ? new Date(data.end_at).toISOString().slice(0, 16) : ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ end_at: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Assign to Batches
          </Label>
          <Badge variant="outline">{selectedBatches.length} Batches Selected</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {loading ? (
            <div className="col-span-full p-4 text-center italic text-muted-foreground">Loading batches...</div>
          ) : batches.length === 0 ? (
            <div className="col-span-full p-4 text-center text-muted-foreground">No batches found.</div>
          ) : (
            batches.map((batch) => (
              <div 
                key={batch.id}
                onClick={() => toggleBatch(batch.id)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedBatches.includes(batch.id)
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                }`}
              >
                <div className="space-y-1">
                  <p className="font-medium">{batch.name}</p>
                  <p className="text-xs text-muted-foreground">{batch.subject}</p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedBatches.includes(batch.id) ? "bg-primary border-primary" : "border-zinc-300 dark:border-zinc-700"
                }`}>
                  {selectedBatches.includes(batch.id) && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
