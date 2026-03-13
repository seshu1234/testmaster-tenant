"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Calendar, 
  Search,
  MoreVertical,
  Paperclip,
  Check,
  CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  avatar_url: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export default function CommunicationsPage() {
  const { token, tenantSlug } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeachers() {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await api("/parent/communications/teachers", {
          token,
          tenant: tenantSlug || undefined
        });
        setTeachers(response.data || []);
        if (response.data?.length > 0) {
          setActiveTeacher(response.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTeachers();
  }, [token, tenantSlug]);

  useEffect(() => {
    async function fetchMessages() {
      if (!token || !activeTeacher) return;
      try {
        const response = await api(`/parent/communications/messages/${activeTeacher.id}`, {
          token,
          tenant: tenantSlug || undefined
        });
        setMessages(response.data || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    }
    fetchMessages();
  }, [token, tenantSlug, activeTeacher]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeTeacher || !token) return;
    
    try {
      // Optimistic update
      const tempId = Date.now().toString();
      const msg: Message = {
        id: tempId,
        senderId: 'me',
        text: newMessage,
        timestamp: new Date().toISOString(),
        isMe: true,
        status: 'sent'
      };
      setMessages([...messages, msg]);
      setNewMessage("");

      await api(`/parent/communications/messages/${activeTeacher.id}`, {
        method: 'POST',
        body: JSON.stringify({ text: newMessage }),
        token,
        tenant: tenantSlug || undefined
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] animate-in fade-in duration-700 bg-white dark:bg-zinc-950 rounded-[3rem] shadow-2xl overflow-hidden border dark:border-zinc-900 flex">
      {/* Sidebar: Teacher List */}
      <div className="w-[380px] border-r dark:border-zinc-900 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/10">
        <div className="p-8 space-y-6">
           <div>
              <h2 className="text-2xl font-black italic uppercase italic tracking-tighter">Engagement Hub</h2>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Direct link to subject experts</p>
           </div>
           
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                 placeholder="SEARCH MENTORS..." 
                 className="pl-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border-none shadow-inner text-[10px] font-black tracking-widest italic"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-2">
           {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl animate-pulse" />
              ))
           ) : teachers.map((teacher) => (
              <button
                 key={teacher.id}
                 className={cn(
                    "w-full p-4 rounded-2xl flex items-center gap-4 transition-all group",
                    activeTeacher?.id === teacher.id 
                       ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xl scale-[1.02]" 
                       : "hover:bg-white dark:hover:bg-zinc-900/50"
                 )}
                 onClick={() => setActiveTeacher(teacher)}
              >
                 <div className="relative shrink-0">
                    <div className="h-12 w-12 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
                       <Image 
                          src={teacher.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`} 
                          alt={teacher.name} 
                          width={48} height={48} 
                       />
                    </div>
                    {teacher.status === 'online' && (
                       <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950" />
                    )}
                 </div>
                 <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-start">
                       <h4 className="font-black text-xs uppercase italic tracking-tight truncate">{teacher.name}</h4>
                       <span className={cn(
                          "text-[8px] font-black uppercase opacity-60",
                          activeTeacher?.id === teacher.id ? "text-primary" : "text-zinc-400"
                       )}>{teacher.lastMessageTime}</span>
                    </div>
                    <p className={cn(
                       "text-[10px] font-black uppercase tracking-widest mt-0.5",
                       activeTeacher?.id === teacher.id ? "text-zinc-400" : "text-primary"
                    )}>{teacher.subject}</p>
                    <p className="text-[10px] font-medium opacity-60 truncate mt-1">{teacher.lastMessage}</p>
                 </div>
                 {teacher.unreadCount > 0 && activeTeacher?.id !== teacher.id && (
                    <Badge className="h-5 min-w-[20px] rounded-full bg-primary text-[10px] font-black flex items-center justify-center p-0 border-none">
                       {teacher.unreadCount}
                    </Badge>
                 )}
              </button>
           ))}
        </div>

        <div className="p-6 border-t dark:border-zinc-900">
           <Button variant="outline" className="w-full rounded-2xl border-dashed border-zinc-200 dark:border-zinc-800 font-black text-[10px] uppercase tracking-widest h-12">
              <Calendar className="mr-2 h-4 w-4" />
              SCHEDULE MEETING
           </Button>
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-900/50">
        {activeTeacher ? (
           <>
              {/* Header */}
              <div className="p-6 border-b dark:border-zinc-900 flex justify-between items-center bg-white dark:bg-zinc-950/50 backdrop-blur-md">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl overflow-hidden border dark:border-zinc-800">
                       <Image src={activeTeacher.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeTeacher.name}`} alt={activeTeacher.name} width={40} height={40} />
                    </div>
                    <div>
                       <h3 className="font-black text-sm uppercase italic tracking-tighter">{activeTeacher.name}</h3>
                       <div className="flex items-center gap-2">
                          <div className={cn("h-1.5 w-1.5 rounded-full", activeTeacher.status === 'online' ? "bg-emerald-500" : "bg-zinc-400")} />
                          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{activeTeacher.status === 'online' ? 'Active Matrix' : 'Archived'}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                       <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                       <MoreVertical className="h-4 w-4" />
                    </Button>
                 </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                 <div className="flex flex-col items-center mb-10">
                    <Badge variant="outline" className="rounded-full px-6 py-1 bg-white/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-[8px] font-black uppercase tracking-widest">
                       Secure Encryption Enabled
                    </Badge>
                 </div>

                 {messages.map((msg) => (
                    <div key={msg.id} className={cn(
                       "flex w-full group",
                       msg.isMe ? "justify-end" : "justify-start"
                    )}>
                       <div className={cn(
                          "max-w-[70%] space-y-2",
                          msg.isMe ? "items-end" : "items-start"
                       )}>
                          <div className={cn(
                             "p-6 rounded-[2rem] text-sm font-medium shadow-sm transition-all",
                             msg.isMe 
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-black rounded-tr-none hover:scale-[1.02]" 
                                : "bg-white dark:bg-zinc-950 rounded-tl-none border dark:border-zinc-900 hover:scale-[1.02]"
                          )}>
                             {msg.text}
                          </div>
                          <div className={cn(
                             "flex items-center gap-2 px-2",
                             msg.isMe ? "flex-row-reverse" : "flex-row"
                          )}>
                             <span className="text-[10px] font-black text-zinc-400 italic">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                             {msg.isMe && (
                                <div className="flex text-zinc-400">
                                   {msg.status === 'read' ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3" />}
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Chat Input */}
              <div className="p-8 bg-white dark:bg-zinc-950/50 backdrop-blur-md border-t dark:border-zinc-900">
                 <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-2 pl-6 rounded-[2.5rem] border dark:border-zinc-800 focus-within:ring-2 ring-primary transition-all">
                    <Paperclip className="h-5 w-5 text-zinc-400 cursor-pointer hover:text-primary transition-colors" />
                    <input 
                       className="flex-1 bg-transparent border-none outline-none py-3 text-sm font-medium placeholder:font-black placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest"
                       placeholder="TRANSMIT MESSAGE TO MENTOR..."
                       value={newMessage}
                       onChange={(e) => setNewMessage(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                       className="h-12 w-12 rounded-full bg-primary hover:scale-105 transition-transform"
                       size="icon"
                       onClick={handleSendMessage}
                    >
                       <Send className="h-5 w-5 text-white -rotate-45 -translate-y-0.5 translate-x-0.5" />
                    </Button>
                 </div>
              </div>
           </>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="h-24 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-[3rem] flex items-center justify-center">
                 <MessageSquare className="h-10 w-10 text-zinc-300" />
              </div>
              <div>
                 <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Transmission Lobby</h3>
                 <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">Select a mentor to initiate encrypted communication</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
