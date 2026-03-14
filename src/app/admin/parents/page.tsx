"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  Link as LinkIcon,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";

export default function ParentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleAction = (parentName: string, action: "approved" | "rejected") => {
    toast.success(`Parent ${action}`, {
      description: `${parentName}'s registration has been ${action}.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Parent Portal Management</h2>
          <p className="text-zinc-600">
            Approve registrations, link parents to students, and monitor engagement.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Bulk Communication
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Parent
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Approval Queue</CardTitle>
                <CardDescription>Pending registration requests from parents.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-zinc-600 hover:bg-orange-100 border-none">
                4 Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-zinc-100">
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Requested Student</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead className="text-zinc-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Rajesh Kumar", student: "Aman Kumar (JEE-2026)", date: "2h ago" },
                  { name: "Sarah Williams", student: "Emma W. (NEET-2025)", date: "5h ago" },
                  { name: "Priya Sharma", student: "Rohan S. (Foundation)", date: "1d ago" },
                ].map((req, i) => (
                  <TableRow key={i} className="border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                    <TableCell className="font-medium">{req.name}</TableCell>
                    <TableCell className="text-zinc-600">{req.student}</TableCell>
                    <TableCell className="text-zinc-600">{req.date}</TableCell>
                    <TableCell className="text-zinc-600 flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-zinc-600  hover:bg-red-50"
                        onClick={() => handleAction(req.name, "rejected")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-zinc-600  hover:bg-green-50"
                        onClick={() => handleAction(req.name, "approved")}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-zinc-600 font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-zinc-600" />
              Quick Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between border-b pb-4 border-zinc-100">
               <div className="flex flex-col">
                 <span className="text-xl font-bold">186</span>
                 <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Linked Parents</span>
               </div>
               <Users className="h-8 w-8 text-zinc-600" />
             </div>
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-zinc-600 mb-1">
                    <span className="text-zinc-600">App Engagement</span>
                    <span className="font-bold">64%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[64%]" />
                  </div>
               </div>
               <p className="text-[10px] text-zinc-600 leading-relaxed">
                 &ldquo;85% of parents check their child&apos;s test results within hour of publishing.&rdquo;
               </p>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Parent Directory</CardTitle>
              <CardDescription>Search and manage all registered parent accounts.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-600" />
                <Input
                  className="pl-9 h-9"
                  placeholder="Search parents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-zinc-100">
                <TableHead>Parent</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Linked Students</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-zinc-600">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Anil Sharma", email: "anil@example.com", student: "Rohan Sharma", activity: "10 mins ago", status: "Active" },
                { name: "Sunita Reddy", email: "sunita@example.com", student: "Kavya Reddy", activity: "Yesterday", status: "Active" },
                { name: "David Miller", email: "david@example.com", student: "Chris Miller", activity: "3d ago", status: "Inactive" },
              ].map((parent, i) => (
                <TableRow key={i} className="border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-zinc-600 font-medium">{parent.name}</span>
                      <span className="text-[10px] text-zinc-600">{parent.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600">+91 987-XXXXX</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-medium border-zinc-200">{parent.student}</Badge>
                  </TableCell>
                  <TableCell className="text-zinc-600">{parent.activity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${parent.status === 'Active' ? 'bg-green-500' : 'bg-zinc-300'}`} />
                      <span className="text-zinc-600 font-medium">{parent.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" title="Link Student">
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-zinc-600">Manage</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
