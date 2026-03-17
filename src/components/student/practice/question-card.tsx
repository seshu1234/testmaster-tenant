"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Info, ChevronRight, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface QuestionProps {
  question: {
    id: string;
    type: string;
    content: any;
    options: string[];
    explanation?: any;
    correct_answer?: any;
  };
  onAnswer: (questionId: string, selectedOptions: string[], isCorrect: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}

export function PracticeQuestionCard({ question, onAnswer, onNext, isLast }: QuestionProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const correctAnswers = Array.isArray(question.correct_answer) 
    ? question.correct_answer 
    : [question.correct_answer];

  const handleSelect = (option: string) => {
    if (showResult) return;
    
    if (question.type === 'mcq_multiple') {
      setSelected(prev => 
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    } else {
      setSelected([option]);
    }
  };

  const handleCheck = () => {
    if (selected.length === 0) return;
    
    const isCorrect = selected.length === correctAnswers.length && 
                     selected.every(s => correctAnswers.includes(s));
    
    setShowResult(true);
    setShowExplanation(true);
    onAnswer(question.id, selected, isCorrect);
  };

  const questionText = typeof question.content === 'object' ? question.content.text : question.content;

  return (
    <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-zinc-50">
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="bg-primary/5 text-primary border-none text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
            {question.type.replace('_', ' ')}
          </Badge>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
             <Star className="h-3 w-3" />
             AI Verified
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100 text-zinc-400">
           <Bookmark className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        <div className="prose prose-zinc max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkMath]} 
            rehypePlugins={[rehypeKatex]}
            className="text-xl font-bold leading-relaxed text-zinc-800"
          >
            {questionText}
          </ReactMarkdown>
        </div>

        <div className="grid gap-3">
          {question.options.map((option, idx) => {
            const isSelected = selected.includes(option);
            const isCorrect = correctAnswers.includes(option);
            
            let variant = "default";
            if (showResult) {
              if (isCorrect) variant = "correct";
              else if (isSelected) variant = "incorrect";
            } else if (isSelected) {
              variant = "selected";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                disabled={showResult}
                className={cn(
                  "flex items-center gap-4 p-5 rounded-3xl border-2 text-left transition-all duration-200 group relative overflow-hidden",
                  variant === "default" && "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50",
                  variant === "selected" && "border-primary bg-primary/5 text-primary shadow-inner",
                  variant === "correct" && "border-emerald-500 bg-emerald-50 text-emerald-700",
                  variant === "incorrect" && "border-rose-500 bg-rose-50 text-rose-700"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-2xl flex items-center justify-center font-black text-[11px] transition-colors",
                  variant === "default" && "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200",
                  variant === "selected" && "bg-primary text-white",
                  variant === "correct" && "bg-emerald-500 text-white",
                  variant === "incorrect" && "bg-rose-500 text-white"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                
                <span className="flex-1 font-bold text-base leading-tight">
                   {option}
                </span>

                {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {!showResult ? (
          <Button 
            onClick={handleCheck}
            disabled={selected.length === 0}
            className="w-full h-16 rounded-3xl text-sm font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transform transition-all active:scale-[0.98]"
          >
            CHECK ANSWER
          </Button>
        ) : (
          <div className="space-y-6 pt-4">
             {showExplanation && question.explanation && (
                <div className="p-8 rounded-[2rem] bg-zinc-50 border border-zinc-100 space-y-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                    <Info className="h-4 w-4" />
                    AI Step-by-Step Solution
                  </div>
                  <div className="prose prose-sm prose-zinc max-w-none text-zinc-700 font-medium leading-loose">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {typeof question.explanation === 'object' ? question.explanation.text : question.explanation}
                    </ReactMarkdown>
                  </div>
                </div>
             )}

            <Button 
                onClick={() => {
                  setSelected([]);
                  setShowResult(false);
                  setShowExplanation(false);
                  onNext();
                }}
                className="w-full h-16 rounded-3xl text-sm font-black uppercase tracking-widest bg-zinc-900 hover:bg-black group"
              >
                {isLast ? "FINISH SESSION" : "NEXT QUESTION"}
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Star(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
