import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, GraduationCap, CheckCircle2, Clock } from "lucide-react";

export default function TeacherDashboard() {
  const stats = [
    { title: "My Questions", value: "142", icon: FileText, description: "+12 this week" },
    { title: "Active Tests", value: "3", icon: Clock, description: "Ends in 2 days" },
    { title: "Tests Graded", value: "88", icon: CheckCircle2, description: "All up to date" },
    { title: "Avg. Class Score", value: "68%", icon: GraduationCap, description: "Batch A-1" },
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
            <CardTitle>Upcoming Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No upcoming tests scheduled.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent questions added.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
