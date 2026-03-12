"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Palette, 
  Users, 
  GraduationCap, 
  Rocket,
  ArrowRight,
  Database,
  Sparkles
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Link from "next/link";

const steps = [
  {
    title: "Branding & Identity",
    description: "Personalize your center's look and feel.",
    icon: Palette,
    tasks: ["Upload Logo & Favicon", "Select Primary Theme", "Set Welcome Message"]
  },
  {
    title: "Academic Structure",
    description: "Organize your batches and subjects.",
    icon: GraduationCap,
    tasks: ["Create First Batch", "Define Subjects", "Set Grading Scales"]
  },
  {
    title: "Team & Community",
    description: "Invite your staff and students.",
    icon: Users,
    tasks: ["Invite Teachers", "Bulk Import Students", "Configure Parent Portal"]
  },
  {
    title: "Ready for Launch",
    description: "Final verification and sample data.",
    icon: Rocket,
    tasks: ["Run System Test", "Load Sample Data (Optional)", "Publish First Test"]
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.success("Center Setup Complete!", {
        description: "You've successfully configured your institution on TestMaster.",
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Institutional Setup Wizard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome to TestMaster. Let&apos;s get your center ready for excellence in 4 simple steps.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2 bg-zinc-100" />
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md">
                <StepIcon className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
                <CardDescription className="text-zinc-400">{steps[currentStep].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              {steps[currentStep].tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-50 bg-zinc-50/30 hover:bg-zinc-50 transition-colors group">
                  <div className="h-6 w-6 rounded-full border-2 border-zinc-200 flex items-center justify-center group-hover:border-primary transition-colors">
                     <div className="h-2 w-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{task}</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-zinc-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                className="gap-2 px-8 bg-zinc-900 text-white hover:bg-zinc-800"
              >
                {currentStep === steps.length - 1 ? "Finish Setup" : "Continue"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Quick Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-600 leading-relaxed italic">
                {currentStep === 0 && "Your logo will appear on student result cards and login pages. Use a high-resolution PNG for clarity."}
                {currentStep === 1 && "Start with your main academic batches. You can always refine subjects and grading later."}
                {currentStep === 2 && "Invite your senior staff first. They can help with the bulk import of student data."}
                {currentStep === 3 && "Loading sample data allows you to test the student dashboard experience without real accounts."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-zinc-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Database className="h-3 w-3" />
                Demo Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-[10px] text-zinc-500 leading-tight">
                 Want to explore the platform before setting it up? 
               </p>
               <Button variant="outline" size="sm" className="w-full text-[10px] h-8 gap-2 border-zinc-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Populate Sample Data
               </Button>
            </CardContent>
          </Card>

          <Link href="/admin">
             <Button variant="link" className="w-full text-xs text-muted-foreground hover:text-primary">
                Skip for now, go to Dashboard
             </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
