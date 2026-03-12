"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  MessageSquare, 
  Users, 
  History, 
  BarChart2,
  Bell,
  Smartphone,
  Mail,
  MoreVertical,
  Calendar,
  Layers,
  Zap,
  GraduationCap
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function CommunicationsPage() {
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState("announcement");

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Message Dispatched", {
        description: `Your ${channel} is being processed and delivered.`,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communication Command</h2>
          <p className="text-muted-foreground">
            Multi-channel engagement platform for institutional updates and alerts.
          </p>
        </div>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="compose" className="gap-2">
            <Send className="h-4 w-4" />
            Compose & Send
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Layers className="h-4 w-4" />
            Email Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Broadcast Message
                </CardTitle>
                <CardDescription>Draft and distribute institutional communications in real-time.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notification Channel</label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">App Announcement</SelectItem>
                        <SelectItem value="email">Institutional Email</SelectItem>
                        <SelectItem value="sms">Emergency SMS</SelectItem>
                        <SelectItem value="push">Mobile Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Audience</label>
                    <Select defaultValue="all-students">
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-students">All Students (1,450)</SelectItem>
                        <SelectItem value="all-teachers">Faculty Members (42)</SelectItem>
                        <SelectItem value="all-parents">Registered Parents (890)</SelectItem>
                        <SelectItem value="jee-batch">Batch: JEE 2026 Alpha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject / Headline</label>
                  <Input placeholder="e.g., Mandatory Mock Test Schedule - October 2026" className="h-10" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Body Content</label>
                  <Textarea 
                    placeholder="Type your secure message message here..." 
                    className="min-h-[160px] resize-none border-zinc-100 bg-zinc-50/50"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 gap-1.5 py-1">
                    <Zap className="h-3 w-3" />
                    Estimated Reach: 1,492 Users
                  </Badge>
                  <div className="flex gap-3">
                    <Button variant="ghost" disabled={loading} className="text-zinc-500">Save as Template</Button>
                    <Button onClick={handleSend} disabled={loading} className="gap-2 px-8 bg-zinc-900 text-white">
                      <Send className="h-4 w-4" />
                      {loading ? "Transmitting..." : "Broadcast Now"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {channel === "push" && (
                <Card className="border-none shadow-xl bg-zinc-900 text-white overflow-hidden animate-in zoom-in-95 duration-300">
                   <CardHeader className="p-4 pb-2">
                     <div className="flex justify-between items-center opacity-50">
                        <Smartphone className="h-3 w-3" />
                        <span className="text-[10px] font-mono">PUSH PREVIEW</span>
                     </div>
                   </CardHeader>
                   <CardContent className="p-4 pt-1 space-y-3">
                      <div className="flex items-start gap-3">
                         <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                            <GraduationCap className="h-6 w-6 text-white" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-xs font-bold">New Test Scheduled</p>
                            <p className="text-[10px] text-zinc-400 leading-tight">Your Weekly Mock Test (Physics) has been scheduled for tomorrow at 10 AM.</p>
                         </div>
                      </div>
                      <div className="h-1 w-16 bg-zinc-800 rounded-full mx-auto" />
                   </CardContent>
                </Card>
              )}

              {channel === "sms" && (
                <Card className="border-none shadow-sm bg-green-900 text-white overflow-hidden animate-in zoom-in-95 duration-300">
                   <CardHeader className="p-4 pb-2">
                     <div className="flex justify-between items-center opacity-50">
                        <Smartphone className="h-3 w-3" />
                        <span className="text-[10px] font-mono">SMS GATEWAY</span>
                     </div>
                   </CardHeader>
                   <CardContent className="p-4 pt-1">
                      <p className="text-[10px] font-mono leading-tight">
                        [TESTMASTER] Urgent: Mock Test delayed to 11AM. Please log in for details.
                      </p>
                   </CardContent>
                </Card>
              )}

              <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Network Quota
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-1">
                     <div className="flex justify-between text-xs">
                       <span>Email Throughput</span>
                       <span className="font-bold">4.2k / 10k</span>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[42%]" />
                     </div>
                   </div>
                   <div className="space-y-1">
                     <div className="flex justify-between text-xs">
                       <span>SMS Gateway</span>
                       <span className="font-bold">150 / 500</span>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                       <div className="h-full bg-zinc-400 w-[30%]" />
                     </div>
                   </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Dispatcher Log
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                   {[
                     { title: "Diwali Break Update", type: "SMS", date: "2h ago", status: "Sent", icon: Smartphone },
                     { title: "Revision Series P-1", type: "Mail", date: "1d ago", status: "Open", icon: Mail },
                     { title: "System Ready", type: "App", date: "3d ago", status: "Done", icon: Bell },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-3 group">
                       <div className="h-8 w-8 rounded bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          <item.icon className="h-4 w-4" />
                       </div>
                       <div className="flex-1 flex flex-col min-w-0">
                         <span className="text-xs font-bold line-clamp-1">{item.title}</span>
                         <span className="text-[9px] text-muted-foreground uppercase">{item.type} • {item.date}</span>
                       </div>
                       <Badge variant="outline" className="text-[8px] h-4 font-bold border-zinc-100 uppercase">{item.status}</Badge>
                     </div>
                   ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Institutional Email Campaigns</CardTitle>
                <CardDescription>Managed mass-mailing workflows and automated drip series.</CardDescription>
              </div>
              <Button className="gap-2">
                <Mail className="h-4 w-4" />
                New Campaign
              </Button>
            </CardHeader>
            <CardContent>
               <div className="grid gap-6 md:grid-cols-3">
                  {[
                    { label: "Active Campaigns", value: "3", icon: Zap },
                    { label: "Pending Scheduled", value: "1", icon: Calendar },
                    { label: "Subscriber Growth", value: "+12%", icon: Users },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 flex flex-col gap-1">
                       <stat.icon className="h-4 w-4 text-primary" />
                       <span className="text-xl font-bold">{stat.value}</span>
                       <span className="text-[10px] text-muted-foreground uppercase font-bold">{stat.label}</span>
                    </div>
                  ))}
               </div>
               
               <div className="mt-8 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm">No Active Campaigns</h5>
                    <p className="text-xs text-muted-foreground max-w-[250px]">Start an automated email campaign to re-engage passive students.</p>
                  </div>
                  <Button variant="outline" size="sm">Launch Campaign Wizard</Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
