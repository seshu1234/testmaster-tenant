"use client";

import { CheckCircle2, ArrowRight, Settings, Users, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  icon: React.ElementType;
}

const steps: OnboardingStep[] = [
  {
    id: "branding",
    title: "Brand Your Center",
    description: "Upload your logo and set institutional theme colors.",
    href: "/admin/settings/branding",
    completed: true,
    icon: Settings
  },
  {
    id: "teachers",
    title: "Invite Teachers",
    description: "Add your academic staff and assign their subjects.",
    href: "/admin/teachers",
    completed: true,
    icon: Users
  },
  {
    id: "batches",
    title: "Create Batches",
    description: "Organize students into academic groups or classes.",
    href: "/admin/batches",
    completed: false,
    icon: BookOpen
  },
  {
    id: "test",
    title: "Schedule First Test",
    description: "Create or approve your first assessment for students.",
    href: "/admin/tests",
    completed: false,
    icon: FileText
  }
];

export function OnboardingChecklist() {
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-bold uppercase tracking-wider text-zinc-600">
            Setup Progress
          </h3>
          <span className="text-xl font-bold">{completedCount} / {steps.length}</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="grid gap-3">
        {steps.map((step) => (
          <Link key={step.id} href={step.href}>
            <div className={`p-3 rounded-xl border transition-all hover:shadow-md group flex items-start gap-3 ${
              step.completed ? 'bg-green-50/50 border-green-100 opacity-80' : 'bg-white border-zinc-100 hover:border-primary/20'
            }`}>
              <div className={`mt-0.5 p-2 rounded-lg ${step.completed ? 'bg-green-100 te' : 'bg-zinc-50 text-zinc-600 group-hover:bg-primary/10 group-hover:te'}`}>
                <step.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${step.completed ? 'te' : 'te'}`}>
                    {step.title}
                  </span>
                  {step.completed && <CheckCircle2 className="h-3 w-3 text-zinc-600" />}
                </div>
                <p className="text-zinc-600 leading-relaxed">{step.description}</p>
              </div>
              {!step.completed && (
                <ArrowRight className="h-4 w-4 text-zinc-600 group- mt-1" />
              )}
            </div>
          </Link>
        ))}
      </div>

      <Button variant="ghost" className="w-full text-zinc-600 ">
        Dismiss Checklist
      </Button>
    </div>
  );
}
