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
  Copy, 
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
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <Input 
                placeholder="Search corpus identifier or content..." 
                className="pl-9 h-10 border-zinc-100 bg-zinc-50/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
               <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                 <SelectTrigger className="w-[140px] h-10 border-zinc-200">
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
                 <SelectTrigger className="w-[140px] h-10 border-zinc-200">
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

          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-zinc-900 text-white py-4 flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-zinc-600">Questions Repository</CardTitle>
                 <CardDescription className="text-zinc-600">Total {filteredQuestions.length} unique questions stored.</CardDescription>
              </div>
              <Button variant="ghost" className="text-zinc-600  gap-2">
                 <Copy className="h-4 w-4" />
                 Export Catalog
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50 border-none">
                    <TableHead className="w-[350px] font-bold text-[10px] uppercase tracking-wider pl-6">Question Content</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-600">Audited</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Academic Head</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Level</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Usage</TableHead>
                    <TableHead className="text-zinc-600 pr-6 font-bold text-[10px] uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-zinc-600 py-12 animate-pulse text-zinc-600 uppercase font-bold tracking-widest">
                        Loading questions bank...
                      </TableCell>
                    </TableRow>
                  ) : filteredQuestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-zinc-600 py-12 text-zinc-600">
                        No questions found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuestions.map((q) => (
                      <TableRow key={q.id} className="hover:bg-zinc-50/50 border-zinc-100 group transition-colors">
                        <TableCell className="pl-6">
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-600 line-clamp-1">{q.text}</span>
                            <span className="text-[10px] text-zinc-600 tracking-tight">ID: {q.id.substring(0, 8)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-600">
                          {q.last_audited ? (
                            <div className="flex flex-col items-center">
                               <CheckCircle2 className="h-4 w-4 text-zinc-600 mb-0.5" />
                               <span className="text-[8px] text-zinc-600 uppercase">{q.last_audited}</span>
                            </div>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 ">
                               <Flag className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-zinc-600 font-semibold">{q.teacher_name}</TableCell>
                        <TableCell>
                           <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${
                             q.difficulty === 'easy' ? 'bg-green-100/50 te' :
                             q.difficulty === 'medium' ? 'bg-zinc-100/50 te' :
                             'bg-red-100/50 te'
                           }`}>
                             {q.difficulty}
                           </span>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                              <span className="text-xl font-bold">{q.usage_count}x</span>
                              <div className="h-1 w-12 bg-zinc-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-primary" style={{ width: `${Math.min(q.usage_count * 5, 100)}%` }} />
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="text-zinc-600 pr-6">
                           <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 group- transition-colors">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 group-">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
