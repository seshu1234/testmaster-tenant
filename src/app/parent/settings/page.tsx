"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  Globe, 
  LogOut,
  ChevronRight,
  Fingerprint,
  Mail,
  Zap,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

export default function ParentSettingsPage() {
  const { user, token, logout, tenantSlug } = useAuth();
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_alerts: false,
    whatsapp_sync: true,
    two_factor: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      if (!token) return;
      try {
        const response = await api("/v1/parent/settings", {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.data && response.data.settings) {
          setSettings(response.data.settings);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    }
    fetchSettings();
  }, [token, tenantSlug]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      await api("/v1/parent/settings", {
        method: "PUT",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({ settings })
      });
      // Toast or success feedback would go here
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div>
         <h1 className="text-3xl font-black tracking-tighter italic uppercase">Guardian Configurations</h1>
         <p className="text-muted-foreground text-sm font-medium">Managing security parameters and communication protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-950 text-white p-10 flex flex-col items-center text-center overflow-hidden relative">
              <div className="relative z-10 space-y-6">
                 <div className="h-32 w-32 rounded-[3.5rem] bg-primary p-1 shadow-2xl relative">
                    <Image 
                       src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                       alt={user.name} 
                       width={128} height={128} 
                       className="rounded-[3.3rem] object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-2xl border-4 border-zinc-950 flex items-center justify-center">
                       <Shield className="h-5 w-5 text-white" />
                    </div>
                 </div>
                 
                 <div>
                    <h2 className="text-3xl font-black italic uppercase italic tracking-tighter leading-none">{user.name}</h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2 italic">Authorized Guardian</p>
                 </div>

                 <div className="space-y-3 w-full">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                       <Mail className="h-4 w-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                       <Smartphone className="h-4 w-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest">+91 ••••• ••420</span>
                    </div>
                 </div>

                 <Button variant="ghost" className="w-full text-rose-500 font-bold hover:bg-rose-500/10 rounded-2xl h-12" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    REVOKE ACCESS
                 </Button>
              </div>
              <User className="absolute -bottom-20 -left-20 h-64 w-64 text-white opacity-5 rotate-12" />
           </Card>

           <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-600 p-8 text-white">
              <Zap className="h-10 w-10 mb-6 opacity-40" />
              <h3 className="text-xl font-black italic uppercase italic tracking-tighter mb-2">Premium Matrix</h3>
              <p className="text-white/70 text-xs font-medium leading-relaxed mb-6">
                 Your subscription is active until <span className="text-white font-black italic">Dec 2026</span>. Full AI telemetry unlocked.
              </p>
              <Button className="w-full bg-white text-primary font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest">
                 <CreditCard className="mr-2 h-4 w-4" />
                 MANAGE BILLING
              </Button>
           </Card>
        </div>

        {/* Configurations List */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-2xl rounded-[3rem] bg-white dark:bg-zinc-950 overflow-hidden">
              <CardHeader className="p-10 border-b bg-zinc-50/50 dark:bg-zinc-900/30">
                 <div className="flex justify-between items-center">
                    <div>
                       <CardTitle className="text-2xl font-black tracking-tighter uppercase italic">Control Panel</CardTitle>
                       <CardDescription className="font-bold text-[10px] uppercase tracking-widest mt-1">Configure your experience and data flow</CardDescription>
                    </div>
                    <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5">
                       Sync Active
                    </Badge>
                 </div>
              </CardHeader>
              <CardContent className="p-10">
                 <div className="space-y-8">
                    {/* Security */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 mb-6">
                          <Fingerprint className="h-5 w-5 text-primary" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Security & Privacy</h4>
                       </div>
                       
                       <div className="flex justify-between items-center p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                          <div className="space-y-0.5">
                             <p className="font-black text-xs uppercase italic tracking-tight">Biometric Verification</p>
                             <p className="text-[10px] font-medium text-zinc-400">Require fingerprint for high-stakes result viewing.</p>
                          </div>
                          <Switch 
                             checked={settings.two_factor} 
                             onCheckedChange={() => handleToggle('two_factor')}
                             className="data-[state=checked]:bg-primary"
                          />
                       </div>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 mb-6">
                          <Bell className="h-5 w-5 text-primary" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Transmission Protocols</h4>
                       </div>
                       
                       {[
                         { id: 'email_notifications', label: 'E-Mail Transmission', desc: 'Detailed weekly performance archives.', active: settings.email_notifications },
                         { id: 'whatsapp_sync', label: 'WhatsApp Velocity', desc: 'Instant score alerts and attendance logs.', active: settings.whatsapp_sync },
                         { id: 'sms_alerts', label: 'Legacy SMS Sync', desc: 'Critical alerts via cellular network.', active: settings.sms_alerts },
                       ].map((pref) => (
                          <div key={pref.id} className="flex justify-between items-center p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                             <div className="space-y-0.5">
                                <p className="font-black text-xs uppercase italic tracking-tight">{pref.label}</p>
                                <p className="text-[10px] font-medium text-zinc-400">{pref.desc}</p>
                             </div>
                              <Switch 
                                 checked={pref.active} 
                                 onCheckedChange={() => handleToggle(pref.id as keyof typeof settings)}
                                 className="data-[state=checked]:bg-primary"
                              />
                          </div>
                       ))}
                    </div>

                    {/* Interface */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 mb-6">
                          <Globe className="h-5 w-5 text-primary" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Terminal interface</h4>
                       </div>
                       
                       <div className="flex justify-between items-center p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-800 transition-all border border-transparent">
                          <div className="space-y-0.5">
                             <p className="font-black text-xs uppercase italic tracking-tight">Regional Optimization</p>
                             <p className="text-[10px] font-medium text-zinc-400">Currently set to English (Standard).</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-400" />
                       </div>
                    </div>
                 </div>
                                  <div className="mt-12 flex justify-end">
                     <Button 
                        disabled={isSaving}
                        onClick={saveSettings}
                        className="h-14 px-12 rounded-[2rem] bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                     >
                        {isSaving ? "SYCHRONIZING..." : "SAVE GLOBAL CONFIGS"}
                     </Button>
                  </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
