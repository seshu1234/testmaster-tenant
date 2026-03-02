import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Trophy, Clock } from "lucide-react";

export default function StudentDashboard() {
  const stats = [
    { title: "Upcoming Tests", value: "2", icon: Clock, description: "Next: Math (Tomorrow)" },
    { title: "Completed Tests", value: "14", icon: CheckCircle2, description: "+2 this week" },
    { title: "Avg. Score", value: "82%", icon: Trophy, description: "Top 10% in class" },
    { title: "Total Questions", value: "480", icon: BookOpen, description: "Practiced so far" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No performance data yet.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommended Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No practice recommendations yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
