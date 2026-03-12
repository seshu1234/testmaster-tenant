"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Plus, 
  Trash2, 
  ChevronRight,
  ShieldCheck,
  Users,
  Lock,
  Edit2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";



const permissionGroups = [
  {
    group: "Academic",
    permissions: [
      { id: "tests_create", name: "Create & Edit Tests", description: "Design assessments and questions." },
      { id: "tests_approve", name: "Approve Tests", description: "Moderate teacher submissions." },
      { id: "batch_manage", name: "Manage Batches", description: "Create groups and assign users." },
    ]
  },
  {
    group: "Administrative",
    permissions: [
      { id: "users_manage", name: "User Management", description: "Add/Suspend students & teachers." },
      { id: "billing_view", name: "View Billing", description: "Access invoices and plan details." },
      { id: "settings_brand", name: "Institutional Branding", description: "Change logos and themes." },
    ]
  },
  {
    group: "Data & Reach",
    permissions: [
      { id: "comm_broadcast", name: "Broadcast Messages", description: "Send campus-wide announcements." },
      { id: "reports_export", name: "Export Reports", description: "Download CSV/PDF analytics." },
      { id: "audit_view", name: "View Audit Logs", description: "Monitor administrative actions." },
    ]
  }
];

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState("admin");
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Role Updated", {
        description: "Permissions have been synchronized across all users with this role.",
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground">
            Define granular access levels for your staff and academic departments.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Custom Role
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="space-y-3">
          {[
            { id: "admin", name: "Super Admin", count: 2, icon: ShieldCheck, color: "text-red-600 bg-red-50" },
            { id: "hod", name: "Dept Head", count: 4, icon: Shield, color: "text-blue-600 bg-blue-50" },
            { id: "teacher", name: "Standard Teacher", count: 12, icon: Users, color: "text-zinc-600 bg-zinc-50" },
            { id: "moderator", name: "Content Mod", count: 3, icon: Lock, color: "text-orange-600 bg-orange-50" },
          ].map((role) => (
            <div 
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                selectedRole === role.id ? 'border-primary ring-1 ring-primary/20 bg-white' : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${role.color}`}>
                  <role.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight">{role.name}</span>
                  <span className="text-[10px] text-muted-foreground">{role.count} Users</span>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${selectedRole === role.id ? 'text-primary translate-x-1' : 'text-zinc-300'}`} />
            </div>
          ))}
        </div>

        <Card className="md:col-span-3 border-none shadow-sm bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="capitalize">{selectedRole.replace('-', ' ')} Permissions</CardTitle>
              <CardDescription>Configure what this role can see and do.</CardDescription>
            </div>
            {selectedRole !== 'admin' && (
              <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 gap-2">
                <Trash2 className="h-3 w-3" />
                Delete Role
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role Name</label>
              <div className="flex gap-2">
                <Input defaultValue={selectedRole.toUpperCase()} className="max-w-xs" />
                <Button variant="outline" size="sm" className="gap-2">
                   <Edit2 className="h-3 w-3" />
                   Rename
                </Button>
              </div>
            </div>

            <div className="space-y-6 border-t pt-6">
              {permissionGroups.map((group) => (
                <div key={group.group} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">{group.group}</h4>
                  <div className="grid gap-4">
                    {group.permissions.map((perm) => (
                      <div key={perm.id} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 bg-zinc-50/30 hover:bg-white transition-colors group">
                        <Checkbox 
                          id={perm.id} 
                          defaultChecked={selectedRole === 'admin'} 
                          disabled={selectedRole === 'admin'}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-0.5">
                          <label htmlFor={perm.id} className="text-sm font-bold cursor-pointer">{perm.name}</label>
                          <p className="text-xs text-muted-foreground leading-relaxed italic">{perm.description}</p>
                        </div>
                        {selectedRole === 'admin' && (
                           <Badge variant="secondary" className="text-[9px] bg-zinc-200">Locked</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline">Reset Changes</Button>
              <Button onClick={handleSave} disabled={loading} className="px-8">
                {loading ? "Syncing..." : "Save Role Config"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
