"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Settings, 
  Layout, 
  ListOrdered, 
  Calendar, 
  Eye,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Step1BasicInfo } from "@/components/teacher/test-builder/step1-basic-info";
import { Step2Settings } from "@/components/teacher/test-builder/step2-settings";
import { Step3Sections } from "@/components/teacher/test-builder/step3-sections";
import { Step4Questions } from "@/components/teacher/test-builder/step4-questions";
import { Step5Schedule } from "@/components/teacher/test-builder/step5-schedule";

const steps = [
  { id: 1, title: "Basic Info", icon: BookOpen },
  { id: 2, title: "Settings", icon: Settings },
  { id: 3, title: "Sections", icon: Layout },
  { id: 4, title: "Questions", icon: ListOrdered },
  { id: 5, title: "Schedule", icon: Calendar },
  { id: 6, title: "Review", icon: Eye },
];

interface Section {
  id: string;
  name: string;
}

interface TestData {
  id: string;
  title: string;
  description: string;
  subject: string;
  language?: string;
  duration_seconds: number;
  test_type: string;
  test_pattern: string;
  has_sectional_timers: boolean;
  section_time_limits?: Record<string, number>;
  chapter_name?: string;
  start_at?: string;
  end_at?: string;
  batch_ids?: string[];
  settings: {
    passing_percentage: number;
    shuffle_questions: boolean;
    allow_navigation: boolean;
    marks_per_question?: number;
    negative_marking?: number;
    [key: string]: unknown;
  };
  sections?: Section[];
}

export default function TestBuilderPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [test, setTest] = useState<TestData>({
    id: Array.isArray(id) ? id[0] : id || "",
    title: "",
    description: "",
    subject: "",
    duration_seconds: 3600,
    test_type: "full",
    test_pattern: "nta",
    has_sectional_timers: false,
    settings: {
      passing_percentage: 33,
      shuffle_questions: false,
      allow_navigation: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTest = useCallback(async () => {
    if (!user || !token || !id) return;
    try {
      const response = await api(`/teacher/tests/${id}`, {
        token,
        tenant: user.tenant_id,
      });
      if (response.success) {
        const fetchedTest = response.data;
        // Merge defaults if settings are empty
        setTest({
          ...fetchedTest,
          settings: fetchedTest.settings || {
            passing_percentage: 33,
            shuffle_questions: false,
            allow_navigation: true
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch test:", error);
    } finally {
      setLoading(false);
    }
  }, [id, user, token]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const handleUpdateTest = (updates: Partial<TestData>) => {
    setTest((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (!user || !token || !id) return;
    setSaving(true);
    try {
      await api(`/teacher/tests/${id}`, {
        method: "PUT",
        token,
        tenant: user.tenant_id,
        body: JSON.stringify(test),
      });
    } catch (error) {
      console.error("Failed to save test:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 6) {
        await handlePublish();
    } else {
        await handleSave();
        setCurrentStep(currentStep + 1);
    }
  };

  const handlePublish = async () => {
    if (!user || !token || !id) return;
    setSaving(true);
    try {
      const response = await api(`/teacher/tests/${id}/publish`, {
        method: "POST",
        token,
        tenant: user.tenant_id,
      });
      if (response.success) {
        window.location.href = "/teacher/tests";
      }
    } catch (error) {
      console.error("Failed to publish test:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (loading) return <div className="p-8 text-zinc-600 animate-pulse">Initializing builder...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold tracking-tight">Test Builder</h1>
        <p className="text-zinc-600">Designing: <span className="text-zinc-600 font-medium">{test?.title}</span></p>
      </div>

      {/* Stepper */}
      <div className="relative flex justify-between">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 -translate-y-1/2 -z-10" />
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div 
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isCompleted 
                    ? "bg-primary border-primary text-zinc-600" 
                    : isActive 
                      ? "bg-white border-primary text-zinc-600 shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                      : "bg-white border-zinc-300 text-zinc-600"
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`text-zinc-600 font-medium ${isActive ? "text-primary" : "text-zinc-600"}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Wizard Content */}
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm min-h-[400px]">
        <CardHeader>
          <CardTitle>Step {currentStep}: {steps[currentStep-1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Configure the title, description and subject for this assessment."}
            {currentStep === 2 && "Set duration, marking schemes, and behavioral rules."}
            {currentStep === 3 && "Organize the test into named sections."}
            {currentStep === 4 && "Select questions from your bank for each section."}
            {currentStep === 5 && "Define when the test starts and assign student batches."}
            {currentStep === 6 && "Preview the student experience and finalize publication."}
          </CardDescription>
        </CardHeader>
        <CardContent>
           {currentStep === 1 && <Step1BasicInfo data={test} onChange={handleUpdateTest} />}
           {currentStep === 2 && <Step2Settings data={test} onChange={handleUpdateTest} />}
           {currentStep === 3 && <Step3Sections testId={test.id} onUpdate={fetchTest} />}
           {currentStep === 4 && <Step4Questions testId={test.id} sections={test.sections || []} />}
           {currentStep === 5 && <Step5Schedule data={test} onChange={handleUpdateTest} />}
           {currentStep === 6 && (
             <div className="space-y-6 animate-in fade-in">
                <div className="p-6 rounded-xl border bg-primary/5 border-primary/10">
                   <h3 className="font-semibold text-zinc-600 mb-2 text-zinc-600">Ready to Publish?</h3>
                   <p className="text-zinc-600">Review your test configuration. Once published, students in the assigned batches will be able to see it at the scheduled time.</p>
                </div>
                <div className="grid gap-4 text-zinc-600">
                   <div className="flex justify-between border-b pb-2"><span className="text-zinc-600">Title</span><span>{test.title}</span></div>
                   <div className="flex justify-between border-b pb-2"><span className="text-zinc-600">Duration</span><span>{test.duration_seconds / 60} mins</span></div>
                   <div className="flex justify-between border-b pb-2"><span className="text-zinc-600">Sections</span><span>{test.sections?.length || 0}</span></div>
                   <div className="flex justify-between border-b pb-2"><span className="text-zinc-600">Active Batches</span><span>{test.batch_ids?.length || 0}</span></div>
                </div>
             </div>
           )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button onClick={handleNext} className="gap-2" disabled={saving}>
            {currentStep === 6 ? "Publish Test" : "Continue"} 
            {currentStep !== 6 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
