"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Clock, Zap } from "lucide-react";

export default function StudentDashboard() {
  const stats = [
    { title: "Tests Taken", value: "12", icon: BookOpen, description: "Completed attempts" },
    { title: "Average Score", value: "84%", icon: Zap, description: "Across all subjects" },
    { title: "Study Streak", value: "5 Days", icon: Clock, description: "Keep it up!" },
    { title: "Badges", value: "8", icon: Award, description: "Earned this month" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">Track your progress, take tests, and unlock new achievements.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Upcoming Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">M{i}</div>
                  <div className="flex-1">
                    <p className="font-semibold">Mathematics Unit {i + 2}</p>
                    <p className="text-xs text-muted-foreground">Starts in 2 hours • 45 Questions</p>
                  </div>
                  <button className="bg-primary text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">Join Lobby</button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Personalised Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-400">Focus Area: Algebra</p>
                <p className="text-orange-700/80 dark:text-orange-400/80 mt-1">You missed 3 questions on quadratic equations in the last test.</p>
              </div>
              <button className="w-full text-sm font-medium p-2 rounded-md border border-primary text-primary hover:bg-primary/5 transition-colors">Review Week Spots</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
