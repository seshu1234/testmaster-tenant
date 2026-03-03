"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function ParentDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Parent Portal</h1>
        <p className="text-muted-foreground">Monitor your child&apos;s academic performance and upcoming schedule.</p>
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-primary overflow-hidden bg-zinc-100">
            <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Student" 
            width={48} height={48}/>
          </div>
          <div>
            <CardTitle>Aditya Sharma</CardTitle>
            <p className="text-sm text-muted-foreground">Class 10-A • Roll No: 42</p>
          </div>
          <div className="ml-auto bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#4 / 120</div>
            <p className="text-xs text-muted-foreground">Top 5% of class</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">Satisfactory</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Test</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Mar 15</div>
            <p className="text-xs text-muted-foreground">Physics Midterm</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Assignments due</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { subject: "Mathematics", score: 92 },
              { subject: "Physics", score: 88 },
              { subject: "Chemistry", score: 84 },
              { subject: "Biology", score: 79 },
            ].map((s) => (
              <div key={s.subject} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{s.subject}</span>
                  <span className="font-bold">{s.score}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${s.score}%` }}></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 text-sm">
                <p className="font-bold">Mrs. Kapoor (Mathematics):</p>
                <p className="text-muted-foreground mt-1">Aditya has shown great improvement in Calculus over the last two weeks. Proud of his hard work!</p>
              </div>
              <button className="w-full text-sm font-medium p-2 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-opacity">Download Full Report (PDF)</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
