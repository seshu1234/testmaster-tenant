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
import { Sparkles, Loader2, Save, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface AiExplainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  questionTitle: string;
  onSuccess?: () => void;
}

export function AiExplainDialog({ open, onOpenChange, questionId, questionTitle, onSuccess }: AiExplainDialogProps) {
  const { token, tenantSlug } = useAuth();
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api(`/v1/teacher/ai/generate-explanation/${questionId}`, {
        method: "POST",
        token,
        tenant: tenantSlug || undefined
      });
      if (response.success) {
        setExplanation(response.data.explanation || "");
      }
    } catch (error) {
      console.error("AI Explanation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !explanation) return;
    setSaving(true);
    try {
      const response = await api(`/v1/teacher/questions/${questionId}`, {
        method: "PATCH",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          explanation: { text: explanation }
        })
      });
      if (response.success) {
        if (onSuccess) onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Save explanation failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Explanation Generator
          </DialogTitle>
          <DialogDescription>
            Generate a detailed, step-by-step solution for &quot;{questionTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {!explanation && !loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-full">
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
              <div className="max-w-xs">
                <p className="text-sm font-medium">No explanation generated yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Our AI will analyze the question and create a structured solution with LaTeX support.</p>
              </div>
              <Button onClick={handleGenerate} className="gap-2 bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4" />
                Generate Now
              </Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm text-muted-foreground">AI is thinking...</p>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border">
                  {explanation.split('\n').map((line, i) => {
                    // Primitive LaTeX detection for preview
                    if (line.includes('$$')) {
                      const math = line.match(/\$\$(.*?)\$\$/)?.[1];
                      return math ? <BlockMath key={i} math={math} /> : null;
                    }
                    if (line.includes('$')) {
                      return (
                        <p key={i} className="flex flex-wrap gap-1">
                          {line.split('$').map((part, j) => 
                            j % 2 === 1 ? <InlineMath key={j} math={part} /> : <span key={j}>{part}</span>
                          )}
                        </p>
                      );
                    }
                    return <p key={i}>{line}</p>;
                  })}
                </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {explanation && (
            <Button variant="outline" onClick={handleGenerate} disabled={loading} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Regenerate
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          {explanation && (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Solution
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
