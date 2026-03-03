"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Palette, Save, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { FileUploadService } from "@/lib/upload-service";

interface BrandingConfig {
  palette_name: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  login_banner_url: string | null;
  welcome_message: string | null;
  hide_powered_by: boolean;
  custom_css: string | null;
}

export default function AdminBrandingPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [config, setConfig] = useState<BrandingConfig>({
    palette_name: "Ocean Blue",
    primary_color: "#1E40AF",
    accent_color: "#3B82F6",
    background_color: "#EFF6FF",
    logo_url: null,
    favicon_url: null,
    login_banner_url: null,
    welcome_message: null,
    hide_powered_by: false,
    custom_css: null,
  });

  useEffect(() => {
    const fetchBranding = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/v1/admin/branding`, { token, tenant: user.tenant_id });
        if (response.success && response.data) {
          setConfig(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch branding:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranding();
  }, [user, token]);

  const handleSave = async () => {
    if (!user || !token) return;
    setSaving(true);
    try {
      const response = await api(`/v1/admin/branding`, {
        method: "PUT",
        token,
        tenant: user.tenant_id,
        body: JSON.stringify(config),
      });
      if (response.success) {
        alert("Branding settings saved successfully! Changes apply within 1 minute.");
      }
    } catch (err) {
      console.error("Failed to save branding:", err);
      alert("Failed to save branding settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const tenantId = user?.tenant_id;
    if (!file || !user || !tenantId || !token) return;

    setUploadingLogo(true);
    try {
      const result = await FileUploadService.uploadToR2(file, "branding_logo", tenantId, token);
      setConfig({ ...config, logo_url: result.url });
    } catch (err) {
      console.error("Logo upload failed", err);
      alert("Logo upload failed.");
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Theme & Branding</h1>
        <p className="text-muted-foreground">Customize the look and feel of your platform for your users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Settings */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Color Palette
              </CardTitle>
              <CardDescription>Select the core colors that define your brand identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      className="w-12 h-10 p-1 cursor-pointer" 
                      value={config.primary_color}
                      onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                    />
                    <Input 
                      value={config.primary_color}
                      onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      className="w-12 h-10 p-1 cursor-pointer" 
                      value={config.accent_color}
                      onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                    />
                    <Input 
                      value={config.accent_color}
                      onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      className="w-12 h-10 p-1 cursor-pointer" 
                      value={config.background_color}
                      onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                    />
                    <Input 
                      value={config.background_color}
                      onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Imagery & Assets
              </CardTitle>
              <CardDescription>Upload your logo to appear on the sidebar and login screens.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-xl border-2 border-dashed flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 overflow-hidden relative">
                    {config.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={config.logo_url} alt="Logo" className="object-contain h-full w-full p-2" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-zinc-300" />
                    )}
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <Input 
                      type="file" 
                      accept="image/png, image/jpeg, image/svg+xml"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />
                    <p className="text-xs text-muted-foreground">Supported formats: PNG, JPG, SVG. Max size: 2MB.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Hide &quot;Powered by TestMaster&quot;</Label>
                  <p className="text-sm text-muted-foreground">Remove the watermarks (Requires Premium plan).</p>
                </div>
                <Switch 
                  checked={config.hide_powered_by}
                  onCheckedChange={(val) => setConfig({ ...config, hide_powered_by: val })}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 mt-4 py-4 px-6 border-t flex justify-between">
               <p className="text-sm text-muted-foreground">Don&apos;t forget to save your changes.</p>
               <Button onClick={handleSave} disabled={saving} className="gap-2">
                 {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 Save Preferences
               </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Live Preview */}
        <div className="md:col-span-1">
          <div className="sticky top-24 space-y-4">
            <h3 className="font-semibold px-1">Live Preview</h3>
            
            <div 
              className="rounded-2xl border shadow-sm overflow-hidden flex flex-col h-[400px]"
              style={{ backgroundColor: config.background_color }}
            >
              {/* Header chunk */}
              <div 
                className="h-16 px-4 flex items-center justify-between"
                style={{ backgroundColor: config.primary_color }}
              >
                 <div className="h-8 w-24 bg-white/20 rounded flex items-center px-2">
                    {config.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={config.logo_url} className="max-h-6 object-contain filter brightness-0 invert" alt="logo" />
                    )}
                 </div>
                 <div className="h-6 w-6 rounded-full bg-white/20" />
              </div>
              
              {/* Body chunk */}
              <div className="p-4 flex-1 space-y-4">
                <div className="h-6 w-3/4 rounded bg-zinc-900/10 dark:bg-white/10" />
                <div className="h-32 w-full rounded-xl bg-white shadow-sm flex flex-col justify-between p-3 border border-zinc-200/50">
                    <div className="h-4 w-1/2 rounded bg-zinc-100" />
                    <div className="flex gap-2 self-end">
                       <div className="h-8 w-8 rounded-full bg-zinc-100" />
                       <div 
                          className="h-8 w-20 rounded-md" 
                          style={{ backgroundColor: config.accent_color }} 
                       />
                    </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-2 px-4">
              This is an approximation. Actual components will use these colors as foundational variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
