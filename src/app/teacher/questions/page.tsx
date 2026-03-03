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
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Copy, Sparkles } from "lucide-react";
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
import { FileSpreadsheet } from "lucide-react";

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
  const [importOpen, setImportOpen] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/v1/teacher/questions`, {
          token,
          tenant: user.tenant_id,
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

    fetchQuestions();
  }, [user, token]);

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
          <Button variant="outline" size="icon" className="md:h-10 md:w-10">
            <Filter className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="px-2 py-1">Mathematics</Badge>
          <Badge variant="outline" className="px-2 py-1">Physics</Badge>
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
                          onClick={async () => {
                            if (!token || !user) return;
                            try {
                                const response = await api(`/v1/teacher/ai/generate-explanation/${q.id}`, {
                                    method: "POST",
                                    token,
                                    tenant: user.tenant_id
                                });
                                if (response.success) {
                                    alert("AI Explanation generated and saved to this question!");
                                }
                            } catch (error) {
                                console.error("AI Explanation failed:", error);
                            }
                          }}
                        >
                          <Sparkles className="h-4 w-4" /> AI Explain
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit2 className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Copy className="h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
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
