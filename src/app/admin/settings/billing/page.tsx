"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Wallet, ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function BillingDashboard() {
  const [usage] = useState({
    students: { used: 450, limit: 1000 },
    teachers: { used: 12, limit: 20 },
    storage: { used: 4.2, limit: 10 },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing & Subscription</h2>
          <p className="text-muted-foreground">
            Manage your institution&apos;s plan, usage limits, and invoices.
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900">
          <ArrowUpRight className="h-4 w-4" />
          Upgrade Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Active Plan
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Enterprise</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12,400<span className="text-xs text-muted-foreground font-normal ml-1">/month</span></div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Next renewal on April 12, 2026
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Credits Balance
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-muted-foreground mt-1">SMS & Email Credits available</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Payment Method
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">HDFC Bank •••• 4242</div>
            <p className="text-xs text-muted-foreground mt-1">Expires 12/28</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
        <CardHeader>
          <CardTitle>Seat Consumption</CardTitle>
          <CardDescription>Visualizing your current resource utilization vs plan limits.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-3">
           <div className="space-y-3">
             <div className="flex justify-between text-sm">
               <span className="font-medium">Students</span>
               <span className="text-muted-foreground">{usage.students.used} / {usage.students.limit}</span>
             </div>
             <Progress value={(usage.students.used / usage.students.limit) * 100} className="h-2" />
           </div>
           <div className="space-y-3">
             <div className="flex justify-between text-sm">
               <span className="font-medium">Teachers</span>
               <span className="text-muted-foreground">{usage.teachers.used} / {usage.teachers.limit}</span>
             </div>
             <Progress value={(usage.teachers.used / usage.teachers.limit) * 100} className="h-2" />
           </div>
           <div className="space-y-3">
             <div className="flex justify-between text-sm">
               <span className="font-medium">Cloud Storage (GB)</span>
               <span className="text-muted-foreground">{usage.storage.used} / {usage.storage.limit}</span>
             </div>
             <Progress value={(usage.storage.used / usage.storage.limit) * 100} className="h-2" />
           </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>View and download your institutional billing history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium font-mono">TM-2026-03-01</TableCell>
                <TableCell>Mar 12, 2026</TableCell>
                <TableCell>₹12,400</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-700 border-none">Paid</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Download</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium font-mono">TM-2026-02-01</TableCell>
                <TableCell>Feb 12, 2026</TableCell>
                <TableCell>₹12,400</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-700 border-none">Paid</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Download</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
