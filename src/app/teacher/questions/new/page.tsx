"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export default function CreateQuestionPage() {
  const router = useRouter();
  const { user, token, tenantSlug } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [type, setType] = useState<string>("mcq_single");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // MCQ Options
  const [options, setOptions] = useState([
    { id: "1", text: "", isCorrect: false },
    { id: "2", text: "", isCorrect: false },
  ]);

  const addOption = () => {
    setOptions([...options, { id: Date.now().toString(), text: "", isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const handleCorrectToggle = (id: string) => {
    if (type === "mcq_single") {
      setOptions(options.map(opt => ({ ...opt, isCorrect: opt.id === id })));
    } else {
      setOptions(options.map(opt => opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt));
    }
  };

  // Match Pairs
  const [matchPairs, setMatchPairs] = useState([
    { id: "1", left: "", right: "" },
    { id: "2", left: "", right: "" },
  ]);

  const addMatchPair = () => {
    setMatchPairs([...matchPairs, { id: Date.now().toString(), left: "", right: "" }]);
  };

  const removeMatchPair = (id: string) => {
    setMatchPairs(matchPairs.filter(p => p.id !== id));
  };

  const handleMatchChange = (id: string, side: 'left' | 'right', text: string) => {
    setMatchPairs(matchPairs.map(p => p.id === id ? { ...p, [side]: text } : p));
  };

  // Short Answer
  const [shortAnswer, setShortAnswer] = useState("");

  // Version Info
  const [versionNotes, setVersionNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    // Validation
    const errors: string[] = [];
    if (!title.trim()) errors.push("Title is required");
    if (!content.trim() || content === "<p></p>") errors.push("Question content is required");
    if (!subject.trim()) errors.push("Subject is required");
    
    if (type === "mcq_single" || type === "mcq_multiple") {
        if (options.some(opt => !opt.text.trim())) errors.push("All options must have text");
        if (!options.some(opt => opt.isCorrect)) errors.push("At least one correct answer must be selected");
        if (type === "mcq_single" && options.filter(opt => opt.isCorrect).length > 1) errors.push("Only one correct answer allowed for MCQ (Single)");
    } else if (type === "match") {
       if (matchPairs.some(p => !p.left.trim() || !p.right.trim())) errors.push("All match pairs must be filled");
    } else if (type === "short_answer") {
       if (!shortAnswer.trim()) errors.push("Correct response is required for short answer");
    }

    if (errors.length > 0) {
        setValidationErrors(errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setLoading(true);
    setValidationErrors([]);
    try {
      let finalOptions: string[] = [];
      let finalAnswer: string[] = [];

      if (type === "mcq_single" || type === "mcq_multiple" || type === "true_false" || type === "fill_blank") {
        finalOptions = options.map(opt => opt.text);
        finalAnswer = options.filter(opt => opt.isCorrect).map(opt => opt.text);
      } else if (type === "match") {
        finalOptions = matchPairs.map(p => p.left);
        finalAnswer = matchPairs.map(p => p.right);
      } else if (type === "short_answer") {
        finalAnswer = [shortAnswer];
      }

      const response = await api("/teacher/questions", {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          type,
          title,
          content: { text: content },
          explanation: { text: explanation },
          difficulty,
          subject,
          topic,
          marks: 1, 
          options: finalOptions,
          answer: finalAnswer,
          version_notes: versionNotes
        }),
      });

      if (response.success) {
        router.push("/teacher/questions");
      }
    } catch (error) {
      console.error("Failed to create question:", error);
      setValidationErrors([error instanceof Error ? error.message : "Failed to save question"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/teacher/questions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create Question</h1>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm space-y-1 animate-in fade-in duration-300">
           <p className="font-bold">Please fix the following errors:</p>
           <ul className="list-disc pl-5">
              {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
           </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        <div className="md:col-span-2 space-y-6">
          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">Question Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title / Reference</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Quadratic Equation Concept Check" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Question Text (supports $...$ for Math)</Label>
                <RichTextEditor 
                  content={content}
                  onChange={setContent}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">
                {type === "match" ? "Match Pairs" : "Options & Answer"}
              </CardTitle>
              {(type === "mcq_single" || type === "mcq_multiple" || type === "match") && (
                <Button type="button" variant="outline" size="sm" onClick={type === "match" ? addMatchPair : addOption} className="gap-1">
                  <Plus className="h-3 w-3" /> Add {type === "match" ? "Pair" : "Option"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {type === "match" ? (
                <div className="space-y-3">
                   {matchPairs.map((pair, idx) => (
                      <div key={pair.id} className="flex gap-2 items-center">
                         <span className="text-xs font-bold text-zinc-400 w-4">{idx + 1}.</span>
                         <Input placeholder="Left Item" value={pair.left} onChange={(e) => handleMatchChange(pair.id, 'left', e.target.value)} />
                         <span className="text-zinc-400">↔</span>
                         <Input placeholder="Right Item" value={pair.right} onChange={(e) => handleMatchChange(pair.id, 'right', e.target.value)} />
                         {matchPairs.length > 2 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeMatchPair(pair.id)}>
                               <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                         )}
                      </div>
                   ))}
                </div>
              ) : type === "short_answer" ? (
                <div className="space-y-2">
                   <Label>Correct Response</Label>
                   <Input 
                    placeholder="Enter the exact correct string answer..." 
                    value={shortAnswer}
                    onChange={(e) => setShortAnswer(e.target.value)}
                   />
                   <p className="text-[10px] text-muted-foreground">Note: Short answer evaluation is case-insensitive by default in the engine.</p>
                </div>
              ) : (
                options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <div 
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                        option.isCorrect ? 'bg-primary border-primary text-white' : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                      onClick={() => handleCorrectToggle(option.id)}
                    >
                      {option.isCorrect && <Plus className="h-4 w-4 rotate-45" />}
                    </div>
                    <Input 
                      placeholder={`Option ${index + 1}`} 
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(option.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">Solution Explanation</CardTitle>
            </CardHeader>
            <CardContent>
               <RichTextEditor 
                  content={explanation}
                  onChange={setExplanation}
                  placeholder="Explain the step-by-step solution..."
                />
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">Version Control</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-2">
                  <Label>Change Reason / Notes</Label>
                  <Input 
                    placeholder="e.g. Initial creation, Fixed typo in options..." 
                    value={versionNotes}
                    onChange={(e) => setVersionNotes(e.target.value)}
                  />
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq_single">MCQ (Single)</SelectItem>
                    <SelectItem value="mcq_multiple">MCQ (Multiple)</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="fill_blank">Fill in Blanks</SelectItem>
                    <SelectItem value="match">Match the following</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="e.g. Mathematics" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input 
                  id="topic" 
                  placeholder="e.g. Algebra" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Question"}
          </Button>
          
          <Button type="button" variant="outline" className="w-full">
            Save as Draft
          </Button>
        </div>
      </form>
    </div>
  );
}
