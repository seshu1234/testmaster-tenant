"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface Section {
  id: string;
  name: string;
}

interface Question {
  id: string;
  title: string;
  type: string;
  marks: number;
  subject: string;
  topic: string;
}

interface Step4Props {
  testId: string;
  sections: Section[];
}

export function Step4Questions({ testId, sections }: Step4Props) {
  const { user, token } = useAuth();
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  const fetchBank = useCallback(async () => {
    if (!user || !token) return;
    try {
      const response = await api(`/v1/teacher/questions`, {
        token,
        tenant: user.tenant_id,
      });
      if (response.success) {
        setBankQuestions(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch question bank:", error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchBank();
  }, [fetchBank]);

  const assignToSection = async (question: Question) => {
    if (!user || !token || !activeSectionId) return;
    try {
      await api(`/v1/teacher/tests/${testId}/questions`, {
        method: "POST",
        token,
        tenant: user.tenant_id,
        body: JSON.stringify({
          question_id: question.id,
          section_id: activeSectionId,
          marks: question.marks || 1,
          order: 0,
        }),
      });
    } catch (error) {
      console.error("Failed to assign question:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
      <div className="md:col-span-1 space-y-4">
        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sections</Label>
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                activeSectionId === section.id 
                  ? "bg-primary text-white shadow-md" 
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {section.name}
            </button>
          ))}
          {sections.length === 0 && (
            <p className="text-xs text-muted-foreground italic p-2">No sections created yet. Go back to Step 3.</p>
          )}
        </div>
      </div>

      <div className="md:col-span-3 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search question bank..." 
            className="pl-9 h-10"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        <div className="border rounded-xl bg-white dark:bg-transparent overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto divide-y">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading bank...</div>
            ) : bankQuestions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Bank is empty.</div>
            ) : (
              bankQuestions.map((q: Question) => (
                <div key={q.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium line-clamp-1">{q.title || "Untitled Question"}</p>
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="text-[10px] h-4 px-1">{q.type}</Badge>
                       <span className="text-[10px] text-muted-foreground">{q.subject} • {q.topic}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-primary"
                    onClick={() => assignToSection(q)}
                    disabled={!activeSectionId}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-3">
          <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
          <p className="text-xs text-primary/80">
            Selected questions will be added to the highlighted section.
          </p>
        </div>
      </div>
    </div>
  );
}
