"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel,
  SelectSeparator,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2, Check, Save } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const EXAM_CATEGORIES = [
  { group: "School-Level (K-12)", items: ["CBSE", "ICSE", "IB", "IGCSE", "State Board (Maharashtra)", "State Board (Tamil Nadu)", "NTSE", "KVPY"] },
  { group: "Engineering Entrance (JEE)", items: ["JEE Main", "JEE Advanced", "MHT-CET", "KCET", "WBJEE", "AP EAMCET", "TS EAMCET"] },
  { group: "Medical Entrance (NEET)", items: ["NEET-UG", "AIIMS", "JIPMER"] },
  { group: "Commerce/Management", items: ["CA Foundation", "CA Intermediate", "CMA Foundation", "CS Executive", "CUET (UG)", "CUET (PG)", "CAT", "XAT", "GMAT"] },
  { group: "Law Entrance", items: ["CLAT", "AILET", "MH-CET Law"] },
  { group: "Post-Graduate/Science", items: ["GATE", "IIT JAM", "MBA (CMAT/MAT/SNAP)"] },
  { group: "Government Job/Defence", items: ["SSC CGL", "SSC CHSL", "Banking (IBPS/SBI)", "RBI Grade B", "RRB NTPC", "NDA", "CDS"] },
  { group: "Olympiads", items: ["SOF NSO", "SOF IMO", "SilverZone", "Unified Council"] },
];

interface GeneratedQuestion {
  title: string;
  content: string;
  type: string;
  difficulty: string;
  options: string[] | null;
  answer: string | string[];
  marks: number;
  subject: string;
  topic: string;
  bloom_level?: string;
  variants?: string[];
}

