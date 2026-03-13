"use client";

import { useState } from "react";
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Phone, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const faqs = [
  { q: "How do I link a second child to my account?", a: "Navigate to Settings > Child Linking and enter the unique Student ID provided by the centre." },
  { q: "What does 'Accuracy' represent in results?", a: "Accuracy is the percentage of correct answers vs total questions attempted in a specific assessment." },
  { q: "Can I download consolidated reports?", a: "Yes, use the 'Export All' button in the Results History or the 'Download PDF' button in a Detailed Result view." },
  { q: "How to schedule a mentor meeting?", a: "Go to Communications, select a mentor, and click 'Schedule Meeting' to see available slots." },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      <div className="text-center max-w-2xl mx-auto space-y-6 mb-12">
         <h1 className="text-4xl font-black tracking-tighter italic uppercase">Support Command Center</h1>
         <p className="text-muted-foreground text-sm font-medium">Resolving technical friction and operational inquiries for the Guardian Network.</p>
         
         <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input 
               placeholder="SEARCH RESOLUTION DATABASE..." 
               className="pl-16 h-16 rounded-[2rem] bg-white dark:bg-zinc-900 border-none shadow-2xl font-bold placeholder:font-black placeholder:text-[10px] placeholder:tracking-widest"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="border-none shadow-xl rounded-[2.5rem] bg-zinc-950 text-white p-10 flex flex-col items-center text-center gap-6 group hover:scale-[1.05] transition-all">
            <div className="h-16 w-16 bg-primary rounded-[1.5rem] flex items-center justify-center">
               <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
               <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Live Transmission</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">REAL-TIME AGENT ACCESS</p>
            </div>
            <Button className="w-full bg-white text-black font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest">
               INITIATE CHAT
            </Button>
         </Card>

         <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-900 p-10 flex flex-col items-center text-center gap-6 group hover:scale-[1.05] transition-all">
            <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-950 rounded-[1.5rem] flex items-center justify-center">
               <Book className="h-8 w-8 text-zinc-400" />
            </div>
            <div>
               <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Onboarding Guide</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">SYSTEM WALKTHROUGH</p>
            </div>
            <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800 font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest">
               VIEW HANDBOOK
            </Button>
         </Card>

         <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-900 p-10 flex flex-col items-center text-center gap-6 group hover:scale-[1.05] transition-all">
            <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-950 rounded-[1.5rem] flex items-center justify-center">
               <Phone className="h-8 w-8 text-zinc-400" />
            </div>
            <div>
               <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Direct Hotlink</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">TELEPHONIC ENGAGEMENT</p>
            </div>
            <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800 font-black h-12 rounded-2xl text-[10px] uppercase tracking-widest">
               REQUEST CALL
            </Button>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
         {/* FAQs */}
         <div className="lg:col-span-8 space-y-6">
            <h3 className="text-2xl font-black italic uppercase italic tracking-tighter mb-8 px-4">Knowledge Base</h3>
            <div className="space-y-4">
               {filteredFaqs.map((faq, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white dark:bg-zinc-900/50 overflow-hidden group">
                     <div className="p-8 flex items-start gap-6">
                        <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center shrink-0">
                           <HelpCircle className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="flex-1 space-y-3">
                           <h4 className="font-black text-sm uppercase italic italic tracking-tight">{faq.q}</h4>
                           <p className="text-xs font-medium text-zinc-500 leading-relaxed">{faq.a}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </Card>
               ))}
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-emerald-500 text-white p-10">
               <ShieldCheck className="h-12 w-12 mb-8 opacity-40" />
               <h3 className="text-2xl font-black italic uppercase italic tracking-tighter mb-4 leading-none">Security Guaranteed</h3>
               <p className="text-emerald-100 text-xs font-medium leading-relaxed">
                  All transmissions undergo 256-bit AES encryption. Guardian data remains isolated and protected.
               </p>
            </Card>

            <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-950 text-white p-10 flex flex-col gap-8">
               <div className="flex justify-between items-center">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                     <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <Badge className="bg-white/10 text-white border-none font-black text-[8px] uppercase">Service Health</Badge>
               </div>
               
               <div className="space-y-4">
                  {[
                    { label: 'API Gateway', status: 'Operational' },
                    { label: 'Neural Engine', status: 'Optimal' },
                    { label: 'Cloud Sync', status: 'Active' }
                  ].map((s, i) => (
                     <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{s.label}</span>
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                           <span className="text-[10px] font-black uppercase">{s.status}</span>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="pt-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <Globe className="h-4 w-4" />
                  <span>Current Zone: AS-SOUTH-1</span>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
