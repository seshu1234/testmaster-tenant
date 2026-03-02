import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Teachers", value: "24", icon: Users, description: "+2 this month" },
    { title: "Total Students", value: "1,280", icon: GraduationCap, description: "+48 this month" },
    { title: "Active Batches", value: "32", icon: BookOpen, description: "All active" },
    { title: "Avg. Performance", value: "72%", icon: TrendingUp, description: "+5% from last month" },
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
      
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity to show.</p>
        </CardContent>
      </Card>
    </div>
  );
}
