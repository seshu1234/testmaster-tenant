"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface Section {
  id: string;
  name: string;
  order: number;
  time_limit: number | null;
}

interface Step3Props {
  testId: string;
  onUpdate: () => void;
}

export function Step3Sections({ testId, onUpdate }: Step3Props) {
  const { user, token } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = useCallback(async () => {
    if (!user || !token || !testId) return;
    try {
      const response = await api(`/teacher/tests/${testId}`, {
        token,
        tenant: user.tenant_id,
      });
      if (response.success) {
        setSections(response.data.sections || []);
      }
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    } finally {
      setLoading(false);
    }
  }, [testId, user, token]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const addSection = async () => {
    if (!user || !token || !testId) return;
    try {
      const response = await api(`/teacher/tests/${testId}/sections`, {
        method: "POST",
        token,
        tenant: user.tenant_id,
        body: JSON.stringify({
          name: `Section ${sections.length + 1}`,
          order: sections.length,
        }),
      });
      if (response.success) {
        setSections([...sections, response.data]);
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to add section:", error);
    }
  };

  const removeSection = async (sectionId: string) => {
    if (!user || !token || !testId) return;
    try {
      const response = await api(`/teacher/tests/${testId}/sections/${sectionId}`, {
        method: "DELETE",
        token,
        tenant: user.tenant_id,
      });
      if (response.success) {
        setSections(sections.filter(s => s.id !== sectionId));
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to remove section:", error);
    }
  };

  const updateSection = async (sectionId: string, updates: Partial<Section>) => {
    if (!user || !token || !testId) return;
    try {
        await api(`/teacher/tests/${testId}/sections/${sectionId}`, {
            method: "PUT",
            token,
            tenant: user.tenant_id,
            body: JSON.stringify(updates),
        });
        setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
    } catch (error) {
        console.error("Failed to update section:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base font-semibold">Test Sections</Label>
          <p className="text-sm text-muted-foreground">Divide your test into logical parts (e.g. Physics, Chemistry, Maths).</p>
        </div>
        <Button size="sm" onClick={addSection} className="gap-2">
          <Plus className="h-4 w-4" /> Add Section
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground italic">Syncing sections...</div>
        ) : sections.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground">
            No sections defined yet. Every test needs at least one section.
          </div>
        ) : (
          sections.map((section) => (
            <div 
                key={section.id} 
                className="group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-900/50 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-3 flex-1 w-full">
                <GripVertical className="h-5 w-5 text-zinc-400 cursor-grab" />
                <div className="space-y-1 flex-1">
                   <Input 
                      className="h-9 font-medium bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/20 p-0 shadow-none text-base"
                      value={section.name}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => updateSection(section.id, { name: e.target.value })}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSections(sections.map(s => s.id === section.id ? { ...s, name: e.target.value } : s))}
                   />
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex flex-col gap-1.5 min-w-[120px]">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Timer (mins)</Label>
                  <Input 
                    type="number"
                    placeholder="Unlimited"
                    className="h-8 w-24"
                    value={section.time_limit || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSections(sections.map(s => s.id === section.id ? { ...s, time_limit: parseInt(e.target.value) || null } : s))}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => updateSection(section.id, { time_limit: parseInt(e.target.value) || null })}
                  />
                </div>
                
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mt-4 text-zinc-400 hover:text-destructive transition-colors"
                    onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
