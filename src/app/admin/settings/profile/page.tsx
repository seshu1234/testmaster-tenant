"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  GraduationCap, 
  Calendar,
  Save,
  ShieldAlert,
  Database,
  Key,
  Server,
  Zap
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function CenterProfilePage() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Settings Saved", {
        description: "Institutional profile and academic configuration updated.",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Institutional Profile</h2>
          <p className="text-zinc-600">
            Configure your center&apos;s identity, academic standards, and data policies.
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2 px-8">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-zinc-600" />
                Basic Information
              </CardTitle>
              <CardDescription>Primary identification details of your institution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Center Name</label>
                  <Input placeholder="Elite Academy Bangalore" />
                </div>
                <div className="space-y-2">
                  <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Institutional Code</label>
                  <Input placeholder="EA-BLR-01" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-3 h-4 w-4 text-zinc-600" />
                  <Textarea className="pl-10 min-h-[80px]" placeholder="123 Academic Square, Indiranagar, Bangalore..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-600" />
                    <Input className="pl-10" placeholder="www.eliteacademy.in" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-600" />
                    <Input className="pl-10" placeholder="+91 80 4433 2211" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-zinc-600" />
                Academic Configuration
              </CardTitle>
              <CardDescription>System-wide grading and assessment standards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Default Passing %</label>
                    <Select defaultValue="35">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="33">33% (Secondary Standard)</SelectItem>
                        <SelectItem value="35">35% (Institutional Standard)</SelectItem>
                        <SelectItem value="40">40% (Competitive Standard)</SelectItem>
                        <SelectItem value="50">50% (Advanced Standard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Grading System</label>
                    <Select defaultValue="percentage">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (100-Point)</SelectItem>
                        <SelectItem value="gpa">GPA (10.0 Scale)</SelectItem>
                        <SelectItem value="letters">Letter Grades (A-F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-xl font-bold">Negative Marking</label>
                       <p className="text-zinc-600">Enable global penalty calculation for incorrect answers.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-xl font-bold">Partial Marking</label>
                       <p className="text-zinc-600">Award points for multiple-correct questions with partial matches.</p>
                    </div>
                    <Switch />
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-zinc-600 font-medium flex items-center gap-2 text-zinc-600">
                <Calendar className="h-4 w-4" />
                Session Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Academic Year</label>
                <Select defaultValue="2025-26">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-25">2024 - 2025</SelectItem>
                    <SelectItem value="2025-26">2025 - 2026</SelectItem>
                    <SelectItem value="2026-27">2026 - 2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Timezone</label>
                <Select defaultValue="ist">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ist">(GMT+05:30) India Standard Time</SelectItem>
                    <SelectItem value="utc">(GMT+00:00) UTC Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-zinc-50 border-zinc-100">
            <CardHeader>
              <CardTitle className="text-zinc-600 font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-zinc-600" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xl font-bold uppercase tracking-wider text-zinc-600">Result History</label>
                <Select defaultValue="2">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year Retention</SelectItem>
                    <SelectItem value="2">2 Years Retention</SelectItem>
                    <SelectItem value="5">Permanent (Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-600 font-medium">Auto-Archive Logs</span>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-zinc-600 font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-zinc-600" />
                Integrations & API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-2 rounded border border-zinc-100 bg-white shadow-sm">
                <Server className="h-4 w-4 text-zinc-600" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold">ERP Connection</p>
                   <p className="text-[9px] text-zinc-600 leading-tight">Sync student data via webhooks.</p>
                </div>
                <Badge variant="outline" className="text-[8px] bg-zinc-50">Disabled</Badge>
              </div>
              <div className="space-y-2 pt-2 border-t">
                 <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Admin API Key</label>
                 <div className="flex gap-2">
                   <div className="relative flex-1">
                     <Key className="absolute left-2.5 top-2 h-3 w-3 text-zinc-600" />
                     <Input readOnly value="tm_live_••••••••••••••••" className="pl-8 h-7 text-[10px] font-mono border-zinc-100 bg-zinc-50/50" />
                   </div>
                   <Button variant="outline" size="sm" className="h-7 text-[9px] border-zinc-200">Regenerate</Button>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-red-50/30 border-red-100">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-zinc-600 uppercase tracking-widest">
                <ShieldAlert className="h-4 w-4" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <p className="text-[10px] text-zinc-600 leading-tight">Actions here are IRREVERSIBLE. Use caution.</p>
               <Button variant="outline" className="w-full text-[10px] h-8 border-red-200 text-zinc-600 hover:bg-red-50 ">
                 Purge Inactive Students
               </Button>
               <Button variant="outline" className="w-full text-[10px] h-8 border-red-200 text-zinc-600 hover:bg-red-50 ">
                 Reset All Academic Data
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
