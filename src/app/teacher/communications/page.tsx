"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";   
import { 
  Send,  
  MessageSquare, 
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  CheckCheck,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  name: string;
  type: 'batch' | 'direct';
  lastMessage: string;
  timestamp: string;
  unread: number;
  online?: boolean;
}

export default function TeacherCommunicationsPage() {
  const { user } = useAuth();
  const [chats] = useState<Chat[]>([
    { id: '1', name: 'IIT-JEE Batch A', type: 'batch', lastMessage: 'Rahul: Sir, when is the next mock test?', timestamp: '10:45 AM', unread: 3 },
    { id: '2', name: 'NEET Practice Group', type: 'batch', lastMessage: 'Anita: Thank you for the notes!', timestamp: '9:30 AM', unread: 0 },
    { id: '3', name: 'Rahul Sharma', type: 'direct', lastMessage: 'I have a doubt in Physics Ch-3', timestamp: 'Yesterday', unread: 1, online: true },
  ]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(user ? chats[0] : null);
  const [message, setMessage] = useState("");

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-140px)] -mt-2 -mx-8 overflow-hidden bg-white dark:bg-zinc-950 border-t">
       {/* Sidebar: Chat List */}
       <div className="w-80 border-r flex flex-col bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="p-4 border-b space-y-4 bg-white dark:bg-zinc-950">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight">Messages</h2>
                <Button variant="ghost" size="icon" className="rounded-full">
                   <Plus className="h-5 w-5" />
                </Button>
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search batches or students..." 
                  className="w-full pl-9 pr-4 py-2 border rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none text-xs focus:ring-2 ring-primary/20 outline-none"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {chats.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 relative group",
                    selectedChat?.id === chat.id ? "bg-white dark:bg-zinc-800 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                  )}
                >
                   <div className="relative">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-white",
                        chat.type === 'batch' ? "bg-indigo-500" : "bg-primary"
                      )}>
                         {chat.name.charAt(0)}
                      </div>
                      {chat.online && (
                         <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950" />
                      )}
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                         <span className="font-bold text-sm truncate">{chat.name}</span>
                         <span className="text-[10px] text-zinc-400">{chat.timestamp}</span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{chat.lastMessage}</p>
                   </div>
                   {chat.unread > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-lg ring-2 ring-white dark:ring-zinc-900">
                         {chat.unread}
                      </div>
                   )}
                </div>
             ))}
          </div>
       </div>

       {/* Main: Chat View */}
       <div className="flex-1 flex flex-col items-center justify-center relative bg-zinc-50/20 dark:bg-zinc-950/20">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-950 border-b flex items-center justify-between px-6 z-10 shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg",
                      selectedChat.type === 'batch' ? "bg-indigo-500" : "bg-primary"
                    )}>
                       {selectedChat.name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="font-extrabold tracking-tight">{selectedChat.name}</h3>
                       <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{selectedChat.online ? 'Online' : '15 Students Active'}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full"><Search className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-5 w-5" /></Button>
                 </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 w-full overflow-y-auto p-8 space-y-6 flex flex-col pt-24">
                 <div className="flex justify-center mb-8">
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-zinc-500">Today</span>
                 </div>
                 
                 <div className="flex gap-4 max-w-[80%]">
                    <div className="h-8 w-8 rounded-full bg-zinc-100 flex-shrink-0" />
                    <div className="space-y-1">
                       <span className="text-[10px] font-bold text-zinc-400 ml-2">Rahul Sharma • 10:45 AM</span>
                       <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl rounded-tl-none shadow-sm border border-zinc-100 dark:border-zinc-800 font-medium text-sm leading-relaxed">
                          Sir, how do we approach the problem of magnetic flux in a variable area loop?
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
                    <div className="h-8 w-8 rounded-full bg-primary flex-shrink-0" />
                    <div className="space-y-1 text-right">
                       <span className="text-[10px] font-bold text-zinc-400 mr-2">You • 10:48 AM</span>
                       <div className="bg-zinc-900 border dark:bg-primary p-4 rounded-2xl rounded-tr-none shadow-xl text-white font-medium text-sm leading-relaxed">
                          Remember to apply Faraday&apos;s Law using the rate of change of area. Check the solved example in Chapter 4, Page 112.
                       </div>
                       <div className="flex justify-end gap-1 pt-1">
                          <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white dark:border-black shadow-sm">
                             <CheckCheck className="h-2.5 w-2.5 text-white" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Chat Input */}
              <div className="absolute bottom-6 left-6 right-6 flex gap-3 z-10">
                 <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border shadow-xl flex items-center px-4 gap-2 focus-within:ring-2 ring-primary/20 transition-all">
                    <Button variant="ghost" size="icon" className="rounded-full text-zinc-400"><Paperclip className="h-5 w-5" /></Button>
                    <input 
                      type="text" 
                      placeholder="Typing to Class..." 
                      className="flex-1 bg-transparent border-none py-4 text-sm font-medium outline-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" className="rounded-full text-zinc-400"><Smile className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-zinc-400"><Mic className="h-5 w-5" /></Button>
                 </div>
                 <Button className="h-14 w-14 rounded-2xl shadow-xl flex items-center justify-center p-0" onClick={() => setMessage("")}>
                    <Send className="h-6 w-6" />
                 </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-zinc-300">
               <MessageSquare className="h-16 w-16" />
               <p className="font-black uppercase tracking-widest">Select a channel to begin</p>
            </div>
          )}
       </div>
    </div>
  );
}
