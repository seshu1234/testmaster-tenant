"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";   
import { 
  Send,  
  MessageSquare, 
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  CheckCheck,
  Plus,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
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

interface Message {
  id: string;
  text: string;
  isMe: boolean;
  timestamp: string;
}

export default function TeacherCommunicationsPage() {
  const { token, tenantSlug } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);

  useEffect(() => {
    async function fetchChats() {
      if (!token) return;
      try {
        const response = await api("/teacher/communication", {
          token,
          tenant: tenantSlug || undefined
        });
        setChats(response.data);
        if (response.data.length > 0) {
          setSelectedChat(response.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
  }, [token, tenantSlug]);

  useEffect(() => {
    async function fetchMessages() {
      if (!token || !selectedChat) return;
      setMsgLoading(true);
      try {
        const response = await api(`/teacher/communication/messages/${selectedChat.id}`, {
          token,
          tenant: tenantSlug || undefined
        });
        setMessages(response.data);
      } catch (err) {
        console.warn("Signal interruption:", err);
        setMessages([]);
      } finally {
        setMsgLoading(false);
      }
    }
    fetchMessages();
  }, [token, tenantSlug, selectedChat]);

  const handleSendMessage = async () => {
    if (!token || !selectedChat || !messageText.trim()) return;
    const textToSend = messageText;
    setMessageText("");
    try {
      await api(`/teacher/communication/messages/${selectedChat.id}`, {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({ text: textToSend })
      });
      // Append optimistically
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        text: textToSend,
        isMe: true,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] -mt-2 -mx-8 overflow-hidden bg-white border-t">
       {/* Sidebar: Chat List */}
       <div className="w-80 border-r flex flex-col bg-zinc-50/50">
          <div className="p-4 border-b space-y-4 bg-white">
             <div className="flex items-center justify-between">
                <h2 className="text-zinc-600 font-black tracking-tight">Messages</h2>
                <Button variant="ghost" size="icon" className="rounded-full">
                   <Plus className="h-5 w-5 text-zinc-600" />
                </Button>
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  className="w-full pl-9 pr-4 py-2 border rounded-xl bg-zinc-50 border-none text-[10px] font-bold uppercase tracking-wider focus:ring-2 ring-primary/20 outline-none"
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
                    selectedChat?.id === chat.id ? "bg-white shadow-lg ring-1 ring-zinc-200" : "hover:bg-zinc-100"
                  )}
                >
                   <div className="relative">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-zinc-600",
                        chat.type === 'batch' ? "bg-indigo-500 shadow-indigo-500/20" : "bg-primary shadow-primary/20"
                      )}>
                         {chat.name.charAt(0)}
                      </div>
                      {chat.online && (
                         <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                         <span className="font-extrabold text-[11px] uppercase tracking-tighter truncate">{chat.name}</span>
                         <span className="text-[9px] font-bold text-zinc-600 uppercase">{chat.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-zinc-600 truncate font-medium">{chat.lastMessage}</p>
                   </div>
                   {chat.unread > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-zinc-600 shadow-xl ring-2 ring-white">
                         {chat.unread}
                      </div>
                   )}
                </div>
             ))}
          </div>
       </div>

       {/* Main: Chat View */}
       <div className="flex-1 flex flex-col items-center justify-center relative bg-white">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-6 z-10">
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center font-black text-zinc-600 shadow-md",
                      selectedChat.type === 'batch' ? "bg-indigo-500" : "bg-primary"
                    )}>
                       {selectedChat.name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="font-black uppercase text-zinc-600 tracking-tight">{selectedChat.name}</h3>
                       <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Online</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full"><Search className="h-4 w-4 text-zinc-600" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-4 w-4 text-zinc-600" /></Button>
                 </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 w-full overflow-y-auto p-8 space-y-6 flex flex-col pt-24">
                 {msgLoading ? (
                   <div className="flex-1 flex items-center justify-center">
                     <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
                   </div>
                 ) : messages.length > 0 ? (
                   messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-4 max-w-[80%]", msg.isMe ? "ml-auto flex-row-reverse" : "")}>
                       <div className={cn("h-8 w-8 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-[10px]", msg.isMe ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600")}>
                          {msg.isMe ? 'Y' : selectedChat.name.charAt(0)}
                       </div>
                       <div className={cn("space-y-1", msg.isMe ? "te" : "")}>
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{msg.isMe ? 'You' : selectedChat.name} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <div className={cn(
                            "p-4 rounded-2xl text-[11px] font-bold leading-relaxed shadow-sm",
                            msg.isMe ? "bg-primary text-white" : "bg-zinc-50 border text-zinc-600"
                          )}>
                             {msg.text}
                          </div>
                          {msg.isMe && (
                             <div className="flex justify-end gap-1 pt-1 opacity-50">
                                <CheckCheck className="h-3 w-3 text-zinc-600" />
                             </div>
                          )}
                       </div>
                    </div>
                   ))
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-4 opacity-30">
                     <MessageSquare className="h-10 w-10" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No messages yet.</p>
                   </div>
                 )}
              </div>

              {/* Chat Input */}
              <div className="p-6 w-full max-w-4xl">
                <div className="bg-zinc-50 rounded-[2rem] border shadow-2xl flex items-center px-6 gap-3 focus-within:ring-2 ring-primary/20 transition-all">
                   <Button variant="ghost" size="icon" className="rounded-full text-zinc-600"><Paperclip className="h-4 w-4" /></Button>
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="flex-1 bg-transparent border-none py-5 text-xl font-bold outline-none placeholder:text-[10px] placeholder:font-bold placeholder:uppercase placeholder:tracking-wider"
                     value={messageText}
                     onChange={(e) => setMessageText(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                   />
                   <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" className="rounded-full text-zinc-600 hidden md:flex"><Smile className="h-4 w-4" /></Button>
                     <Button 
                       onClick={handleSendMessage}
                       className="h-12 px-8 rounded-2xl shadow-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
                     >
                        SEND <Send className="h-4 w-4" />
                     </Button>
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-zinc-600">
               <div className="h-20 w-20 rounded-[2.5rem] bg-zinc-50 flex items-center justify-center mb-4">
                  <MessageSquare className="h-10 w-10" />
               </div>
                <p className="font-bold uppercase tracking-widest text-[10px]">Select a chat to start messaging</p>
            </div>
          )}
       </div>
    </div>
  );
}
