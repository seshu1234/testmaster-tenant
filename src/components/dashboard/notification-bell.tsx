"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Award, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'test' | 'result' | 'badge' | 'announcement';
  read: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Test Starting Soon', description: 'Advanced Physics Mock starts in 30 minutes.', time: '30m ago', type: 'test', read: false },
    { id: '2', title: 'Result Published', description: 'Vector Algebra Quiz results are now available.', time: '2h ago', type: 'result', read: true },
    { id: '3', title: 'New Badge Earned!', description: 'You unlocked the "Fire Streak" achievement.', time: '1d ago', type: 'badge', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'test': return <Clock className="h-4 w-4 text-primary" />;
      case 'result': return <FileText className="h-4 w-4 text-emerald-500" />;
      case 'badge': return <Award className="h-4 w-4 text-amber-500" />;
      default: return <Bell className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800">
          <Bell className="h-5 w-5 text-zinc-500" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-[1.5rem] p-4 shadow-2xl border-none bg-white dark:bg-zinc-950" align="end">
        <div className="flex items-center justify-between mb-4 px-2">
           <DropdownMenuLabel className="p-0 font-black italic uppercase text-xs tracking-widest">Notifications</DropdownMenuLabel>
           <Button variant="ghost" className="h-auto p-0 text-[10px] font-black uppercase text-primary hover:bg-transparent" onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}>
              Mark all as read
           </Button>
        </div>
        <DropdownMenuSeparator className="mb-4" />
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem 
               key={notification.id} 
               className={cn(
                  "flex items-start gap-4 p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                  !notification.read ? "bg-primary/5 border-primary/10" : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
               )}
            >
              <div className={cn(
                 "mt-1 shrink-0 h-8 w-8 rounded-xl flex items-center justify-center",
                 !notification.read ? "bg-primary/20" : "bg-zinc-100 dark:bg-zinc-800"
              )}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-black tracking-tight">{notification.title}</p>
                <p className="text-[10px] text-muted-foreground leading-tight font-medium">{notification.description}</p>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">{notification.time}</p>
              </div>
              {!notification.read && <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />}
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-4" />
        <Button variant="ghost" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400">
           View All Notifications
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
