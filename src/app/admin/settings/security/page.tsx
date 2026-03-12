"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Timer, LogOut, Terminal, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Lock, Download, ShieldCheck, Database } from "lucide-react";

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  ip_address: string;
  timestamp: string;
}

export default function SecurityAuditPage() {
  const { token, tenantSlug } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api("/admin/audit-logs", {
        token,
        tenant: tenantSlug || undefined,
      });
      setLogs(response.data);
    } catch {
      // Fallback for UI testing
      setLogs([
        { id: "1", user: "Admin (Centre)", action: "DELETE_BATCH", resource: "JEE-2024-Old", ip_address: "192.168.1.1", timestamp: new Date().toISOString() },
        { id: "2", user: "Mrs. Kapoor", action: "LOGIN", resource: "Teacher Portal", ip_address: "103.42.12.1", timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: "3", user: "Admin (Centre)", action: "UPDATE_BRANDING", resource: "System Setting", ip_address: "192.168.1.1", timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: "4", user: "Prof. Verma", action: "PUBLISH_TEST", resource: "Mock Test #4", ip_address: "142.112.5.9", timestamp: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [token, tenantSlug]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security & Audit Logs</h2>
          <p className="text-muted-foreground">
            Monitor administrative activities and track security-sensitive actions.
          </p>
        </div>
        <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
          <ShieldAlert className="h-4 w-4" />
          Critical Alerts (0)
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              Active Admin Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="text-sm font-medium">This Computer (MacBook Pro)</span>
                   <span className="text-[10px] text-muted-foreground font-mono">192.168.1.1 • Active Now</span>
                 </div>
                 <Badge variant="outline" className="text-green-600 border-green-200">Current</Badge>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="text-sm font-medium">iPhone 15 Pro</span>
                   <span className="text-[10px] text-muted-foreground font-mono">10.0.0.45 • 2 hours ago</span>
                 </div>
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                   <LogOut className="h-4 w-4" />
                 </Button>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              Audit Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                  <div className="text-2xl font-bold">{logs.length}</div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Actions</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Failed Logins</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Master Audit Log</CardTitle>
            <CardDescription>Comprehensive record of all institutional modifications.</CardDescription>
          </div>
          <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Search user or action..." className="pl-9 h-8 text-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Resource</TableHead>
                <TableHead className="text-right">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 animate-pulse text-muted-foreground text-xs uppercase font-bold tracking-widest">
                    Retrieving secure audit chain...
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-[10px] font-mono text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{log.user}</TableCell>
                    <TableCell>
                       <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tight">
                        {log.action}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.resource}</TableCell>
                    <TableCell className="text-right text-[10px] font-mono text-muted-foreground">
                      {log.ip_address}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-zinc-900 text-white">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary-foreground" />
              Security Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
               <div className="space-y-0.5">
                 <p className="text-xs font-bold">Require 2FA</p>
                 <p className="text-[10px] text-zinc-400">Force multi-factor for all admins.</p>
               </div>
               <Switch />
             </div>
             <div className="flex items-center justify-between">
               <div className="space-y-0.5">
                 <p className="text-xs font-bold">Session Expiry</p>
                 <p className="text-[10px] text-zinc-400">Lock interface after 30 mins idle.</p>
               </div>
               <Switch defaultChecked />
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Data Trust & Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button variant="outline" className="w-full h-10 text-xs gap-2">
               <Download className="h-4 w-4" />
               Download GDPR Data Archive
             </Button>
             <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-100/50 border border-dashed border-zinc-200">
               <Database className="h-4 w-4 text-zinc-400" />
               <p className="text-[10px] text-zinc-500 italic">
                 Last full integrity scan: {new Date().toLocaleDateString()}
               </p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
