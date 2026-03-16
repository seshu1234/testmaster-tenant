import * as React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../ui/select";

interface TestData {
  title: string;
  description: string;
  subject: string;
  language?: string;
  test_pattern: string;
  test_type: string;
}

interface Step1Props {
  data: TestData;
  onChange: (data: Partial<TestData>) => void;
}

export function Step1BasicInfo({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="title">Test Title</Label>
          <Input 
            id="title" 
            placeholder="e.g. Mid-term Physics Assessment 2024" 
            value={data.title || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ title: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label>Exam Pattern</Label>
          <Select 
            value={data.test_pattern || "nta"} 
            onValueChange={(val) => onChange({ test_pattern: val })}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select Pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nta">NTA (JEE/NEET Style)</SelectItem>
              <SelectItem value="tcs">TCS iON (Banking Style)</SelectItem>
              <SelectItem value="ssc">SSC CGL (TCS-2 Style)</SelectItem>
              <SelectItem value="custom">Standard / Institutional</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight">Affects the student test-taking UI & interaction rules.</p>
        </div>

        <div className="space-y-2">
          <Label>Test Type</Label>
          <Select 
            value={data.test_type || "full"} 
            onValueChange={(val) => onChange({ test_type: val })}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Mock Test</SelectItem>
              <SelectItem value="chapter">Chapter Test</SelectItem>
              <SelectItem value="sectional">Sectional Test</SelectItem>
              <SelectItem value="quiz">Live Quiz</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input 
            id="subject" 
            placeholder="e.g. Physics" 
            value={data.subject || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ subject: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input 
            id="language" 
            placeholder="e.g. English, Hindi" 
            value={data.language || "English"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ language: e.target.value })}
            className="h-11"
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
