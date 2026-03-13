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
          <h2 className="text-3xl font-bold tracking-tight">Institutional Profile</h2>
          <p className="text-muted-foreground">
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
          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription>Primary identification details of your institution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Center Name</label>
                  <Input placeholder="Elite Academy Bangalore" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Institutional Code</label>
                  <Input placeholder="EA-BLR-01" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea className="pl-10 min-h-[80px]" placeholder="123 Academic Square, Indiranagar, Bangalore..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="www.eliteacademy.in" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="+91 80 4433 2211" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Academic Configuration
              </CardTitle>
              <CardDescription>System-wide grading and assessment standards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Passing %</label>
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
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grading System</label>
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
                      <label className="text-sm font-bold">Negative Marking</label>
                       <p className="text-xs text-muted-foreground">Enable global penalty calculation for incorrect answers.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-bold">Partial Marking</label>
                       <p className="text-xs text-muted-foreground">Award points for multiple-correct questions with partial matches.</p>
                    </div>
                    <Switch />
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                <Calendar className="h-4 w-4" />
                Session Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Academic Year</label>
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
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timezone</label>
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

          <Card className="border shadow-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Result History</label>
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
                <span className="text-xs font-medium">Auto-Archive Logs</span>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Integrations & API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-2 rounded border border-zinc-100 bg-white shadow-sm">
                <Server className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold">ERP Connection</p>
                   <p className="text-[9px] text-muted-foreground leading-tight">Sync student data via webhooks.</p>
                </div>
                <Badge variant="outline" className="text-[8px] bg-zinc-50">Disabled</Badge>
              </div>
              <div className="space-y-2 pt-2 border-t">
                 <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Admin API Key</label>
                 <div className="flex gap-2">
                   <div className="relative flex-1">
                     <Key className="absolute left-2.5 top-2 h-3 w-3 text-muted-foreground" />
                     <Input readOnly value="tm_live_••••••••••••••••" className="pl-8 h-7 text-[10px] font-mono border-zinc-100 bg-zinc-50/50" />
                   </div>
                   <Button variant="outline" size="sm" className="h-7 text-[9px] border-zinc-200">Regenerate</Button>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-red-50/30 border-red-100">
            <CardHeader>
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-red-600 uppercase tracking-widest">
                <ShieldAlert className="h-4 w-4" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <p className="text-[10px] text-zinc-600 leading-tight">Actions here are IRREVERSIBLE. Use caution.</p>
               <Button variant="outline" className="w-full text-[10px] h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                 Purge Inactive Students
               </Button>
               <Button variant="outline" className="w-full text-[10px] h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                 Reset All Academic Data
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
