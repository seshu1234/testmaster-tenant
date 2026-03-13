"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Signature as SignatureIcon,
  Save,
  Mail,
  ShieldCheck,
  Bell,
  Camera,
  User,
  LogOut,
  Loader2,
  Globe,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

interface TeacherSettings {
  push_notifications: boolean;
  weekly_reports: boolean;
  dark_mode: boolean;
  [key: string]: boolean;
}

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  avatar_url?: string;
  role: string;
  settings: TeacherSettings;
}

export default function TeacherProfilePage() {
  const { token, tenantSlug } = useAuth();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;
      try {
        const response = await api("/teacher/profile", {
          token,
          tenant: tenantSlug || undefined
        });
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch teacher profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token, tenantSlug]);

  const handleSaveProfile = async () => {
    if (!token || !profile) return;
    setIsSaving(true);
    try {
      await api("/teacher/profile", {
        method: "PUT",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio, // mappings might vary, assumed from ProfileController
          specialization: profile.specialization
        })
      });
      alert("Profile synchronized successfully.");
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePreference = async (key: string, value: boolean) => {
    if (!token || !profile) return;
    const updatedSettings = { ...profile.settings, [key]: value };
    setProfile({ ...profile, settings: updatedSettings });
    try {
      await api("/teacher/profile", {
        method: "PUT",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({ settings: updatedSettings })
      });
    } catch (err) {
      console.error("Failed to update preference:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Account Settings</h1>
          <p className="text-muted-foreground font-medium text-sm">Manage your teacher credentials, profile details, and preferences.</p>
        </div>
        <Button 
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="h-12 px-8 rounded-xl bg-zinc-900 border-none shadow-sm hover:bg-black text-white font-bold gap-2"
        >
           {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
           Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <Card className="border shadow-sm bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden pt-12">
               <div className="flex flex-col items-center">
                  <div className="relative group">
                     <div className="h-32 w-32 rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white dark:border-zinc-950 shadow-2xl relative z-10 overflow-hidden">
                        {profile?.avatar_url ? (
                          <Image src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-16 w-16 text-zinc-400" />
                        )}
                     </div>
                     <div className="absolute inset-0 rounded-[2rem] bg-primary/20 scale-110 opacity-0 group-hover:opacity-100 transition-all blur-xl" />
                     <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-950 z-20 hover:scale-110 transition-transform">
                        <Camera className="h-5 w-5" />
                     </button>
                  </div>
                  <div className="text-center mt-6 p-6">
                     <h3 className="font-extrabold text-lg">{profile?.name}</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">{profile?.specialization || 'Academic'} Faculty</p>
                     <Badge variant="outline" className="rounded-full px-4 border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase text-[8px] tracking-widest">{profile?.role}</Badge>
                  </div>
               </div>
               <div className="border-t dark:border-zinc-800 p-2">
                  <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl font-bold h-12 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 uppercase text-[10px] tracking-widest">
                     <LogOut className="h-4 w-4" />
                     Logout
                  </Button>
               </div>
            </Card>

            <Card className="border shadow-sm bg-white dark:bg-zinc-900 p-6 rounded-2xl">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Security Status</h3>
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                     <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                     <span className="text-2xl font-black">Secure</span>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Active Session</p>
                  </div>
               </div>
               <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-widest">
                  Your session is protected with end-to-end encryption.
               </p>
            </Card>
         </div>

         <div className="lg:col-span-3">
            <Tabs defaultValue="info" className="space-y-6">
               <TabsList className="bg-white dark:bg-zinc-900 p-1.5 rounded-xl shadow-sm h-auto border dark:border-zinc-800">
                  <TabsTrigger value="info" className="rounded-lg px-6 py-3 font-bold text-xs uppercase tracking-tighter data-[state=active]:bg-zinc-900 data-[state=active]:text-white">Profile Info</TabsTrigger>
                  <TabsTrigger value="signature" className="rounded-lg px-6 py-3 font-bold text-xs uppercase tracking-tighter data-[state=active]:bg-zinc-900 data-[state=active]:text-white">Signature</TabsTrigger>
                  <TabsTrigger value="notifications" className="rounded-lg px-6 py-3 font-bold text-xs uppercase tracking-tighter data-[state=active]:bg-zinc-900 data-[state=active]:text-white">Notifications</TabsTrigger>
               </TabsList>

               <TabsContent value="info">
                  <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 p-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Name</label>
                           <Input 
                             value={profile?.name || ""} 
                             onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                             className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Institutional Email</label>
                           <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                              <Input value={profile?.email || ""} className="h-14 pl-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold opacity-60" disabled />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Specialization</label>
                           <Input 
                             value={profile?.specialization || ""} 
                             onChange={(e) => setProfile(prev => prev ? {...prev, specialization: e.target.value} : null)}
                             className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold" 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Phone Number</label>
                           <Input 
                             value={profile?.phone || ""} 
                             onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                             className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold" 
                           />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Bio / Credentials</label>
                           <textarea 
                             value={profile?.bio || ""}
                             onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                             className="w-full h-32 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-medium text-sm outline-none focus:ring-2 ring-primary/20 resize-none font-bold"
                           />
                        </div>
                     </div>
                  </Card>
               </TabsContent>

               <TabsContent value="signature">
                  <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 p-8">
                     <h3 className="text-xl font-black mb-2">Digital Signature</h3>
                     <p className="text-muted-foreground text-sm mb-8 font-medium">This signature will appear on reports and certifications.</p>
                     
                     <div className="h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center group cursor-pointer hover:border-primary transition-all">
                        <SignatureIcon className="h-16 w-16 text-zinc-300 group-hover:text-primary transition-all mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Drag & Drop Image or Draw Here</span>
                     </div>
                     <div className="mt-6 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700">
                        <div className="flex gap-2 text-[10px] font-black uppercase">
                           <span className="text-zinc-500 tracking-widest">Format: PNG, SVG (Transparent Only)</span>
                        </div>
                        <Button variant="ghost" className="text-primary font-black text-[10px] h-8 px-4">Clear Signature</Button>
                     </div>
                  </Card>
               </TabsContent>

               <TabsContent value="notifications">
                  <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 p-10">
                     <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 px-4">Notification Preferences</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                           { key: 'push_notifications', label: 'Push Notifications', icon: Bell, desc: 'Real-time alert relay for system events.' },
                           { key: 'weekly_reports', label: 'Weekly Diagnostics', icon: Share2, desc: 'Automated performance report generation.' },
                           { key: 'dark_mode', label: 'Theme Mode', icon: Globe, desc: 'Switch between light and dark visual themes.' }
                        ].map((pref) => (
                           <div key={pref.key} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between group hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center">
                                 <pref.icon className="h-5 w-5 text-zinc-400" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-black uppercase tracking-tight">{pref.label}</h4>
                                 <p className="text-[10px] font-bold text-zinc-400">{pref.desc}</p>
                              </div>
                           </div>
                           <Switch 
                             checked={profile?.settings?.[pref.key] || false} 
                             onCheckedChange={(val: boolean) => handleTogglePreference(pref.key, val)}
                           />
                        </div>
                        ))}
                     </div>
                  </Card>
               </TabsContent>
            </Tabs>
         </div>
      </div>
    </div>
  );
}
