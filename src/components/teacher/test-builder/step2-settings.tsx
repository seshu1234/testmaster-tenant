"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Section {
  id: string;
  name: string;
}

interface TestData {
  duration_seconds: number;
  test_pattern: string;
  has_sectional_timers: boolean;
  section_time_limits?: Record<string, number>;
  sections?: Section[];
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

  const handleSectionTimeChange = (sectionId: string, minutes: number) => {
    onChange({
      section_time_limits: {
        ...(data.section_time_limits || {}),
        [sectionId]: minutes,
      }
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
            value={(data.duration_seconds || 3600) / 60}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ duration_seconds: parseInt(e.target.value) * 60 })}
            className="h-11"
            disabled={data.has_sectional_timers}
          />
          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight">
            {data.has_sectional_timers 
              ? "Duration is calculated automatically from section times." 
              : "Students will be timed out automatically."}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pass">Passing Percentage (%)</Label>
          <Input 
            id="pass" 
            type="number"
            value={data.settings.passing_percentage || 33}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingsChange("passing_percentage", parseInt(e.target.value))}
            className="h-11"
          />
        </div>
      </div>

      <div className="bg-zinc-50 p-6 rounded-xl border border-dashed space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-zinc-900 font-bold">Sectional Timers (Banking Pattern)</Label>
            <p className="text-sm text-zinc-500">Enforce strict time limits per subject/section. Students cannot switch sections freely.</p>
          </div>
          <div 
             onClick={() => onChange({ has_sectional_timers: !data.has_sectional_timers })}
             className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${data.has_sectional_timers ? 'bg-primary' : 'bg-zinc-300'}`}
          >
             <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${data.has_sectional_timers ? 'translate-x-5' : ''}`} />
          </div>
        </div>

        {data.has_sectional_timers && (
          <div className="space-y-4 pt-4 border-t border-zinc-200">
             <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Configure Section Times</Label>
             {data.sections && data.sections.length > 0 ? (
               <div className="grid gap-4 md:grid-cols-2">
                 {data.sections.map((section) => (
                   <div key={section.id} className="p-4 bg-white border rounded-lg flex items-center justify-between gap-4">
                      <span className="font-medium text-sm text-zinc-700 truncate">{section.name}</span>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          className="w-20 h-9" 
                          value={data.section_time_limits?.[section.id] || 0}
                          onChange={(e) => handleSectionTimeChange(section.id, parseInt(e.target.value))}
                        />
                        <span className="text-xs text-zinc-500">min</span>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-4 bg-yellow-50 text-yellow-700 text-xs rounded-lg border border-yellow-100 flex items-center gap-2">
                  Please define sections in Step 3 first to configure their individual timers.
               </div>
             )}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="marks">Default Marks per Question</Label>
          <Input 
            id="marks" 
            type="number"
            value={data.settings.marks_per_question || 4}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingsChange("marks_per_question", parseInt(e.target.value))}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neg">Negative Marking per Question</Label>
          <Input 
            id="neg" 
            type="number"
            value={data.settings.negative_marking || 1}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingsChange("negative_marking", parseInt(e.target.value))}
            className="h-11"
          />
        </div>
      </div>

      <div className="grid gap-4 bg-zinc-50/50 p-6 rounded-xl border">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-zinc-700">Shuffle Questions</Label>
            <p className="text-xs text-zinc-500">Each student gets questions in a random order.</p>
          </div>
          <div 
             onClick={() => handleSettingsChange("shuffle_questions", !data.settings.shuffle_questions)}
             className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${data.settings.shuffle_questions ? 'bg-primary' : 'bg-zinc-300'}`}
          >
             <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${data.settings.shuffle_questions ? 'translate-x-5' : ''}`} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-zinc-700">Free Navigation</Label>
            <p className="text-xs text-zinc-500">Allow students to toggle between questions before submitting.</p>
          </div>
          <div 
             onClick={() => handleSettingsChange("allow_navigation", !data.settings.allow_navigation)}
             className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${data.settings.allow_navigation ? 'bg-primary' : 'bg-zinc-300'}`}
          >
             <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${data.settings.allow_navigation ? 'translate-x-5' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
