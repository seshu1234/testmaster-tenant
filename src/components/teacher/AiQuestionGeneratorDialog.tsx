"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Sparkles, Loader2, Check, Wand2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
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
  bloom_level?: string;
}

interface AiQuestionGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionsGenerated: (questions: GeneratedQuestion[]) => void;
  defaultSubject?: string;
}

export function AiQuestionGeneratorDialog({ 
  open, 
  onOpenChange, 
  onQuestionsGenerated,
  defaultSubject = ""
}: AiQuestionGeneratorDialogProps) {
  const { token, tenantSlug } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [type, setType] = useState("mcq_single");

  const [results, setResults] = useState<GeneratedQuestion[]>([]);
  const [step, setStep] = useState<'input' | 'review'>('input');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await api("/teacher/ai/generate-questions", {
        method: "POST",
        token: token || undefined,
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
        setResults(response.data);
        setStep('review');
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onQuestionsGenerated(results);
    onOpenChange(false);
    // Reset
    setStep('input');
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Question Generator
          </DialogTitle>
          <DialogDescription>
            {step === 'input' 
              ? "Tell AI what kind of questions you need for this section." 
              : "Review and approve the generated questions."}
          </DialogDescription>
        </DialogHeader>

        {step === 'input' ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input 
                    placeholder="e.g. Physics" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
               </div>
               <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input 
                    placeholder="e.g. Newton's Laws" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
               <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="easy">Easy</SelectItem>
                       <SelectItem value="medium">Medium</SelectItem>
                       <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="mcq_single">MCQ (Single)</SelectItem>
                       <SelectItem value="fill_blank">Integer Type</SelectItem>
                       <SelectItem value="true_false">True/False</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label>Count</Label>
                  <Input 
                    type="number" 
                    value={count} 
                    onChange={(e) => setCount(parseInt(e.target.value))} 
                    min={1} 
                    max={20} 
                  />
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
             {results.map((q, i) => (
                <div key={i} className="p-4 rounded-xl border bg-zinc-50 space-y-2">
                   <div className="flex justify-between">
                      <h5 className="font-bold text-sm text-zinc-900">{q.title}</h5>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-[9px]">{q.difficulty}</Badge>
                        {q.bloom_level && <Badge variant="outline" className="text-[9px] border-purple-200">{q.bloom_level}</Badge>}
                      </div>
                   </div>
                   <p className="text-xs text-zinc-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.content }} />
                </div>
             ))}
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 'review' && (
             <Button variant="ghost" onClick={() => setStep('input')} disabled={loading}>
                Back to Edit
             </Button>
          )}
          <Button 
            onClick={step === 'input' ? handleGenerate : handleApply} 
            disabled={loading || !subject || !topic}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-zinc-600 font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : step === 'input' ? (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Add to Test Section
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
