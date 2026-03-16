"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Award, FileText, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'test' | 'result' | 'badge' | 'announcement';
  read: boolean;
}

interface RawNotification {
  id?: string;
  title?: string;
  body?: string;
  description?: string;
  time?: string;
  type?: string;
  unread?: boolean;
}

export function NotificationBell() {
  const { user, token, tenantSlug } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchNotifications() {
      if (!user || !token) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const response = await api(`/${user.role}/notifications?filter=unread`, {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success && Array.isArray(response.data) && isMounted) {
          setNotifications(response.data.map((n: RawNotification) => ({
            id: n.id || String(Math.random()),
            title: n.title || 'System Alert',
            description: n.body || n.description || '',
            time: n.time || 'Just now',
            type: n.type || 'info',
            read: n.unread === false
          })));
        }
      } catch {
        // Notifications endpoint may not exist for all roles — fail silently
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchNotifications();
    return () => { isMounted = false; };
  }, [user, token, tenantSlug]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'test': return <Clock className="h-4 w-4 text-zinc-600" />;
      case 'result': return <FileText className="h-4 w-4 text-zinc-600" />;
      case 'badge': return <Award className="h-4 w-4 text-zinc-600" />;
      default: return <Bell className="h-4 w-4 text-zinc-600" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl bg-zinc-50 border">
          <Bell className="h-5 w-5 text-zinc-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-[1.5rem] p-4 shadow-2xl border-none bg-white" align="end">
        <div className="flex items-center justify-between mb-4 px-2">
           <DropdownMenuLabel className="p-0 font-black  uppercase text-zinc-600 tracking-widest">Notifications</DropdownMenuLabel>
           <Button variant="ghost" className="h-auto p-0 text-[10px] font-black uppercase text-zinc-600 hover:bg-transparent" onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}>
              Mark all as read
           </Button>
        </div>
        <DropdownMenuSeparator className="mb-4" />
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {loading ? (
             <div className="flex justify-center items-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
             </div>
          ) : notifications.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-8 text-zinc-600 space-y-2">
                <Info className="h-6 w-6 text-zinc-600" />
                <p className="text-zinc-600 font-medium">No new notifications</p>
             </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                 key={notification.id} 
                 className={cn(
                    "flex items-start gap-4 p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                    !notification.read ? "bg-primary/5 border-primary/10" : "hover:bg-zinc-50"
                 )}
              >
                <div className={cn(
                   "mt-1 shrink-0 h-8 w-8 rounded-xl flex items-center justify-center",
                   !notification.read ? "bg-primary/20" : "bg-zinc-100"
                )}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-zinc-600 font-black tracking-tight">{notification.title}</p>
                  <p className="text-[10px] text-zinc-600 leading-tight font-medium">{notification.description}</p>
                  <p className="text-[9px] text-xl font-bold uppercase tracking-tighter">{notification.time}</p>
                </div>
                {!notification.read && <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />}
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="my-4" />
        <Button variant="ghost" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600">
           View All Notifications
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
