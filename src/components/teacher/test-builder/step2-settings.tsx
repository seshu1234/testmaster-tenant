"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TestData {
  duration_seconds: number;
  settings: {
    passing_percentage: number;
    shuffle_questions: boolean;
    allow_navigation: boolean;
    marks_per_question?: number;
    negative_marking?: number;
    [key: string]: unknown;
  };
}

interface Step2Props {
  data: TestData;
  onChange: (data: Partial<TestData>) => void;
}

export function Step2Settings({ data, onChange }: Step2Props) {
  const handleSettingsChange = (key: string, value: boolean | number | string) => {
    onChange({
      settings: {
        ...data.settings,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration">Total Duration (minutes)</Label>
          <Input 
            id="duration" 
            type="number"
            value={data.duration_seconds / 60}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ duration_seconds: parseInt(e.target.value) * 60 })}
          />
          <p className="text-xs text-muted-foreground ">Students will be timed out automatically.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pass">Passing Percentage (%)</Label>
          <Input 
            id="pass" 
            type="number"
            value={data.settings.passing_percentage || 33}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingsChange("passing_percentage", parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marks">Default Marks per Question</Label>
          <Input 
            id="marks" 
            type="number"
            value={data.settings.marks_per_question || 4}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingsChange("marks_per_question", parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neg">Negative Marking per Question</Label>
          <Input 
            id="neg" 
            type="number"
            value={data.settings.negative_marking || 1}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingsChange("negative_marking", parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="grid gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-dashed">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Shuffle Questions</Label>
            <p className="text-xs text-muted-foreground">Each student gets questions in a random order.</p>
          </div>
          {/* Using a simple custom switch since ui/switch might be missing */}
          <div 
             onClick={() => handleSettingsChange("shuffle_questions", !data.settings.shuffle_questions)}
             className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${data.settings.shuffle_questions ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          >
             <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${data.settings.shuffle_questions ? 'translate-x-5' : ''}`} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Free Navigation</Label>
            <p className="text-xs text-muted-foreground">Allow students to toggle between questions before submitting.</p>
          </div>
          <div 
             onClick={() => handleSettingsChange("allow_navigation", !data.settings.allow_navigation)}
             className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${data.settings.allow_navigation ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          >
             <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${data.settings.allow_navigation ? 'translate-x-5' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
