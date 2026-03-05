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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    setLoading(true);
    try {
      const response = await api("/v1/teacher/questions", {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          type,
          title,
          content: { text: content },
          difficulty,
          subject,
          topic,
          marks: 1, // Default marks
          options: options.map(opt => opt.text),
          answer: options.filter(opt => opt.isCorrect).map(opt => opt.text),
        }),
      });

      if (response.success) {
        router.push("/teacher/questions");
      }
    } catch (error) {
      console.error("Failed to create question:", error);
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
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
                <Label htmlFor="content">Question Text</Label>
                <RichTextEditor 
                  content={content}
                  onChange={setContent}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Options & Answer</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1">
                <Plus className="h-3 w-3" /> Add Option
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {options.map((option, index) => (
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
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq_single">MCQ (Single Correct)</SelectItem>
                    <SelectItem value="mcq_multiple">MCQ (Multiple Correct)</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="fill_blank">Fill in the Blanks</SelectItem>
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
