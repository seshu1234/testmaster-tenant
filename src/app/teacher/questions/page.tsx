"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Copy, Sparkles, AlertTriangle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import Link from "next/link";
import { ExcelImportDialog } from "@/components/teacher/excel-import-dialog";
import { AiExplainDialog } from "@/components/teacher/questions/ai-explain-dialog";
import { FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Question {
  id: string;
  type: string;
  subject: string;
  topic: string;
  difficulty: string;
  title: string;
  created_at: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<{id: string, title: string} | null>(null);
  const { user, token, tenantSlug } = useAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user || !token) return;
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        if (subjectFilter) queryParams.append("subject", subjectFilter);
        if (topicFilter) queryParams.append("topic", topicFilter);

        const response = await api(`/teacher/questions?${queryParams.toString()}`, {
          token,
          tenant: tenantSlug || undefined,
        });
        if (response.success) {
          setQuestions(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchQuestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [user, token, tenantSlug, search, subjectFilter, topicFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?") || !token || !user) return;
    try {
      const response = await api(`/teacher/questions/${id}`, {
        method: "DELETE",
        token,
        tenant: tenantSlug || undefined,
      });
      if (response.success) {
        setQuestions(questions.filter(q => q.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete question. Please try again.");
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!token || !user) return;
    try {
      const response = await api(`/teacher/questions/${id}/duplicate`, {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
      });
      if (response.success) {
        // Refresh the list after duplication
        const listResponse = await api(`/teacher/questions`, {
          token,
          tenant: tenantSlug || undefined,
        });
        if (listResponse.success) {
          setQuestions(listResponse.data.data || []);
        }
      }
    } catch (error) {
      console.error("Duplicate failed:", error);
      alert("Failed to duplicate question.");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground">Manage and organize your repository of testing content.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
            <FileSpreadsheet className="h-4 w-4" />
            Import
          </Button>
          <Link href="/teacher/questions/generate">
            <Button variant="outline" className="gap-2 border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
          </Link>
          <Link href="/teacher/questions/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Question
            </Button>
          </Link>
        </div>
      </div>

      <ExcelImportDialog 
        open={importOpen} 
        onOpenChange={setImportOpen}
        onImportSuccess={() => {
            // Refresh list
            window.location.reload();
        }}
      />

      <AiExplainDialog 
        open={explainOpen}
        onOpenChange={setExplainOpen}
        questionId={selectedQuestion?.id || ""}
        questionTitle={selectedQuestion?.title || ""}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="md:col-span-3 border-amber-200 bg-amber-50/30 dark:bg-amber-900/10 border-dashed">
            <CardContent className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                     <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-amber-900 dark:text-amber-100 uppercase tracking-tight">AI Duplicate Radar</p>
                     <p className="text-[10px] text-amber-700/80 dark:text-amber-400">Scan for similar content before publishing new items.</p>
                  </div>
               </div>
               <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest border-amber-200 bg-white">
                  Run Full Scan
               </Button>
            </CardContent>
         </Card>
         <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-900/10 border-dashed">
            <CardContent className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <div className="text-[10px] font-bold uppercase text-purple-900 dark:text-purple-100">AI Credits: 840</div>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search questions by title or topic..." 
            className="pl-9 bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={subjectFilter || topicFilter ? "default" : "outline"} 
            size="icon" 
            className="md:h-10 md:w-10"
            onClick={() => {
              setSubjectFilter(null);
              setTopicFilter(null);
              setSearch("");
            }}
          >
            <Filter className="h-4 w-4" />
          </Button>
          {['Mathematics', 'Physics', 'Chemistry', 'Biology'].map(subject => (
            <Badge 
              key={subject}
              variant={subjectFilter === subject ? "default" : "outline"}
              className="px-2 py-1 cursor-pointer transition-all hover:bg-primary/10"
              onClick={() => setSubjectFilter(subjectFilter === subject ? null : subject)}
            >
              {subject}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Question Title / Content</TableHead>
              <TableHead>Subject / Topic</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading questions...</TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No questions found. Create your first one!</TableCell>
              </TableRow>
            ) : (
              questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium line-clamp-1">{q.title}</div>
                      <div className="text-xs text-muted-foreground">ID: {q.id.split('-')[0]}...</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{q.subject || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">{q.topic || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {q.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(q.difficulty)}>
                      {q.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          className="gap-2 text-purple-600 dark:text-purple-400"
                          onClick={() => {
                            setSelectedQuestion({ id: q.id, title: q.title });
                            setExplainOpen(true);
                          }}
                        >
                          <Sparkles className="h-4 w-4" /> AI Explain
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit2 className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => handleDuplicate(q.id)}
                        >
                          <Copy className="h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive"
                          onClick={() => handleDelete(q.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
