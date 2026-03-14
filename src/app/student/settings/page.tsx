"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Target, 
  Bell, 
  ShieldCheck, 
  Users, 
  Share2, 
  Mail, 
  Phone,
  Flame,
  Globe,
  Camera,
  LogOut,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

interface StudyGoal {
  target?: string;
  progress?: number;
  exam?: string;
}

interface StudentSettings {
  push_notifications: boolean;
  weekly_reports: boolean;
  dark_mode: boolean;
  [key: string]: boolean;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  batch?: string;
  level?: number;
  points?: number;
  streak?: number; 
  study_goal?: StudyGoal;
  settings: StudentSettings;
  avatar_url?: string;
}

interface ParentInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  last_activity: string;
}

export default function StudentSettingsPage() {
  const { token, tenantSlug } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'parent'>('profile');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [parent, setParent] = useState<ParentInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const [profRes, parentRes] = await Promise.all([
          api('/student/profile', { token, tenant: tenantSlug || undefined }),
          api('/student/parent-connect', { token, tenant: tenantSlug || undefined })
        ]);
        setProfile(profRes.data as StudentProfile);
        setParent(parentRes.data as ParentInfo);
      } catch (err) {
        console.error("Failed to fetch settings data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, tenantSlug]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
      };
      await api('/student/profile', {
        method: 'PUT',
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify(data)
      });
      // Refresh data
      const res = await api('/student/profile', { token, tenant: tenantSlug || undefined });
      setProfile(res.data as StudentProfile);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePreference = async (key: string, value: boolean) => {
    if (!token || !profile || !profile.settings) return;
    try {
      const newSettings = { ...profile.settings, [key]: value };
      await api('/student/profile', {
        method: 'PUT',
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({ settings: newSettings })
      });
      setProfile({ ...profile, settings: newSettings });
    } catch (err) {
      console.error("Failed to update preference:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-zinc-600 font-black tracking-tighter uppercase">Identity & Control</h1>
          <p className="text-zinc-600 font-medium">Manage your personal profile, study goals, and parent connectivity.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border shadow-sm">
           {['profile', 'parent'].map((t) => (
             <button
               key={t}
               className={cn(
                 "px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                 activeTab === t 
                   ? "bg-zinc-900 text-white shadow-lg" 
                   :  "text-zinc-600 "
               )}
                onClick={() => setActiveTab(t as 'profile' | 'parent')}
             >
               {t === 'profile' ? 'My Profile' : 'Parent Connect'}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {activeTab === 'profile' ? (
           <>
            {/* Profile Overview */}
            <div className="lg:col-span-4 space-y-8">
               <Card className="border shadow-md rounded-3xl bg-white p-8 flex flex-col items-center text-zinc-600">
                  <div className="relative group cursor-pointer mb-6">
                     <div className="h-32 w-32 rounded-3xl bg-primary flex items-center justify-center text-zinc-600 font-black text-zinc-600 shadow-2xl group-hover:scale-105 transition-all overflow-hidden border-4 border-white relative">
                        {profile?.avatar_url ? (
                           <Image src={profile.avatar_url} alt={profile.name || "Student Avatar"} fill className="object-cover" />
                        ) : (
                           profile?.name?.charAt(0)
                        )}
                     </div>
                     <div className="absolute inset-0 bg-black/40 rounded-3xl items-center justify-center hidden group-hover:flex">
                        <Camera className="h-8 w-8 text-zinc-600" />
                     </div>
                     <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center border-4 border-white">
                        <Flame className="h-4 w-4 text-zinc-600" />
                     </div>
                  </div>
                  <h3 className="text-zinc-600 font-black uppercase tracking-tight">{profile?.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{profile?.batch} • Level {profile?.level}</p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full mt-10">
                     <div className="bg-zinc-50 p-4 rounded-2xl border text-zinc-600">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Points</p>
                        <p className="text-zinc-600 font-black">{profile?.points}</p>
                     </div>
                     <div className="bg-zinc-50 p-4 rounded-2xl border text-zinc-600">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Streak</p>
                        <p className="text-zinc-600 font-black">{profile?.streak} Days</p>
                     </div>
                  </div>

                  <Button variant="ghost" className="w-full mt-8 rounded-2xl h-12 text-xl font-bold hover:bg-rose-50">
                     <LogOut className="h-4 w-4 mr-2" />
                     LOG OUT
                  </Button>
               </Card>

               <Card className="border shadow-md rounded-2xl bg-zinc-950 p-6 text-zinc-600 overflow-hidden relative">
                  <div className="relative z-10">
                     <h4 className="text-zinc-600 font-black uppercase tracking-widest text-zinc-600 mb-6">Study Goals</h4>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center bg-zinc-50 p-6 rounded-2xl">
                           <div className="flex items-center gap-4">
                              <Badge className="bg-primary/10 text-zinc-600 border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5">Primary Goal</Badge>
                              <h4 className="text-zinc-600 font-black uppercase tracking-tight">{profile?.study_goal?.target || 'Not Set'}</h4>
                           </div>
                           <TrendingUp className="h-5 w-5 text-zinc-600" />
                        </div>
                        <Progress value={profile?.study_goal?.progress || 0} className="h-6 rounded-xl bg-zinc-100" />
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-2 px-2">
                           <span>CURRENT PROGRESS</span>
                           <span>{profile?.study_goal?.progress || 0}%</span>
                        </div>
                     </div>
                  </div>
                  <Target className="absolute -bottom-10 -right-10 h-32 w-32 opacity-10 rotate-12" />
               </Card>

               <Card className="border shadow-md rounded-3xl bg-white p-8 flex flex-col gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                     <Target className="h-5 w-5 text-zinc-600" />
                  </div>
                  <h3 className="text-zinc-600 font-black uppercase tracking-tighter">Academic Focus</h3>
                  <p className="text-zinc-600 text-[10px] font-medium leading-relaxed uppercase tracking-widest">Targeting: {profile?.study_goal?.exam || 'N/A'}</p>
               </Card>
            </div>

            {/* Account Settings */}
            <div className="lg:col-span-8 space-y-8">
               <Card className="border shadow-md rounded-3xl bg-white p-8">
                  <h3 className="text-zinc-600 font-black uppercase tracking-tighter mb-8 px-4">Core Identification</h3>
                  <form onSubmit={handleSaveProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Full Legal Name</label>
                          <Input 
                            value={profile?.name || ""} 
                            onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="h-14 rounded-2xl bg-zinc-50 border-none font-bold px-6 focus:ring-2 focus:ring-primary/20 transition-all" 
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Electronic Mail</label>
                          <Input 
                            value={profile?.email || ""} 
                            readOnly
                            className="h-14 rounded-2xl bg-zinc-50 border-none font-bold px-6 opacity-60 cursor-not-allowed" 
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Phone Number</label>
                          <Input 
                            value={profile?.phone || ""} 
                            onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                            className="h-14 rounded-2xl bg-zinc-50 border-none font-bold px-6 focus:ring-2 focus:ring-primary/20 transition-all" 
                          />
                       </div>
                       <div className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4 mb-3">System Roles</h4>
                          <div className="flex gap-2 ml-2">
                            <Badge className="bg-zinc-100 text-zinc-600 border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5">{profile?.role}</Badge>
                          </div>
                       </div>
                    </div>
                    <div className="mt-10 flex gap-4">
                       <Button 
                         onClick={handleSaveProfile}
                         disabled={isSaving}
                         className="bg-primary text-white font-black px-10 h-14 rounded-2xl shadow-xl hover:scale-105 transition-all w-full md:w-auto"
                       >
                          {isSaving ? 'SYNCHRONIZING...' : 'SAVE CORE PROFILE'}
                       </Button>
                       <Button variant="ghost" className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest">DISCARD CHANGES</Button>
                    </div>
                  </form>
               </Card>

               <Card className="border shadow-md rounded-3xl bg-white p-8">
                  <h3 className="text-zinc-600 font-black uppercase tracking-tighter mb-8 px-4">Neural Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                        { key: 'push_notifications', label: 'Push Notifications', icon: Bell, desc: 'Real-time alert relay for system events.' },
                        { key: 'weekly_reports', label: 'Weekly Diagnostics', icon: Share2, desc: 'Automated performance report generation.' },
                        { key: 'dark_mode', label: 'High Contrast Mode', icon: Globe, desc: 'Optimized visual rendering for low-light ops.' }
                     ].map((pref) => (
                        <div key={pref.key} className="p-6 rounded-2xl bg-zinc-50 flex items-center justify-between group hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                              <pref.icon className="h-5 w-5 text-zinc-600" />
                           </div>
                           <div>
                              <h4 className="text-zinc-600 font-black uppercase tracking-tight">{pref.label}</h4>
                              <p className="text-[10px] font-bold text-zinc-600">{pref.desc}</p>
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
            </div>
           </>
        ) : (
           <>
            {/* Parent Connect View */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-8">
                  {parent ? (
                    <Card className="border shadow-md rounded-3xl bg-white p-8 relative overflow-hidden group">
                       <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                          <div className="h-40 w-40 rounded-3xl bg-zinc-50 border-4 border-dashed flex items-center justify-center p-4">
                             <Users className="h-16 w-16 text-zinc-600" />
                          </div>
                          <div className="flex-1 space-y-6">
                             <Badge className="bg-emerald-500/10 text-zinc-600 border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5">
                                {parent?.status}
                             </Badge>
                             <h2 className="text-zinc-600 font-black uppercase tracking-tighter">{parent?.name}</h2>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-zinc-600">
                                   <Mail className="h-4 w-4" />
                                   <span className="text-xl font-bold">{parent?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-zinc-600">
                                   <Phone className="h-4 w-4" />
                                   <span className="text-xl font-bold">{parent?.phone || 'No phone set'}</span>
                                </div>
                             </div>
                             <div className="flex gap-4">
                                <Button variant="outline" className="rounded-xl font-black text-[10px] h-10 px-6 border-zinc-200">
                                   UPDATE PERMISSIONS
                                </Button>
                                <Button variant="ghost" className="rounded-xl font-black text-[10px] h-10 px-6 text-zinc-600">
                                   REVOKE ACCESS
                                </Button>
                             </div>
                          </div>
                       </div>
                    </Card>
                  ) : (
                    <Card className="border shadow-md rounded-3xl bg-white p-8 flex flex-col items-center justify-center text-zinc-600 gap-6">
                       <Users className="h-16 w-16 text-zinc-600" />
                       <h3 className="text-zinc-600 font-black uppercase tracking-tighter">No Parent Account Linked</h3>
                       <p className="text-zinc-600 max-w-md">Connect with a guardian to share your academic victories and get performance support.</p>
                       <Button className="bg-primary text-white font-black px-10 h-14 rounded-2xl shadow-xl hover:scale-105 transition-all">
                          LINK A PARENT
                       </Button>
                    </Card>
                  )}

                  <Card className="border shadow-md rounded-3xl bg-white p-8">
                     <h3 className="text-zinc-600 font-black uppercase tracking-tighter mb-8">Shared Intelligence</h3>
                     <div className="space-y-2">
                        {parent ? [
                           { event: parent?.last_activity, detail: 'Latest sync successful', time: 'Just now' },
                        ].map((log, i) => (
                           <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-zinc-50 rounded-2xl transition-all group">
                              <div className="flex items-center gap-4">
                                 <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                 <div>
                                    <h4 className="text-zinc-600 font-black uppercase tracking-tight">{log.event}</h4>
                                    <p className="text-[10px] font-bold text-zinc-600">{log.detail}</p>
                                 </div>
                              </div>
                              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{log.time}</span>
                           </div>
                        )) : (
                          <div className="text-zinc-600 py-10 opacity-50 font-bold uppercase text-[10px]">No recent logs.</div>
                        )}
                     </div>
                  </Card>
               </div>

               <div className="space-y-8">
                  <Card className="border shadow-md rounded-2xl bg-zinc-900 p-6 text-zinc-600 relative overflow-hidden group">
                     <div className="relative z-10 text-zinc-600 space-y-6">
                        <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                           <TrendingUp className="h-8 w-8 text-zinc-600" />
                        </div>
                        <h3 className="text-zinc-600 font-black uppercase tracking-tighter">Transparency</h3>
                        <p className="text-zinc-600 font-medium leading-relaxed">
                           Connecting a parent account ensures they stay in the loop with your progress and achievements.
                        </p>
                        <Button className="w-full bg-primary text-white font-black rounded-2xl h-12 text-[10px] hover:scale-105 transition-all">
                           INVITE ANOTHER PARENT
                        </Button>
                     </div>
                     <ShieldCheck className="absolute -bottom-10 -right-10 h-40 w-40 opacity-5 rotate-12" />
                  </Card>
               </div>
            </div>
           </>
        )}
      </div>
    </div>
  );
}
