"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Clock, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth"; // Assuming useAuth is in this path
import Image from "next/image";

export default function StudentDashboard() {
  const { user, branding } = useAuth();
  const stats = [
    { title: "Tests Taken", value: "12", icon: BookOpen, description: "Completed attempts" },
    { title: "Average Score", value: "84%", icon: Zap, description: "Across all subjects" },
    { title: "Study Streak", value: "5 Days", icon: Clock, description: "Keep it up!" },
    { title: "Badges", value: "8", icon: Award, description: "Earned this month" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-12 text-white shadow-xl">
        <div className="relative z-10 flex flex-col gap-2 max-w-xl">
          <h1 className="text-4xl font-black tracking-tight leading-tight">
            {branding?.hero_title || `Welcome Back, ${user?.name?.split(' ')[0] || 'Aspirant'}!`}
          </h1>
          <p className="text-primary-foreground/90 text-lg">
            {branding?.hero_description || "You're doing great! You've completed 85% of your weekly goal. Keep pushing to unlock your next badge."}
          </p>
          <div className="mt-4 flex gap-3">
             <button className="bg-white text-primary font-bold px-6 py-2 rounded-xl text-sm shadow-lg hover:scale-105 transition-transform">Resume Learning</button>
             <button className="bg-primary-foreground/20 backdrop-blur-md text-white border border-white/20 px-6 py-2 rounded-xl text-sm font-medium">View Plan</button>
          </div>
        </div>
        
        {branding?.hero_image_url ? (
            <Image
                src={branding.hero_image_url} 
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 mask-gradient-to-l" 
                alt="Hero"
                width={500}
                height={500}
            />
        ) : (
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <BookOpen className="w-64 h-64 rotate-12" />
            </div>
        )}
        
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
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
