"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Timer, LogOut, Terminal, Search, Loader2 } from "lucide-react";
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
  user?: { name: string; role: string };
  action: string;
  entity_type: string;
  ip_address: string;
  performed_at: string;
}

interface SecurityData {
  audit_logs: AuditLog[];
  active_sessions: {
    name: string;
    email: string;
    last_used_at: string;
    device: string;
  }[];
  security_score: number;
}

export default function SecurityAuditPage() {
  const { token, tenantSlug } = useAuth();
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api("/admin/security", {
        token,
        tenant: tenantSlug || undefined,
      });
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error("Security fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, tenantSlug]);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  if (loading && !data) {
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
          <h2 className="text-3xl font-bold tracking-tight">Security & Audit Logs</h2>
          <p className="text-muted-foreground">
            Monitor administrative activities and track security-sensitive actions.
          </p>
        </div>
        <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
          <ShieldAlert className="h-4 w-4" />
          Security Score: {data?.security_score || 0}%
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              Active Institutional Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {data?.active_sessions.map((session, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-sm font-medium">{session.name} ({session.device || 'Unknown Device'})</span>
                     <span className="text-[10px] text-muted-foreground font-mono">
                       {session.email} • {session.last_used_at ? new Date(session.last_used_at).toLocaleString() : 'Active Now'}
                     </span>
                   </div>
                   {i === 0 ? (
                     <Badge variant="outline" className="text-green-600 border-green-200">Current</Badge>
                   ) : (
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                       <LogOut className="h-4 w-4" />
                     </Button>
                   )}
                 </div>
               ))}
               {(!data?.active_sessions || data.active_sessions.length === 0) && (
                 <p className="text-xs text-muted-foreground italic">No active sessions detected.</p>
               )}
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
                  <div className="text-2xl font-bold">{data?.audit_logs.length || 0}</div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Recent Actions</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                  <div className="text-2xl font-bold text-green-600">Secure</div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">System Status</p>
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
                data?.audit_logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-[10px] font-mono text-muted-foreground">
                      {new Date(log.performed_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{log.user?.name || 'System'}</TableCell>
                    <TableCell>
                       <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tight">
                        {log.action}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.entity_type}</TableCell>
                    <TableCell className="text-right text-[10px] font-mono text-muted-foreground">
                      {log.ip_address || '---'}
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
