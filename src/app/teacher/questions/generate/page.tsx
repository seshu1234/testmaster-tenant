"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2, Check, Save } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

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

  // Results
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleGenerate = async () => {
    if (!user || !token) return;
    setLoading(true);
    setGeneratedQuestions([]);
    setSelectedIndices([]);

    try {
      const response = await api("/v1/teacher/ai/generate-questions", {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          subject,
          topic,
          difficulty,
          count,
          type,
        }),
      });

      if (response.success) {
        setGeneratedQuestions(response.data);
        // Select all by default
        setSelectedIndices(response.data.map((_: GeneratedQuestion, i: number) => i));
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
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
      
      const response = await api("/v1/teacher/questions/bulk", {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          questions: questionsToSave.map(q => ({
            ...q,
            content: { text: q.content }, // Format for API
          }))
        }),
      });

      if (response.success) {
        router.push("/teacher/questions");
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
          <h1 className="text-3xl font-bold tracking-tight">AI Question Generator</h1>
          <p className="text-muted-foreground">Generate high-quality questions in seconds using AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: Parameters */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 flex flex-col h-fit sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
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
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
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
                <h2 className="text-xl font-semibold">Generated Results ({generatedQuestions.length})</h2>
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
                      selectedIndices.includes(i) ? 'border-primary bg-primary/5' : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                    onClick={() => toggleSelect(i)}
                  >
                    <CardHeader className="flex flex-row items-start justify-between py-4">
                      <div className="space-y-1 pr-8">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{q.title}</CardTitle>
                          <Badge variant="secondary" className="text-[10px] h-5">{q.difficulty}</Badge>
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400" dangerouslySetInnerHTML={{ __html: q.content }} />
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
                          <div key={oi} className={`text-xs p-2 rounded border ${
                            q.answer === opt || (Array.isArray(q.answer) && q.answer.includes(opt))
                              ? 'bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-700 dark:text-green-400 font-medium'
                              : 'bg-zinc-100 dark:bg-zinc-800 border-transparent'
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
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white dark:bg-zinc-950 border p-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                <div className="px-4 text-sm font-medium">
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
            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-center">
               <Loader2 className="h-12 w-12 animate-spin text-primary" />
               <div className="space-y-1">
                 <p className="font-semibold text-lg">AI is crafting your questions...</p>
                 <p className="text-muted-foreground">This usually takes about 10-20 seconds.</p>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl gap-4 text-center bg-zinc-50/50 dark:bg-zinc-900/20 px-8">
               <div className="bg-white dark:bg-zinc-900 shadow-sm p-4 rounded-full">
                 <Sparkles className="h-8 w-8 text-purple-500" />
               </div>
               <div className="space-y-1 max-w-sm">
                 <p className="font-semibold text-lg">Ready to Generate?</p>
                 <p className="text-muted-foreground">Fill in the parameters on the left and hit generate to see the magic happen.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
