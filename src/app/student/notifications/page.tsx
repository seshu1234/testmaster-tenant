"use client";

import { useState, useEffect } from "react";
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
  Circle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  time: string;
  unread: boolean;
}

export default function StudentNotificationsPage() {
  const { token, tenantSlug } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      if (!token) return;
      setLoading(true);
      try {
        const response = await api(`/student/notifications?filter=${activeTab}`, {
          token,
          tenant: tenantSlug || undefined
        });
        setNotifications(response.data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [token, tenantSlug, activeTab]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await api(`/student/notifications/${id}/read`, {
        method: 'POST',
        token,
        tenant: tenantSlug || undefined
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-zinc-600 font-black tracking-tighter uppercase leading-none">Transmission Hub</h1>
          <p className="text-zinc-600 font-medium mt-2">Manage your updates, communications, and system alerts.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm">
           {['all', 'unread'].map((t) => (
             <button
               key={t}
               className={cn(
                 "px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                 activeTab === t 
                   ? "bg-zinc-900 text-white shadow-lg" 
                   : "te"
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
           {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Syncing with Hub...</p>
              </div>
           ) : notifications.length === 0 ? (
              <Card className="p-20 text-zinc-600 border-dashed border-2 border-zinc-100 bg-transparent">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">All transmissions cleared. You are up to date.</p>
              </Card>
           ) : (
             notifications.map((notif) => (
                <Card key={notif.id} className={cn(
                   "border shadow-md rounded-2xl bg-white overflow-hidden relative group hover:scale-[1.01] transition-all transform duration-300",
                   notif.unread && "border-l-4 border-primary"
                )}>
                   <div className="p-8 flex items-start gap-8">
                      <div className={cn(
                         "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform",
                         notif.type === 'test' ? 'bg-blue-50 te' :
                         notif.type === 'result' ? 'bg-emerald-50 te' :
                         notif.type === 'message' ? 'bg-amber-50 te' :
                         notif.type === 'achievement' ? 'bg-purple-50 te' :
                         'bg-rose-50 te'
                      )}>
                         {notif.type === 'test' ? <Calendar className="h-8 w-8" /> :
                          notif.type === 'result' ? <Target className="h-8 w-8" /> :
                          notif.type === 'message' ? <MessageCircle className="h-8 w-8" /> :
                          notif.type === 'achievement' ? <Trophy className="h-8 w-8" /> :
                          <AlertTriangle className="h-8 w-8" />}
                      </div>
  
                      <div className="flex-1 min-w-0 space-y-1">
                         <div className="flex justify-between items-start">
                            <h3 className={cn( "text-zinc-600 font-black uppercase tracking-tighter", notif.unread ? "te" : "te")}>
                               {notif.title}
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{notif.time}</span>
                         </div>
                         <p className="text-xl font-bold text-zinc-600 leading-relaxed max-w-lg truncate md:whitespace-normal">
                            {notif.body}
                         </p>
                      </div>
  
                      <div className="flex flex-col items-end justify-between h-16 shrink-0">
                         {notif.unread && <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                         <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-10 w-10 rounded-xl bg-zinc-50 hover:bg-primary  transition-all"
                            onClick={() => markAsRead(notif.id)}
                         >
                            <ChevronRight className="h-5 w-5" />
                         </Button>
                      </div>
                   </div>
                </Card>
             ))
           )}
           
           <Button variant="ghost" className="w-full mt-4 rounded-3xl h-16 border-2 border-dashed border-zinc-100 font-black text-[10px] uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-colors">
              Archive & Clear All Notifications
           </Button>
        </div>

        {/* Sidebar Status */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border shadow-md rounded-3xl bg-zinc-950 p-10 text-zinc-600 relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-zinc-600 font-black tracking-tighter leading-none uppercase">Hub Pulse</h3>
                    <p className="text-zinc-600 font-medium uppercase tracking-widest">Live System Activity</p>
                 </div>
                 
                 <div className="space-y-6">
                    {[
                       { label: 'Total Unread', val: notifications.filter(n => n.unread).length, icon: Bell, color: 'te' },
                       { label: 'Active Streams', val: 3, icon: Mail, color: 'te' },
                       { label: 'System Health', val: '99%', icon: Zap, color: 'te' }
                    ].map((s, i) => (
                       <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-4">
                             <s.icon className={cn("h-5 w-5", s.color)} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                          </div>
                          <span className="text-zinc-600 font-black">{s.val}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <Image 
                 src="https://images.unsplash.com/photo-485-d8c1af93d400?q=80&w=2070&auto=format&fit=crop" 
                 alt="Texture" 
                 className="absolute inset-0 object-cover opacity-5 group-hover:scale-110 transition-transform duration-1000"
                 fill
              />
           </Card>

           <Card className="border shadow-md rounded-2xl bg-white p-8 space-y-8">
              <h4 className="text-zinc-600 font-black uppercase tracking-tight">Active Preferences</h4>
              <div className="space-y-6">
                 {[
                    { label: 'Desktop Push', active: true },
                    { label: 'WhatsApp Sync', active: true },
                    { label: 'Email Recap', active: false },
                    { label: 'Global Alerts', active: true }
                 ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{pref.label}</span>
                       <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center",
                          pref.active ? "bg-emerald-500/10 text-zinc-600" : "bg-rose-500/10 text-zinc-600"
                       )}>
                          {pref.active ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                       </div>
                    </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest text-zinc-600 font-black hover:bg-primary/5 rounded-xl">
                 OPEN ADVANCED SETTINGS <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
