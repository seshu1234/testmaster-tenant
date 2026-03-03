"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, CheckCircle, Clock } from "lucide-react";

export default function TeacherDashboard() {
  const stats = [
    { title: "My Batches", value: "4", icon: Users, description: "Active student groups" },
    { title: "Questions Created", value: "128", icon: BookOpen, description: "In your bank" },
    { title: "Tests Scheduled", value: "3", icon: Clock, description: "Upcoming this week" },
    { title: "Tests Graded", value: "45", icon: CheckCircle, description: "Total evaluations" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Manage your questions, tests, and monitor student performance.</p>
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
            <CardTitle>Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">T{i}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Unit Test {i}: Mathematics</p>
                    <p className="text-xs text-muted-foreground">Scheduled for tomorrow</p>
                  </div>
                  <div className="text-xs font-medium text-primary">View Details</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Your students are performing exceptionally well in Calculus but need more practice in Geometry.</p>
            <button className="w-full text-sm font-medium p-2 rounded-md bg-primary text-white hover:opacity-90 transition-opacity">Generate Practice Questions</button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
