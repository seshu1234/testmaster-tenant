import * as React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

interface TestData {
  title: string;
  description: string;
  subject: string;
  language?: string;
}

interface Step1Props {
  data: TestData;
  onChange: (data: Partial<TestData>) => void;
}

export function Step1BasicInfo({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 col-span-2 md:col-span-1">
          <Label htmlFor="title">Test Title</Label>
          <Input 
            id="title" 
            placeholder="e.g. Mid-term Physics Assessment 2024" 
            value={data.title || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ title: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input 
            id="subject" 
            placeholder="e.g. Physics" 
            value={data.subject || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ subject: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input 
            id="language" 
            placeholder="e.g. English, Hindi" 
            value={data.language || "English"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ language: e.target.value })}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">Instructions (for students)</Label>
          <Textarea 
            id="description" 
            placeholder="Provide instructions or overview for your students..." 
            className="min-h-[120px]"
            value={data.description || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ description: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
