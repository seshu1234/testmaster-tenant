"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  Signature as SignatureIcon,
  Save,
  Clock,
  Mail,
  ShieldCheck,
  Bell,
  Fingerprint,
  Camera,
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeacherProfilePage() {
  const [profile] = useState({
    name: "Dr. Arvind Kumar",
    email: "arvind@testmaster.in",
    subject: "Physics",
    qualification: "Ph.D. in Theoretical Physics",
    office_hours: "Mon-Fri, 4-6 PM"
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Account & Preference</h1>
          <p className="text-muted-foreground font-medium text-sm">Manage your teacher credentials, signature, and availability.</p>
        </div>
        <Button className="h-12 px-8 rounded-2xl bg-zinc-900 border-none shadow-2xl hover:bg-black text-white font-bold gap-2">
           <Save className="h-4 w-4" />
           SAVE CHANGES
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden pt-12">
               <div className="flex flex-col items-center">
                  <div className="relative group">
                     <div className="h-32 w-32 rounded-[2rem] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white dark:border-zinc-950 shadow-2xl relative z-10">
                        <User className="h-16 w-16 text-zinc-400" />
                     </div>
                     <div className="absolute inset-0 rounded-[2rem] bg-primary/20 scale-110 opacity-0 group-hover:opacity-100 transition-all blur-xl" />
                     <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-950 z-20 hover:scale-110 transition-transform">
                        <Camera className="h-5 w-5" />
                     </button>
                  </div>
                  <div className="text-center mt-6 p-6">
                     <h3 className="font-extrabold text-lg">{profile.name}</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">{profile.subject} HOD</p>
                     <Badge variant="outline" className="rounded-full px-4 border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold">Standard Plan</Badge>
                  </div>
               </div>
               <div className="border-t dark:border-zinc-800 p-2">
                  <Button variant="ghost" className="w-full justify-start gap-3 rounded-2xl font-bold h-12 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                     <LogOut className="h-4 w-4" />
                     LOG OUT
                  </Button>
               </div>
            </Card>

            <Card className="border-none shadow-xl bg-zinc-900 text-white p-6 rounded-3xl">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Security Score</h3>
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                     <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                     <span className="text-2xl font-black">92%</span>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Excellent Protection</p>
                  </div>
               </div>
               <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                  Dual-layer encryption enabled. Last password change was 22 days ago.
               </p>
            </Card>
         </div>

         <div className="lg:col-span-3">
            <Tabs defaultValue="info" className="space-y-6">
               <TabsList className="bg-white dark:bg-zinc-900 p-1.5 rounded-2xl shadow-xl h-auto border dark:border-zinc-800">
                  <TabsTrigger value="info" className="rounded-xl px-6 py-3 font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Professional Info</TabsTrigger>
                  <TabsTrigger value="security" className="rounded-xl px-6 py-3 font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Security</TabsTrigger>
                  <TabsTrigger value="signature" className="rounded-xl px-6 py-3 font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white">E-Signature</TabsTrigger>
                  <TabsTrigger value="notifications" className="rounded-xl px-6 py-3 font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Alerts</TabsTrigger>
               </TabsList>

               <TabsContent value="info">
                  <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-zinc-950 p-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Full Identity Name</label>
                           <Input value={profile.name} className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Institutional Email</label>
                           <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                              <Input value={profile.email} className="h-14 pl-11 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold" disabled />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Specialization</label>
                           <Input value={profile.subject} className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Available Hours</label>
                           <div className="relative">
                              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                              <Input value={profile.office_hours} className="h-14 pl-11 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold" />
                           </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Degrees & Qualifications</label>
                           <textarea className="w-full h-32 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none font-medium text-sm outline-none focus:ring-2 ring-primary/20 resize-none">
                              {profile.qualification}
                           </textarea>
                        </div>
                     </div>
                  </Card>
               </TabsContent>

               <TabsContent value="signature">
                  <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-zinc-950 p-8">
                     <h3 className="text-xl font-black mb-2 italic">Official Signature</h3>
                     <p className="text-muted-foreground text-sm mb-8 font-medium">This signature will appear on all branded result cards and student PDFs.</p>
                     
                     <div className="h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center group cursor-pointer hover:border-primary transition-all">
                        <SignatureIcon className="h-16 w-16 text-zinc-300 group-hover:text-primary transition-all mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Drag & Drop Image or Draw Here</span>
                     </div>
                     <div className="mt-6 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        <div className="flex gap-2 text-[10px] font-black uppercase">
                           <span className="text-zinc-500 tracking-widest italic">Format: PNG, SVG (Transparent Only)</span>
                        </div>
                        <Button variant="ghost" className="text-primary font-black text-[10px] h-8 px-4">CLEAR CANVAS</Button>
                     </div>
                  </Card>
               </TabsContent>

               <TabsContent value="security">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem]">
                        <h4 className="font-extrabold mb-6 flex items-center gap-3">
                           <Fingerprint className="h-5 w-5 text-primary" />
                           2FA AUTHENTICATION
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium mb-8">
                           Add an extra layer of security to your teacher account using an authenticator app.
                        </p>
                        <Button className="w-full h-12 rounded-xl font-bold">ENABLE 2FA</Button>
                     </Card>
                     <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem]">
                        <h4 className="font-extrabold mb-6 flex items-center gap-3">
                           <Bell className="h-5 w-5 text-primary" />
                           LOGIN ALERTS
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium mb-8">
                           Receive instant push notifications for every new login session.
                        </p>
                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2">CONFIGURE DEVICE</Button>
                     </Card>
                  </div>
               </TabsContent>
            </Tabs>
         </div>
      </div>
    </div>
  );
}
