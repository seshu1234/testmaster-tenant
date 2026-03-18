"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Copy, 
  Sparkles, 
  AlertTriangle,
  BookOpen 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { ExcelImportDialog } from "@/components/teacher/excel-import-dialog";
import { AiExplainDialog } from "@/components/teacher/questions/ai-explain-dialog";
import { 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  type: string;
  subject: string;
  topic: string;
  chapter: string;
  difficulty: string;
  title: string;
  content: string | Record<string, unknown> | null;
  content_text: string;
  created_at: string;
}

function extractText(content: Question["content"]): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  const obj = content as Record<string, unknown>;
  return String(obj.text ?? obj.question ?? obj.body ?? obj.stem ?? Object.values(obj).join(" "));
}

export default function QuestionsPage() {
  const { user, token, tenantSlug } = useAuth();
  const [bank, setBank] = useState<"assessment" | "practice">("assessment");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<{id: string, title: string} | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const bankParam = searchParams.get('bank');
    if (bankParam === 'practice' || bankParam === 'assessment') {
      setBank(bankParam as "practice" | "assessment");
    }
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user || !token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        if (subjectFilter) queryParams.append("subject", subjectFilter);
        if (topicFilter) queryParams.append("topic", topicFilter);
        queryParams.append("bank", bank);
        queryParams.append("page", currentPage.toString());
        queryParams.append("per_page", pageSize.toString());

        const response = await api(`/teacher/questions?${queryParams.toString()}`, {
          token,
          tenant: tenantSlug || undefined,
        });
        
        if (response.success && response.data) {
          setQuestions(response.data.data || []);
          setTotalPages(response.data.last_page || 1);
          setTotalItems(response.data.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchQuestions();
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [user, token, tenantSlug, search, subjectFilter, topicFilter, currentPage, pageSize, bank]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, subjectFilter, topicFilter]);

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
      case "easy": return "bg-green-100 text-zinc-600";
      case "medium": return "bg-yellow-100 text-zinc-600";
      case "hard": return "bg-red-100 text-zinc-600";
      default: return "bg-zinc-100 text-zinc-600";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-zinc-600">Manage and organize your repository of testing content.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
            <FileSpreadsheet className="h-4 w-4" />
            Import
          </Button>
          <Link href="/teacher/questions/generate">
            <Button variant="outline" className="gap-2 border-purple-200 bg-purple-50/50 text-zinc-600">
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
            window.location.reload();
        }}
      />

      <AiExplainDialog 
        open={explainOpen}
        onOpenChange={setExplainOpen}
        questionId={selectedQuestion?.id || ""}
        questionTitle={selectedQuestion?.title || ""}
      />

      <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl w-fit">
        <Button 
          variant={bank === 'assessment' ? "default" : "ghost"} 
          size="sm"
          onClick={() => setBank('assessment')}
          className={cn(
            "h-10 px-6 rounded-lg font-bold uppercase tracking-widest text-[10px]",
            bank === 'assessment' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
          )}
        >
          <BookOpen className="h-3 w-3 mr-2" />
          Assessment Bank
        </Button>
        <Button 
          variant={bank === 'practice' ? "default" : "ghost"} 
          size="sm"
          onClick={() => setBank('practice')}
          className={cn(
            "h-10 px-6 rounded-lg font-bold uppercase tracking-widest text-[10px]",
            bank === 'practice' ? "bg-white text-primary shadow-sm" : "text-zinc-500"
          )}
        >
          <Sparkles className="h-3 w-3 mr-2 text-primary" />
          Practice Bank
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="md:col-span-3 border-amber-200 bg-amber-50/30 border-dashed">
            <CardContent className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                     <AlertTriangle className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div>
                     <p className="text-xl font-bold text-zinc-600 uppercase tracking-tight">AI Duplicate Radar</p>
                     <p className="text-[10px] text-zinc-600 opacity-80">Scan for similar content before publishing new items.</p>
                  </div>
               </div>
               <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest border-amber-200 bg-white">
                  Run Full Scan
               </Button>
            </CardContent>
         </Card>
         <Card className="border-purple-200 bg-purple-50/30 border-dashed">
            <CardContent className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-zinc-600" />
                  <div className="text-[10px] font-bold uppercase text-zinc-600">AI Credits: 840</div>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <Input 
            placeholder="Search questions by title or topic..." 
            className="pl-9 bg-white/50 backdrop-blur-sm"
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

      <div className="rounded-xl border bg-white/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 border-y">
              <TableHead className="w-[400px] text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 py-4">Question Title / Content</TableHead>
              <TableHead className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 py-4">Subject / Topic</TableHead>
              <TableHead className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 py-4">Type</TableHead>
              <TableHead className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 py-4">Difficulty</TableHead>
              <TableHead className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="space-y-2">
                       <Skeleton className="h-4 w-[250px]" />
                       <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-zinc-600">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-8 w-8 text-zinc-200" />
                    <p>No questions found matching your criteria.</p>
                    <Button variant="link" size="sm" onClick={() => {
                       setSearch("");
                       setSubjectFilter(null);
                    }}>Clear all filters</Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q) => (
                <TableRow key={q.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <TableCell className="py-4 text-left">
                    <div className="space-y-1">
                      <div className="font-semibold text-xs leading-relaxed text-zinc-900 whitespace-normal break-words">
                        {extractText(q.content) || q.title || <span className="text-zinc-400 italic">No content</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                          {q.id.split('-')[0].toUpperCase()}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Added {new Date(q.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-zinc-700 uppercase tracking-tight">{q.subject || 'GENERAL'}</span>
                      {q.topic && <span className="text-[10px] text-zinc-500 font-medium whitespace-normal break-words">{q.topic}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase py-0 px-2 h-5 border-zinc-200 text-zinc-600 bg-zinc-50">
                      {q.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <Badge className={cn("text-[10px] font-black uppercase py-0 px-2 h-5 tracking-widest", getDifficultyColor(q.difficulty))}>
                      {q.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left text-zinc-600">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-1">
                        <DropdownMenuItem 
                          className="gap-2 text-xs font-medium py-2"
                          onClick={() => {
                            setSelectedQuestion({ id: q.id, title: extractText(q.content) });
                            setExplainOpen(true);
                          }}
                        >
                          <Sparkles className="h-4 w-4 text-purple-600" /> AI Content Explain
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs font-medium py-2">
                          <Edit2 className="h-4 w-4 text-zinc-500" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-xs font-medium py-2"
                          onClick={() => handleDuplicate(q.id)}
                        >
                          <Copy className="h-4 w-4 text-zinc-500" /> Duplicate Item
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-xs font-medium py-2 text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(q.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete Question
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

      <div className="flex items-center justify-between border-t bg-white px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-sm border">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
              Showing <span className="text-zinc-900">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-zinc-900">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="text-zinc-900">{totalItems}</span> results
            </p>
          </div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Button
              variant="outline"
              size="icon"
              className="rounded-l-md"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center px-4 text-xs font-bold text-zinc-600 border-y h-10 bg-zinc-50/50">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-r-md"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || loading}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
