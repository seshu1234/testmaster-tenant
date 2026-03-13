"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Target, 
  Clock, 
  Search,
  Flame,
  Star,
  TrendingUp,
  Gem
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const practiceSets = [
  { 
    id: '1', 
    title: 'Kinematics Speed Drill', 
    subject: 'Physics', 
    points: 150, 
    difficulty: 'Easy', 
    time: '15 min', 
    questions: 10,
    type: 'Drill',
    tag: 'Focus: Acceleration'
  },
  { 
    id: '2', 
    title: 'Solid State Mastery', 
    subject: 'Chemistry', 
    points: 300, 
    difficulty: 'Medium', 
    time: '30 min', 
    questions: 20,
    type: 'Topic Test',
    tag: 'Focus: Crystal Systems'
  },
  { 
    id: '3', 
    title: 'Integration by Parts', 
    subject: 'Mathematics', 
    points: 450, 
    difficulty: 'Hard', 
    time: '45 min', 
    questions: 15,
    type: 'Concept Challenge',
    tag: 'Weak Area Recovery'
  }
];

export default function StudentPracticePage() {
  const [activeTab, setActiveTab] = useState<'recommended' | 'popular' | 'topic'>('recommended');

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6">
      {/* Practice Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 px-8 py-14 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="max-w-xl space-y-4">
              <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5">
                  Growth Engine
              </Badge>
              <h1 className="text-5xl font-black tracking-tighter leading-tight italic uppercase">Precision Practice</h1>
              <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                  AI-curated drills designed to eliminate your weak spots and maximize score velocity.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-inner flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <Gem className="h-8 w-8 text-amber-500" />
              </div>
              <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Practice Multiplier</p>
                  <p className="text-xl font-black italic uppercase">1.5x Rewards Active</p>
              </div>
            </div>
        </div>
        
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-125">
            <Target className="h-64 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Selection Area */}
        <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row bg-white dark:bg-zinc-950 p-4 rounded-3xl border dark:border-zinc-800 shadow-sm items-center justify-between gap-6">
              <div className="relative flex-1 w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search topics, chapters, or concepts..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-none text-[10px] font-black uppercase tracking-widest outline-none"
                  />
              </div>
              
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl shadow-inner scrollbar-hide overflow-x-auto w-full md:w-auto">
                  {['recommended', 'popular', 'topic'].map((tab) => (
                    <button
                        key={tab}
                        className={cn(
                          "px-6 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                          activeTab === tab ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-500"
                        )}
                        onClick={() => setActiveTab(tab as 'recommended' | 'popular' | 'topic')}
                    >
                        {tab}
                    </button>
                  ))}
              </div>
            </div>

            <div className="grid gap-6">
              {practiceSets.map((set) => (
                  <Card key={set.id} className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 overflow-hidden group hover:scale-[1.02] transition-all transform duration-500">
                    <div className="p-8 flex items-center gap-8">
                        <div className="h-24 w-24 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 flex flex-col items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                          <Zap className={cn("h-8 w-8", set.difficulty === 'Hard' ? 'text-rose-500' : set.difficulty === 'Medium' ? 'text-amber-500' : 'text-blue-500')} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-2">{set.time}</span>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black h-5 px-3 uppercase tracking-widest">{set.type}</Badge>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{set.tag}</span>
                          </div>
                          <h3 className="text-2xl font-black italic uppercase italic tracking-tighter leading-none">{set.title}</h3>
                          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {set.questions} Questions</div>
                              <div className="flex items-center gap-1.5"><Star className="h-3 w-3 text-amber-500" /> {set.points} Potential Pts</div>
                          </div>
                        </div>

                        <Button className="h-14 px-8 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xs hover:scale-105 transition-all shadow-xl shrink-0">
                          START DRILL
                        </Button>
                    </div>
                  </Card>
              ))}
            </div>
        </div>

        {/* Sidebar Intel */}
        <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-primary p-10 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase leading-none italic tracking-tighter">Growth Forecast</h3>
                  <p className="text-primary-foreground/80 text-xs font-medium leading-relaxed">
                    Based on your recent practice of <span className="text-white font-black italic italic">Organic Synthesis</span>, your upcoming score is expected to improve by <span className="text-white font-black italic italic">+15%</span>.
                  </p>
                  <div className="h-[2px] w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-3/4 animate-pulse" />
                  </div>
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-950 p-8 space-y-8 text-center flex flex-col items-center">
              <div className="h-16 w-16 rounded-[1.5rem] bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <Flame className="h-8 w-8 text-orange-500" />
              </div>
              <div className="space-y-2">
                  <h4 className="text-xl font-black italic uppercase italic tracking-tighter leading-none">Practice Streak</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Complete 2 more for bonus points</p>
              </div>
              <div className="flex gap-2">
                  {[1,1,1,0,0].map((s, i) => (
                    <div key={i} className={cn("h-2.5 w-6 rounded-full transition-all", s ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" : "bg-zinc-100 dark:bg-zinc-900")} />
                  ))}
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-zinc-900 p-8 text-white group">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Mastery Targets</h4>
              <div className="space-y-6">
                  {[
                    { label: 'Thermodynamics', progress: 45 },
                    { label: 'Redox Reactions', progress: 82 },
                    { label: 'Inverse Functions', progress: 15 }
                  ].map((target, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span>{target.label}</span>
                          <span className="text-primary">{target.progress}%</span>
                        </div>
                        <Progress value={target.progress} className="h-1.5 bg-white/5" />
                    </div>
                  ))}
              </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
