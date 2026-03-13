"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  MessageSquare, 
  History, 
  BarChart2,
  Mail,
  Zap,
  Layers,
  Loader2
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

interface Broadcast {
  id: number;
  subject: string;
  created_at: string;
}

interface CommSummary {
  audience: {
    students: number;
    teachers: number;
    parents: number;
    total: number;
  };
  recent_broadcasts: Broadcast[];
}

export default function CommunicationsPage() {
  const { token, tenantSlug } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [summary, setSummary] = useState<CommSummary | null>(null);
  const [channel, setChannel] = useState("announcement");
  const [target, setTarget] = useState("all-students");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSummary() {
      if (!token) return;
      try {
        const response = await api("/admin/communication/summary", {
          token,
          tenant: tenantSlug || undefined
        });
        if (response.success) {
          setSummary(response.data);
        }
      } catch {
        // Error already logged or handled by api helper
      } finally {
        setFetching(false);
      }
    }
    fetchSummary();
  }, [token, tenantSlug]);

  const handleSend = async () => {
    if (!message) {
      toast.error("Message content is required");
      return;
    }
    setLoading(true);
    try {
      const response = await api("/admin/communication/broadcast", {
        method: "POST",
        token: token || undefined,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          target,
          medium: [channel],
          message,
          subject
        })
      });
      if (response.success) {
        toast.success("Message Dispatched", {
          description: response.message,
        });
        setMessage("");
        setSubject("");
      }
    } catch {
      toast.error("Failed to transmit broadcast");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
     return (
        <div className="flex items-center justify-center min-h-[400px]">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
     );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
          <p className="text-muted-foreground">
            Send announcements and broadcasts to your center audience.
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
            Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
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
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Mobile Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Audience</label>
                    <Select value={target} onValueChange={setTarget}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-students">All Students ({summary?.audience.students || 0})</SelectItem>
                        <SelectItem value="all-teachers">Faculty Members ({summary?.audience.teachers || 0})</SelectItem>
                        <SelectItem value="all-parents">Registered Parents ({summary?.audience.parents || 0})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject / Headline</label>
                  <Input 
                    placeholder="e.g., Mandatory Mock Test Schedule - October 2026" 
                    className="h-10" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Body Content</label>
                  <Textarea 
                    placeholder="Type your message here..." 
                    className="min-h-[160px] resize-none border-zinc-100 bg-zinc-50/50"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 gap-1.5 py-1">
                    <Zap className="h-3 w-3" />
                    Estimated Reach: {summary?.audience.total || 0} Users
                  </Badge>
                  <div className="flex gap-3">
                    <Button variant="ghost" disabled={loading} className="text-zinc-500">Save Template</Button>
                    <Button onClick={handleSend} disabled={loading} className="gap-2 px-8 bg-zinc-900 text-white">
                      <Send className="h-4 w-4" />
                      {loading ? "Transmitting..." : "Broadcast Now"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Institutional Reach
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-1">
                     <div className="flex justify-between text-xs">
                       <span>Total Audience</span>
                       <span className="font-bold">{summary?.audience.total || 0}</span>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-full" />
                     </div>
                   </div>
                   <div className="text-[10px] text-muted-foreground">
                     Data synchronized from center roster.
                   </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Dispatcher Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {summary?.recent_broadcasts.map((item, i) => (
                     <div key={i} className="flex items-center gap-3 group">
                       <div className="h-8 w-8 rounded bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                          <MessageSquare className="h-4 w-4" />
                       </div>
                       <div className="flex-1 flex flex-col min-w-0">
                         <span className="text-xs font-bold line-clamp-1">{item.subject}</span>
                         <span className="text-[9px] text-muted-foreground uppercase">{new Date(item.created_at).toLocaleString()}</span>
                       </div>
                       <Badge variant="outline" className="text-[8px] h-4 font-bold border-zinc-100 uppercase">Sent</Badge>
                     </div>
                   ))}
                   {(!summary?.recent_broadcasts || summary.recent_broadcasts.length === 0) && (
                      <p className="text-xs text-muted-foreground text-center py-4">No recent broadcasts found.</p>
                   )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>Create and manage automated email campaigns for your students.</CardDescription>
              </div>
              <Button className="gap-2">
                <Mail className="h-4 w-4" />
                New Campaign
              </Button>
            </CardHeader>
            <CardContent>
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
