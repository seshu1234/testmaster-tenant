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
          <h2 className="text-xl font-bold tracking-tight">Billing & Subscription</h2>
          <p className="text-zinc-600">
            Manage your institution&apos;s plan, usage limits, and invoices.
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-zinc-900 to-zinc-700">
          <ArrowUpRight className="h-4 w-4" />
          Upgrade Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-600 font-medium flex items-center justify-between">
              Active Plan
              <Badge variant="secondary" className="bg-primary/10 text-zinc-600 border-none">Enterprise</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">₹12,400<span className="text-zinc-600 font-normal ml-1">/month</span></div>
            <p className="text-zinc-600 mt-1 flex items-center gap-1">
              Next renewal on April2, 2026
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-600 font-medium flex items-center justify-between">
              Credits Balance
              <Wallet className="h-4 w-4 text-zinc-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">2,450</div>
            <p className="text-zinc-600 mt-1">SMS & Email Credits available</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-600 font-medium flex items-center justify-between">
              Payment Method
              <CreditCard className="h-4 w-4 text-zinc-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-zinc-600 font-medium">HDFC Bank •••• 4242</div>
            <p className="text-zinc-600 mt-1">Expires2/28</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Seat Consumption</CardTitle>
          <CardDescription>Visualizing your current resource utilization vs plan limits.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-3">
           <div className="space-y-3">
             <div className="flex justify-between text-zinc-600">
               <span className="font-medium">Students</span>
               <span className="text-zinc-600">{usage.students.used} / {usage.students.limit}</span>
             </div>
             <Progress value={(usage.students.used / usage.students.limit) * 100} className="h-2" />
           </div>
           <div className="space-y-3">
             <div className="flex justify-between text-zinc-600">
               <span className="font-medium">Teachers</span>
               <span className="text-zinc-600">{usage.teachers.used} / {usage.teachers.limit}</span>
             </div>
             <Progress value={(usage.teachers.used / usage.teachers.limit) * 100} className="h-2" />
           </div>
           <div className="space-y-3">
             <div className="flex justify-between text-zinc-600">
               <span className="font-medium">Cloud Storage (GB)</span>
               <span className="text-zinc-600">{usage.storage.used} / {usage.storage.limit}</span>
             </div>
             <Progress value={(usage.storage.used / usage.storage.limit) * 100} className="h-2" />
           </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
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
                <TableHead className="text-zinc-600">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium font-mono">TM-2026-03-01</TableCell>
                <TableCell>Mar2, 2026</TableCell>
                <TableCell>₹12,400</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-zinc-600 border-none">Paid</Badge>
                </TableCell>
                <TableCell className="text-zinc-600">
                  <Button variant="ghost" size="sm">Download</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium font-mono">TM-2026-02-01</TableCell>
                <TableCell>Feb2, 2026</TableCell>
                <TableCell>₹12,400</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-zinc-600 border-none">Paid</Badge>
                </TableCell>
                <TableCell className="text-zinc-600">
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
