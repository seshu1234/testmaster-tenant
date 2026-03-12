"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, HelpCircle, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

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

interface SectionQuestion {
  question_id: string;
  title: string;
  order: number;
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
  const [assignedQuestions, setAssignedQuestions] = useState<SectionQuestion[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  const fetchBank = useCallback(async () => {
    if (!user || !token) return;
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      
      const response = await api(`/v1/teacher/questions?${queryParams.toString()}`, {
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
  }, [user, token, search]);

  const fetchAssigned = useCallback(async () => {
    if (!user || !token || !testId || !activeSectionId) return;
    try {
      const response = await api(`/v1/teacher/tests/${testId}/sections/${activeSectionId}/questions`, {
        token,
        tenant: user.tenant_id,
      });
      if (response.success) {
        setAssignedQuestions(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch assigned questions:", error);
    }
  }, [user, token, testId, activeSectionId]);

  useEffect(() => {
    const timer = setTimeout(fetchBank, 300);
    return () => clearTimeout(timer);
  }, [fetchBank]);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  const reorder = async (questionId: string, direction: 'up' | 'down') => {
    if (!user || !token || !activeSectionId) return;
    const index = assignedQuestions.findIndex(q => q.question_id === questionId);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === assignedQuestions.length - 1) return;

    const newAssigned = [...assignedQuestions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newAssigned[index], newAssigned[swapIndex]] = [newAssigned[swapIndex], newAssigned[index]];
    
    setAssignedQuestions(newAssigned);
  };

  const assignToSection = async (question: Partial<Question>) => {
    if (!user || !token || !activeSectionId) return;
    const isAssigned = assignedQuestions.some(q => q.question_id === question.id);
    
    try {
      if (isAssigned) {
        await api(`/v1/teacher/tests/${testId}/sections/${activeSectionId}/questions/${question.id}`, {
          method: "DELETE",
          token,
          tenant: user.tenant_id,
        });
        setAssignedQuestions(prev => prev.filter(q => q.question_id !== question.id));
      } else {
        await api(`/v1/teacher/tests/${testId}/questions`, {
          method: "POST",
          token,
          tenant: user.tenant_id,
          body: JSON.stringify({
            question_id: question.id,
            section_id: activeSectionId,
            marks: question.marks || 1,
            order: assignedQuestions.length,
          }),
        });
        setAssignedQuestions(prev => [...prev, { question_id: question.id!, title: question.title!, order: prev.length }]);
      }
    } catch (error) {
      console.error("Failed to update section questions:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-500">
      <div className="md:col-span-2 space-y-4">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sections</Label>
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${
                activeSectionId === section.id 
                  ? "bg-primary text-white shadow-md font-bold" 
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input 
            placeholder="Search bank..." 
            className="w-full pl-9 h-10 rounded-lg border-none bg-zinc-100/50 dark:bg-zinc-900/50 text-sm focus:ring-1 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="border rounded-xl bg-white dark:bg-transparent overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto divide-y">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse italic text-sm">Loading bank...</div>
            ) : bankQuestions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Bank is empty.</div>
            ) : (
              bankQuestions.map((q: Question) => {
                const isAssigned = assignedQuestions.some(aq => aq.question_id === q.id);
                return (
                  <div key={q.id} className="p-4 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium line-clamp-1">{q.title || "Untitled Question"}</p>
                      <div className="flex items-center gap-2">
                         <Badge variant="outline" className="text-[9px] h-3.5 px-1">{q.type}</Badge>
                         <span className="text-[10px] text-muted-foreground">{q.subject} • {q.topic}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={isAssigned ? "secondary" : "ghost"} 
                      className={cn("h-8 w-8 p-0 rounded-full", isAssigned ? "text-destructive" : "text-primary opacity-0 group-hover:opacity-100 transition-opacity")}
                      onClick={() => assignToSection(q)}
                      disabled={!activeSectionId}
                    >
                      {isAssigned ? <Trash2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-4 space-y-4">
         <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assigned ({assignedQuestions.length})</Label>
         <div className="border rounded-xl bg-zinc-50 dark:bg-zinc-900/50 min-h-[400px] p-2 space-y-2">
            {assignedQuestions.map((q, idx) => (
              <div key={q.question_id} className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 shadow-sm group">
                 <div className="text-[10px] font-bold text-zinc-400 w-4">{idx + 1}.</div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{q.title || "Untitled"}</p>
                 </div>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => reorder(q.question_id, 'up')}
                        disabled={idx === 0}
                    >
                       <Plus className="h-3 w-3 rotate-180" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => reorder(q.question_id, 'down')}
                        disabled={idx === assignedQuestions.length - 1}
                    >
                       <Plus className="h-3 w-3" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive"
                        onClick={() => assignToSection({ id: q.question_id, title: q.title })}
                    >
                       <Trash2 className="h-3 w-3" />
                    </Button>
                 </div>
              </div>
            ))}
            {assignedQuestions.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                 <p className="text-[10px] text-muted-foreground italic">No questions assigned yet.</p>
              </div>
            )}
         </div>
      </div>

      <div className="md:col-span-12">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-3">
          <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
          <p className="text-xs text-primary/80">
            Selected questions will be added to the highlighted section. Use arrows to reorder.
          </p>
        </div>
      </div>
    </div>
  );
}
