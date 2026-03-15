"use client";

import { useState, useMemo } from "react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ParentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const handleAction = (parentName: string, action: "approved" | "rejected") => {
    toast.success(`Parent ${action}`, {
      description: `${parentName}'s registration has been ${action}.`,
    });
  };

  const parents = useMemo(() => [
    { name: "Anil Sharma", email: "anil@example.com", student: "Rohan Sharma", activity: "10 mins ago", status: "Active" },
    { name: "Sunita Reddy", email: "sunita@example.com", student: "Kavya Reddy", activity: "Yesterday", status: "Active" },
    { name: "David Miller", email: "david@example.com", student: "Chris Miller", activity: "3d ago", status: "Inactive" },
  ], []);

  const filteredParents = useMemo(() => parents.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.student.toLowerCase().includes(searchTerm.toLowerCase())
  ), [parents, searchTerm]);

  const totalPages = Math.ceil(filteredParents.length / entriesPerPage);
  const paginatedParents = useMemo(() => 
    filteredParents.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage),
  [filteredParents, currentPage, entriesPerPage]);

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
                <TableRow className="hover:bg-transparent border-b border-zinc-100 bg-zinc-50/30">
                  <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-x border-zinc-100">Parent Name</TableHead>
                  <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Requested Student</TableHead>
                  <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Request Date</TableHead>
                  <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Rajesh Kumar", student: "Aman Kumar (JEE-2026)", date: "2h ago" },
                  { name: "Sarah Williams", student: "Emma W. (NEET-2025)", date: "5h ago" },
                  { name: "Priya Sharma", student: "Rohan S. (Foundation)", date: "1d ago" },
                ].map((req, i) => (
                  <TableRow key={i} className="group hover:bg-zinc-100/50 transition-colors border-b border-zinc-100 even:bg-zinc-50/50">
                    <TableCell className="py-4 font-medium text-center border-x border-zinc-100">{req.name}</TableCell>
                    <TableCell className="py-4 text-center border-r border-zinc-100 text-zinc-600">{req.student}</TableCell>
                    <TableCell className="py-4 text-center border-r border-zinc-100 text-zinc-600">{req.date}</TableCell>
                    <TableCell className="py-4 text-center border-r border-zinc-100">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleAction(req.name, "rejected")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-green-600 hover:bg-green-50"
                          onClick={() => handleAction(req.name, "approved")}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
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
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-zinc-100 bg-zinc-50/30">
                <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-x border-zinc-100">Parent</TableHead>
                <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Contact</TableHead>
                <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Linked Students</TableHead>
                <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Last Activity</TableHead>
                <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Status</TableHead>
                <TableHead className="py-4 font-semibold text-xs text-zinc-500 uppercase tracking-tight text-center border-r border-zinc-100">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedParents.map((parent, i) => (
                <TableRow key={i} className="group hover:bg-zinc-100/50 transition-colors border-b border-zinc-100 even:bg-zinc-50/50">
                  <TableCell className="py-4 border-x border-zinc-100 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-zinc-900 font-bold text-sm">{parent.name}</span>
                      <span className="text-[10px] text-zinc-500">{parent.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center border-r border-zinc-100 text-zinc-600 text-xs">+91 987-XXXXX</TableCell>
                  <TableCell className="py-4 text-center border-r border-zinc-100">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase border-zinc-200 bg-zinc-50">{parent.student}</Badge>
                  </TableCell>
                  <TableCell className="py-4 text-center border-r border-zinc-100 text-zinc-500 text-xs">{parent.activity}</TableCell>
                  <TableCell className="py-4 text-center border-r border-zinc-100">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${parent.status === 'Active' ? 'bg-green-500' : 'bg-zinc-300'}`} />
                      <span className="text-zinc-700 font-bold text-[10px] uppercase">{parent.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center border-r border-zinc-100">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900" title="Link Student">
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-zinc-900 font-bold text-[10px] uppercase">Manage</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-zinc-50/50 border-t border-zinc-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 order-2 sm:order-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Rows per page:</span>
              <select 
                className="bg-transparent text-xs font-bold text-zinc-900 border-none focus:ring-0 cursor-pointer"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20, 50].map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 border-zinc-200 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 border-zinc-200 disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
