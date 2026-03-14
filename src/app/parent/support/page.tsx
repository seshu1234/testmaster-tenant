"use client";

import { useState, useEffect } from "react";
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Phone, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "How do I link a second child to my account?", a: "Navigate to Settings > Child Linking and enter the unique Student ID provided by the centre." },
  { q: "What does 'Accuracy' represent in results?", a: "Accuracy is the percentage of correct answers vs total questions attempted in a specific assessment." },
  { q: "Can I download consolidated reports?", a: "Yes, use the 'Export All' button in the Results History or the 'Download PDF' button in a Detailed Result view." },
  { q: "How to schedule a mentor meeting?", a: "Go to Communications, select a mentor, and click 'Schedule Meeting' to see available slots." },
];

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  updated_at: string;
}

export default function SupportPage() {
  const { token, tenantSlug } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function fetchTickets() {
      if (!token) return;
      try {
        const response = await api("/parent/support", {
          token,
          tenant: tenantSlug || undefined
        });
        // Handle pagination if needed, but for now just data
        setTickets(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, [token, tenantSlug]);

  const handleCreateTicket = async () => {
    if (!token) return;
    setIsCreating(true);
    try {
      await api("/parent/support", {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          subject: "Support Request from Parent Portal",
          description: "Guardian requested assistance via Support Command Center.",
          priority: "medium",
          category: "technical"
        })
      });
      // Refresh tickets
      const refreshRes = await api("/parent/support", {
        token,
        tenant: tenantSlug || undefined
      });
      setTickets(refreshRes.data || refreshRes.data?.data || []);
      alert("Support ticket initiated! An agent will contact you shortly.");
    } catch (err) {
      console.error("Failed to create ticket:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="text-zinc-600 max-w-2xl mx-auto space-y-6 mb-12">
         <h1 className="text-zinc-600 font-black tracking-tighter  uppercase">Support Command Center</h1>
         <p className="text-zinc-600 font-medium">Resolving technical friction and operational inquiries for the Guardian Network.</p>
         
         <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
            <Input 
               placeholder="SEARCH RESOLUTION DATABASE..." 
               className="pl-16 h-16 rounded-[2rem] bg-white border-none shadow-2xl font-bold placeholder:font-black placeholder:text-[10px] placeholder:tracking-widest"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="border-none shadow-xl rounded-[2.5rem] bg-zinc-950 text-zinc-600 p-10 flex flex-col items-center text-zinc-600 gap-6 group hover:scale-[1.05] transition-all">
            <div className="h-16 w-16 bg-primary rounded-[1.5rem] flex items-center justify-center">
               <MessageSquare className="h-8 w-8 text-zinc-600" />
            </div>
            <div>
               <h3 className="text-zinc-600 font-black  uppercase  tracking-tighter">Live Transmission</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-2">REAL-TIME AGENT ACCESS</p>
            </div>
            <Button 
              onClick={handleCreateTicket}
              disabled={isCreating}
              className="w-full bg-white text-zinc-600 font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest"
            >
               {isCreating ? 'INITIATING...' : 'INITIATE CHAT'}
            </Button>
         </Card>

         <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 flex flex-col items-center text-zinc-600 gap-6 group hover:scale-[1.05] transition-all">
            <div className="h-16 w-16 bg-zinc-50 rounded-[1.5rem] flex items-center justify-center">
               <Book className="h-8 w-8 text-zinc-600" />
            </div>
            <div>
               <h3 className="text-zinc-600 font-black  uppercase  tracking-tighter">Onboarding Guide</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-2">SYSTEM WALKTHROUGH</p>
            </div>
            <Button variant="outline" className="w-full border-zinc-200 font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest">
               VIEW HANDBOOK
            </Button>
         </Card>

         <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 flex flex-col items-center text-zinc-600 gap-6 group hover:scale-[1.05] transition-all">
            <div className="h-16 w-16 bg-zinc-50 rounded-[1.5rem] flex items-center justify-center">
               <Phone className="h-8 w-8 text-zinc-600" />
            </div>
            <div>
               <h3 className="text-zinc-600 font-black  uppercase  tracking-tighter">Direct Hotlink</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-2">TELEPHONIC ENGAGEMENT</p>
            </div>
            <Button variant="outline" className="w-full border-zinc-200 font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest">
               REQUEST CALL
            </Button>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
         {/* Active Tickets & FAQs */}
         <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
               <div className="flex justify-between items-center px-4">
                  <h3 className="text-zinc-600 font-black  uppercase  tracking-tighter mb-4">Active Inquiries</h3>
                  <Badge className="bg-primary/10 text-zinc-600 border-none text-[8px] font-black uppercase">{tickets.length} Open</Badge>
               </div>
               <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                       <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
                    </div>
                  ) : tickets.length > 0 ? (
                    tickets.slice(0, 3).map((ticket, i) => (
                      <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white border overflow-hidden group">
                         <div className="p-8 flex items-center gap-6">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center shrink-0">
                               <div className={cn("h-3 w-3 rounded-full", ticket.status === 'open' ? 'bg-emerald-500' : 'bg-amber-500')} />
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-black text-zinc-600 uppercase  tracking-tight">{ticket.subject}</h4>
                                  <Badge className="bg-zinc-100 text-[7px] font-black uppercase text-zinc-600 border-none">#{ticket.id}</Badge>
                               </div>
                               <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Status: {ticket.status} • Updated {new Date(ticket.updated_at).toLocaleDateString()}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                         </div>
                      </Card>
                    ))
                  ) : (
                    <div className="p-12 text-zinc-600 border-dashed border-2 rounded-[2.5rem] border-zinc-100">
                       <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">No active support transmissions.</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="space-y-6 pt-12">
               <h3 className="text-zinc-600 font-black  uppercase  tracking-tighter mb-8 px-4">Knowledge Base</h3>
               <div className="space-y-4">
                  {filteredFaqs.map((faq, i) => (
                     <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group">
                        <div className="p-8 flex items-start gap-6">
                           <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                              <HelpCircle className="h-5 w-5 text-zinc-600" />
                           </div>
                           <div className="flex-1 space-y-3">
                              <h4 className="font-black text-zinc-600 uppercase   tracking-tight">{faq.q}</h4>
                              <p className="text-zinc-600 font-medium text-zinc-600 leading-relaxed">{faq.a}</p>
                           </div>
                           <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                     </Card>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-emerald-500 text-zinc-600 p-10">
               <ShieldCheck className="h-12 w-12 mb-8 opacity-40" />
               <h3 className="text-zinc-600 font-black  uppercase  tracking-tighter mb-4 leading-none">Security Guaranteed</h3>
               <p className="text-zinc-600 font-medium leading-relaxed">
                  All transmissions undergo 256-bit AES encryption. Guardian data remains isolated and protected.
               </p>
            </Card>

            <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-950 text-zinc-600 p-10 flex flex-col gap-8">
               <div className="flex justify-between items-center">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                     <Zap className="h-6 w-6 text-zinc-600" />
                  </div>
                  <Badge className="bg-white/10 text-zinc-600 border-none font-black text-[8px] uppercase">Service Health</Badge>
               </div>
               
               <div className="space-y-4">
                  {[
                    { label: 'API Gateway', status: 'Operational' },
                    { label: 'Neural Engine', status: 'Optimal' },
                    { label: 'Cloud Sync', status: 'Active' }
                  ].map((s, i) => (
                     <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{s.label}</span>
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                           <span className="text-[10px] font-black uppercase">{s.status}</span>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="pt-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  <Globe className="h-4 w-4" />
                  <span>Current Zone: AS-SOUTH-1</span>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
