"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  Bell, 
  Target, 
  Trophy, 
  MessageCircle, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  Zap,
  ChevronRight,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

const notifications = [
  { id: '1', title: 'New Mock Test Released', body: 'JEE Main Full Test #42 is now available for your batch.', type: 'test', time: '2 mins ago', unread: true },
  { id: '2', title: 'Result Published', body: 'Physics Unit Test: Ionic Equilibrium results are out. You scored 88%.', type: 'result', time: '2 hours ago', unread: true },
  { id: '3', title: 'Teacher Message', body: 'Mr. Verma added a new study sheet in the Mechanics vault.', type: 'message', time: '5 hours ago', unread: false },
  { id: '4', title: 'Badge Unlocked', body: 'Congratulations! You earned the "Early Bird" achievement.', type: 'achievement', time: 'Yesterday', unread: false },
  { id: '5', title: 'Schedule Update', body: 'Chemistry class scheduled for 4:00 PM today has been postponed.', type: 'alert', time: 'Yesterday', unread: false }
];

export default function StudentNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return n.unread;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase italic leading-none">Transmission Hub</h1>
          <p className="text-muted-foreground text-sm font-medium mt-2">Manage your updates, communications, and system alerts.</p>
        </div>
        <div className="flex bg-white dark:bg-zinc-950 p-1.5 rounded-2xl border dark:border-zinc-800 shadow-sm">
           {['all', 'unread'].map((t) => (
             <button
               key={t}
               className={cn(
                 "px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                 activeTab === t 
                   ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg" 
                   : "text-zinc-500"
               )}
               onClick={() => setActiveTab(t as 'all' | 'unread')}
             >
               {t}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Notification Feed */}
        <div className="lg:col-span-8 space-y-4">
           {filteredNotifications.map((notif) => (
              <Card key={notif.id} className={cn(
                 "border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 overflow-hidden relative group hover:scale-[1.01] transition-all transform duration-300",
                 notif.unread && "border-l-4 border-primary"
              )}>
                 <div className="p-8 flex items-start gap-8">
                    <div className={cn(
                       "h-16 w-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform",
                       notif.type === 'test' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' :
                       notif.type === 'result' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                       notif.type === 'message' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                       notif.type === 'achievement' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-500' :
                       'bg-rose-50 dark:bg-rose-500/10 text-rose-500'
                    )}>
                       {notif.type === 'test' ? <Calendar className="h-8 w-8" /> :
                        notif.type === 'result' ? <Target className="h-8 w-8" /> :
                        notif.type === 'message' ? <MessageCircle className="h-8 w-8" /> :
                        notif.type === 'achievement' ? <Trophy className="h-8 w-8" /> :
                        <AlertTriangle className="h-8 w-8" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                       <div className="flex justify-between items-start">
                          <h3 className={cn("text-xl font-black italic uppercase italic tracking-tighter", notif.unread ? "text-zinc-900 dark:text-white" : "text-zinc-500")}>
                             {notif.title}
                          </h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{notif.time}</span>
                       </div>
                       <p className="text-xs font-bold text-zinc-400 italic leading-relaxed max-w-lg truncate md:whitespace-normal">
                          {notif.body}
                       </p>
                    </div>

                    <div className="flex flex-col items-end justify-between h-16 shrink-0">
                       {notif.unread && <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                       <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-primary hover:text-white transition-all">
                          <ChevronRight className="h-5 w-5" />
                       </Button>
                    </div>
                 </div>
              </Card>
           ))}
           
           <Button variant="ghost" className="w-full mt-4 rounded-3xl h-16 border-2 border-dashed border-zinc-100 dark:border-zinc-900 font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              Archive & Clear All Read Notifications
           </Button>
        </div>

        {/* Sidebar Status */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-950 p-10 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-4xl font-black italic tracking-tighter leading-none italic uppercase">Hub Pulse</h3>
                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Live System Activity</p>
                 </div>
                 
                 <div className="space-y-6">
                    {[
                       { label: 'Unread Alerts', val: 2, icon: Bell, color: 'text-primary' },
                       { label: 'Teacher Comms', val: 1, icon: Mail, color: 'text-blue-500' },
                       { label: 'System Health', val: '99%', icon: Zap, color: 'text-emerald-500' }
                    ].map((s, i) => (
                       <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-4">
                             <s.icon className={cn("h-5 w-5", s.color)} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                          </div>
                          <span className="text-lg font-black italic italic">{s.val}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <Image 
                 src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop" 
                 alt="Texture" 
                 className="absolute inset-0 object-cover opacity-5 group-hover:scale-110 transition-transform duration-1000"
                 fill
              />
           </Card>

           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 p-8 space-y-8">
              <h4 className="text-sm font-black uppercase italic italic tracking-tight">Active Preferences</h4>
              <div className="space-y-6">
                 {[
                    { label: 'Desktop Push', active: true },
                    { label: 'WhatsApp Sync', active: true },
                    { label: 'Email Recap', active: false },
                    { label: 'Global Alerts', active: true }
                 ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{pref.label}</span>
                       <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center",
                          pref.active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                       )}>
                          {pref.active ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                       </div>
                    </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest text-primary font-black hover:bg-primary/5 rounded-xl">
                 OPEN ADVANCED SETTINGS <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