export default function AiGeneratePage() {
  const router = useRouter();
  const { user, token, tenantSlug } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Generation Params
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [type, setType] = useState("mcq_single");
  const [targetExam, setTargetExam] = useState("");
  const [targetPool, setTargetPool] = useState<"assessment" | "practice">("assessment");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const poolParam = searchParams.get('pool');
    if (poolParam === 'practice' || poolParam === 'assessment') {
      setTargetPool(poolParam as "practice" | "assessment");
    }
  }, []);

  // Results
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleGenerate = async () => {
    if (!user || !token) return;
    setLoading(true);
    setGeneratedQuestions([]);
    setSelectedIndices([]);

    if (count < 1) {
      alert("Please select at least 1 question to generate.");
      setLoading(false);
      return;
    }

    try {
      const response = await api("/teacher/ai/generate-questions", {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          subject,
          topic,
          difficulty,
          count,
          type,
          target_exam: targetExam,
        }),
      });

      if (response.success) {
        setGeneratedQuestions(response.data);
        // Select all by default
        setSelectedIndices(response.data.map((_: GeneratedQuestion, i: number) => i));
      } else {
        alert(response.error || "Failed to generate questions. The AI service might be busy, please try again in a moment.");
      }
    } catch (error: unknown) {
      console.error("AI Generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTimeout = errorMessage.includes('timeout') || (error instanceof Error && error.name === 'AbortError');
      
      if (isTimeout) {
        alert("AI Generation timed out. The provider might be slow or you requested too many questions. Please try with a smaller count (e.g. 5).");
      } else {
        // Show actual error message to help debugging
        alert(`AI Generation failed: ${errorMessage}\n\nIf this is a "Failed to fetch" error, please ensure your backend server (php artisan serve) is running and your frontend was restarted after config changes.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleSaveSelected = async () => {
    if (!user || !token || selectedIndices.length === 0) return;
    
    setSaving(true);
    try {
      const questionsToSave = selectedIndices.map(i => generatedQuestions[i]);
      
      const response = await api("/teacher/ai/batch/save-questions", {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          target: targetPool,
          target_exam: targetExam,
          questions: questionsToSave.map(q => ({
            ...q,
            content: { text: q.content }, // Format for API
            marks: q.marks || 1,
            subject: subject || q.subject,
            topic: topic || q.topic
          }))
        }),
      });

      if (response.success) {
        router.push(targetPool === 'practice' ? "/student/practice" : "/teacher/questions");
      }
    } catch (error) {
      console.error("Failed to save questions:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/teacher/questions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">AI Question Generator</h1>
          <p className="text-zinc-600">Generate high-quality questions in seconds using AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: Parameters */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm flex flex-col h-fit sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-zinc-600" />
                Generation Parameters
              </CardTitle>
              <CardDescription>Specify what kind of questions you need.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input 
                  placeholder="e.g. Mathematics" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input 
                  placeholder="e.g. Calculus: Derivatives" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Count (1-10)</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={isNaN(count) ? "" : count}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setCount(isNaN(val) ? 0 : val);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq_single">MCQ (Single)</SelectItem>
                    <SelectItem value="mcq_multiple">MCQ (Multiple)</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="fill_blank">Fill in Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Exam (Categorization)</Label>
                <Select value={targetExam} onValueChange={setTargetExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Target Exam..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {EXAM_CATEGORIES.map((group) => (
                      <SelectGroup key={group.group}>
                        <SelectLabel className="bg-zinc-50/50 text-[10px] uppercase tracking-wider font-bold py-1">
                          {group.group}
                        </SelectLabel>
                        {group.items.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                        <SelectSeparator />
                      </SelectGroup>
                    ))}
                    <SelectItem value="Other">Other / General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Banking Pool</Label>
                <Select value={targetPool} onValueChange={(v: "assessment" | "practice") => setTargetPool(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assessment">Assessment Bank (Tests)</SelectItem>
                    <SelectItem value="practice">Practice Bank (Self-Study)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-zinc-500 italic px-1">
                  Practice Pool questions have no timers and include immediate AI explanations.
                </p>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none h-11"
                disabled={loading || !subject || !topic}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main: Results */}
        <div className="lg:col-span-8 space-y-6">
          {generatedQuestions.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-zinc-600 font-semibold">Generated Results ({generatedQuestions.length})</h2>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={() => setSelectedIndices(generatedQuestions.map((_, i) => i))}>
                     Select All
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => setSelectedIndices([])}>
                     Deselect All
                   </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {generatedQuestions.map((q, i) => (
                  <Card 
                    key={i} 
                    className={`border-2 transition-all cursor-pointer ${
                      selectedIndices.includes(i) ? 'border-primary bg-primary/5' : 'border-zinc-200'
                    }`}
                    onClick={() => toggleSelect(i)}
                  >
                    <CardHeader className="flex flex-row items-start justify-between py-4">
                      <div className="space-y-1 pr-8">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-zinc-600">{q.title}</CardTitle>
                          <Badge variant="secondary" className="text-[10px] h-5">{q.difficulty}</Badge>
                          {q.bloom_level && (
                            <Badge variant="outline" className="text-[10px] h-5 border-purple-200 text-zinc-600">
                              {q.bloom_level}
                            </Badge>
                          )}
                        </div>
                        <div className="text-zinc-600" dangerouslySetInnerHTML={{ __html: q.content }} />
                        
                        {q.variants && q.variants.length > 0 && (
                          <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100 space-y-2">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Question Variants (Reduced Cheating):</p>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-600">
                              {q.variants.map((v, vi) => (
                                <li key={vi} className="leading-relaxed opacity-80">{v}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedIndices.includes(i) ? 'bg-primary border-primary text-white' : 'border-zinc-300'
                      }`}>
                        {selectedIndices.includes(i) && <Check className="h-4 w-4" />}
                      </div>
                    </CardHeader>
                    {q.options && (
                      <CardContent className="pb-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className={`text-zinc-600 p-2 rounded border ${
                            q.answer === opt || (Array.isArray(q.answer) && q.answer.includes(opt))
                              ? 'bg-green-100 border-green-200 text-zinc-600 font-medium'
                              : 'bg-zinc-100 border-transparent'
                          }`}>
                            {opt}
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {/* Float Save Button */}
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white border p-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                <div className="px-4 text-zinc-600 font-medium">
                  {selectedIndices.length} questions selected
                </div>
                <Button 
                  onClick={handleSaveSelected} 
                  className="rounded-full px-8 gap-2"
                  disabled={saving || selectedIndices.length === 0}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Add to Question Bank
                </Button>
              </div>
            </>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-zinc-600">
               <Loader2 className="h-12 w-12 animate-spin text-zinc-600" />
               <div className="space-y-1">
                 <p className="font-semibold text-zinc-600">AI is crafting your questions...</p>
                 <p className="text-zinc-600">This usually takes about 10-20 seconds.</p>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl gap-4 text-zinc-600 bg-zinc-50/20 px-8">
               <div className="bg-white shadow-sm p-4 rounded-full">
                 <Sparkles className="h-8 w-8 text-zinc-600" />
               </div>
               <div className="space-y-1 max-w-sm">
                 <p className="font-semibold text-zinc-600">Ready to Generate?</p>
                 <p className="text-zinc-600">Fill in the parameters on the left and hit generate to see the magic happen.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
