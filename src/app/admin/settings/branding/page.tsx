"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Palette, Image as ImageIcon, ShieldCheck, Save, RefreshCw } from "lucide-react";

export default function BrandingSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#000000");

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Branding Updated", {
        description: "Your center's visual identity has been successfully saved.",
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Branding & Identity</h2>
        <p className="text-muted-foreground">
          Customize how your institution appears to students and teachers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Theme Customization
            </CardTitle>
            <CardDescription>Adjust colors and typography to match your brand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="primary-color">Primary Brand Color</Label>
              <div className="flex gap-2">
                <Input 
                  id="primary-color" 
                  type="color" 
                  className="w-12 h-10 p-1 rounded-md" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <Input 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#000000"
                  className="font-mono uppercase"
                />
              </div>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="dark-mode" className="flex flex-col gap-1">
                <span>Default Dark Mode</span>
                <span className="font-normal text-xs text-muted-foreground">Force dark appearance for all users.</span>
              </Label>
              <Switch id="dark-mode" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Assets & Logo
            </CardTitle>
            <CardDescription>Upload your institution&apos;s primary visual assets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Institution Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 border border-dashed border-zinc-200">
                   <ImageIcon className="h-6 w-6" />
                </div>
                <Button variant="outline" size="sm">Replace Logo</Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Dashboard Hero Banner</Label>
              <div className="h-24 w-full rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 border border-dashed border-zinc-200">
                 <p className="text-xs">Recommended: 1920x400px</p>
              </div>
              <Button variant="outline" size="sm" className="w-fit">Upload Banner</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              White-Labeling (Premium)
            </CardTitle>
            <CardDescription>Remove TestMaster branding from student portal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="remove-branding" className="flex flex-col gap-1">
                <span>Remove Powered By TestMaster</span>
                <span className="font-normal text-xs text-muted-foreground">Hides attribution in footer and emails.</span>
              </Label>
              <Switch id="remove-branding" checked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="custom-domain" className="flex flex-col gap-1">
                <span>Custom Domain Support</span>
                <span className="font-normal text-xs text-muted-foreground">Connect quiz.yourcenter.com</span>
              </Label>
              <Button variant="link" size="sm" className="h-auto p-0">Configure</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="ghost" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset to Default
        </Button>
        <Button onClick={handleSave} disabled={loading} className="gap-2 px-8">
          <Save className="h-4 w-4" />
          {loading ? "Saving Changes..." : "Save Branding"}
        </Button>
      </div>
    </div>
  );
}
