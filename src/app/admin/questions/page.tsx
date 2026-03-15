"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Eye,  
  CheckCircle2, 
  AlertTriangle, 
  Fingerprint, 
  ShieldCheck, 
  Download, 
  MoreVertical,
  Flag,
  Zap,
  Clock,
  BarChart3,
  GraduationCap
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Question {
  id: string;
  text: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  teacher_name: string;
  type: "mcq" | "numerical" | "multiselect";
  created_at: string;
  usage_count: number;
  last_audited: string | null;
  similarity_score?: number;
}

export default function AdminQuestionBankPage() {
  const { token, tenantSlug } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api("/admin/questions", {
        token,
        tenant: tenantSlug || undefined,
      });
      setQuestions(response.data);
    } catch {
      // Fallback for UI testing
      setQuestions([
        { id: "q1", text: "What is the derivative of sin(x)?", subject: "Maths", difficulty: "easy", teacher_name: "Mrs. Kapoor", type: "mcq", created_at: new Date().toISOString(), usage_count: 12, last_audited: "2d ago" },
        { id: "q2", text: "Calculate the molarity of a solution...", subject: "Chemistry", difficulty: "hard", teacher_name: "Dr. Sharma", type: "numerical", created_at: new Date().toISOString(), usage_count: 4, last_audited: null },
        { id: "q3", text: "Explain Newton's Second Law of Motion.", subject: "Physics", difficulty: "medium", teacher_name: "Prof. Verma", type: "mcq", created_at: new Date().toISOString(), usage_count: 28, last_audited: "1w ago" },
        { id: "q4", text: "Solve for x: x^2 - 5x + 6 = 0", subject: "Maths", difficulty: "medium", teacher_name: "Mrs. Kapoor", type: "mcq", created_at: new Date().toISOString(), usage_count: 0, last_audited: null },
      ]);
    } finally {
      setLoading(false);
    }
  }, [token, tenantSlug]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.teacher_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === "all" || q.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Question Bank</h2>
          <p className="text-zinc-600">
            Maintain the highest standards of academic integrity and quality control.
          </p>
        </div>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="directory" className="gap-2">
            <Fingerprint className="h-4 w-4" />
            Item Directory
          </TabsTrigger>
          <TabsTrigger value="quality" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Quality Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search by content or ID..." 
                className="pl-9 h-11 border-zinc-200 bg-white shadow-sm focus:ring-2 focus:ring-zinc-900 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex w-full sm:w-auto gap-2">
               <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                 <SelectTrigger className="flex-1 sm:w-[140px] h-11 border-zinc-200 bg-white">
                    <SelectValue placeholder="Subject" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Subjects</SelectItem>
                   <SelectItem value="Physics">Physics</SelectItem>
                   <SelectItem value="Chemistry">Chemistry</SelectItem>
                   <SelectItem value="Maths">Maths</SelectItem>
                 </SelectContent>
               </Select>
               <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                 <SelectTrigger className="flex-1 sm:w-[140px] h-11 border-zinc-200 bg-white">
                    <SelectValue placeholder="Difficulty" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Levels</SelectItem>
                   <SelectItem value="easy">Easy</SelectItem>
                   <SelectItem value="medium">Medium</SelectItem>
                   <SelectItem value="hard">Hard</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </div>

          <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5">
                 <CardTitle className="text-base text-zinc-900">Questions Repository</CardTitle>
                 <CardDescription className="text-xs text-zinc-500">Total {filteredQuestions.length} unique questions stored.</CardDescription>
              </div>
              <Button variant="outline" className="h-9 border-zinc-200 text-xs gap-2 sm:flex hidden">
                 <Download className="h-3.5 w-3.5" />
                 Export Catalog
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-zinc-100 bg-zinc-50/30">
                      <TableHead className="py-4 pl-4 sm:pl-6 font-semibold text-[10px] sm:text-xs text-zinc-500 uppercase tracking-tight text-left sm:text-center border-x border-zinc-100">Question Content</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden xs:table-cell">Status</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden md:table-cell">Academic Head</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Level</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 hidden lg:table-cell">Usage</TableHead>
                      <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100 pr-4 sm:pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="animate-pulse">
                          <TableCell colSpan={6} className="py-8 px-6">
                            <div className="h-8 bg-zinc-100 rounded-md"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredQuestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20">
                          <Fingerprint className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                          <p className="text-sm font-medium text-zinc-500">No matching questions found.</p>
                          <Button variant="link" className="text-zinc-400 text-xs mt-1" onClick={() => setSearchTerm("")}>Clear filters</Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQuestions.map((q) => (
                        <TableRow key={q.id} className="group hover:bg-zinc-100/50 transition-colors border-b border-zinc-100 even:bg-zinc-50/50">
                          <TableCell className="py-4 pl-4 sm:pl-6 border-x border-zinc-100 text-left sm:text-center">
                            <div className="flex flex-col items-start sm:items-center min-w-[120px] max-w-[200px] sm:max-w-none">
                              <span className="font-bold text-xs sm:text-sm text-zinc-900 truncate w-full">{q.text}</span>
                              <span className="text-[9px] sm:text-[10px] text-zinc-500 tracking-tight">ID: {q.id.substring(0, 8)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-center border-r border-zinc-100 hidden xs:table-cell">
                            {q.last_audited ? (
                              <div className="flex flex-col items-center justify-center">
                                 <CheckCircle2 className="h-4 w-4 text-green-500 mb-0.5" />
                                 <span className="text-[8px] text-zinc-500 font-bold uppercase">{q.last_audited}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                 <Flag className="h-4 w-4 text-zinc-300" />
                                 <span className="text-[8px] text-zinc-400 font-bold uppercase">Pending</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-4 text-center border-r border-zinc-100 hidden md:table-cell font-bold text-sm text-zinc-700">{q.teacher_name}</TableCell>
                          <TableCell className="py-4 text-center border-r border-zinc-100">
                             <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-tight ${
                               q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                               q.difficulty === 'medium' ? 'bg-zinc-100 text-zinc-600' :
                               'bg-red-100 text-red-700'
                             }`}>
                               {q.difficulty}
                             </span>
                          </TableCell>
                          <TableCell className="py-4 text-center border-r border-zinc-100 hidden lg:table-cell">
                             <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-zinc-900">{q.usage_count}x</span>
                                <div className="h-1 w-16 bg-zinc-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-zinc-900" style={{ width: `${Math.min(q.usage_count * 5, 100)}%` }} />
                                </div>
                             </div>
                          </TableCell>
                          <TableCell className="py-4 text-center border-r border-zinc-100 pr-4 sm:pr-6">
                             <div className="flex justify-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 transition-colors">
                                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
                                  <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="mt-6 space-y-6">
           <div className="grid gap-6 md:grid-cols-2">
              <Card className="border shadow-sm bg-white border-zinc-100 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <AlertTriangle className="h-24 w-24" />
                 </div>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Zap className="h-4 w-4 text-zinc-600" />
                       Duplicate Detection
                    </CardTitle>
                    <CardDescription>Identifying questions with high similarity.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {[
                      { original: "q1", clash: "q142", similarity: 94 },
                      { original: "q82", clash: "q31", similarity: 88 },
                    ].map((clash, i) => (
                      <div key={i} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-3 group hover:border-amber-200 transition-colors">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest">Similarity Match: {clash.similarity}%</span>
                            <Badge variant="outline" className="text-[8px] bg-amber-50 border-amber-200 text-zinc-600 uppercase">Requires Merge</Badge>
                         </div>
                         <div className="flex items-center justify-between">
                            <div className="text-zinc-600 font-medium">Item {clash.original} <span className="text-zinc-600 mx-2">vs</span> Item {clash.clash}</div>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900  border-zinc-200">Solve</Button>
                         </div>
                         <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${clash.similarity}%` }} />
                         </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>

              <Card className="border shadow-sm bg-zinc-900 text-white overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck className="h-24 w-24" />
                 </div>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold uppercase tracking-widest text-zinc-600">
                       <GraduationCap className="h-4 w-4" />
                       Quality Distribution
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="space-y-6">
                       {[
                         { label: "Validated Items", value: 84, color: "bg-green-500" },
                         { label: "Needs Correction", value: 12, color: "bg-amber-500" },
                         { label: "Outdated Content", value: 4, color: "bg-red-500" },
                       ].map((stat, i) => (
                         <div key={i} className="space-y-2">
                            <div className="flex justify-between items-end">
                               <span className="text-xl font-bold">{stat.label}</span>
                               <span className="text-zinc-600 font-mono">{stat.value}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                               <div className="h-full transition-all duration-1000" style={{ width: `${stat.value}%`, backgroundColor: i === 0 ? '#22c55e' : i === 1 ? '#f59e0b' : '#ef4444' }} />
                            </div>
                         </div>
                       ))}
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl space-y-3">
                       <CardTitle className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                          <BarChart3 className="h-3 w-3" />
                          Usage Heatmap
                       </CardTitle>
                       <div className="flex items-end gap-1 h-20">
                          {[40, 70, 45, 90, 65, 30, 85].map((h, i) => (
                             <div key={i} className="flex-1 bg-primary/40 rounded-t-sm hover:bg-primary transition-colors cursor-pointer" style={{ height: `${h}%` }} title={`Usage: ${h}%`} />
                          ))}
                       </div>
                    </div>
                    <Button variant="outline" className="w-full text-[10px] font-bold uppercase tracking-widest gap-2 bg-white/5 border-white/10 hover:bg-white/10 mt-4">
                       <Clock className="h-3 w-3" />
                       Schedule Full Audit
                    </Button>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
