"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Bell, Save, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

interface NotificationTemplate {
  id: string;
  trigger: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
}

export default function NotificationSettingsPage() {
  const { user, token } = useAuth();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user || !token) return;
      try {
        const response = await api(`/admin/notifications/templates`, { token, tenant: user.tenant_id });
        if (response.success) {
          setTemplates(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [user, token]);

  const handleUpdate = async (template: NotificationTemplate) => {
    if (!user || !token) return;
    setSaving(template.id);
    setMessage(null);
    try {
      const response = await api(`/admin/notifications/templates/${template.id}`, {
        method: 'PUT',
        token,
        tenant: user.tenant_id,
        body: JSON.stringify({
          subject: template.subject,
          body: template.body,
          is_active: template.is_active
        })
      });
      if (response.success) {
        setMessage({ type: 'success', text: `${template.name} updated successfully!` });
      } else {
        setMessage({ type: 'error', text: 'Failed to update template.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setSaving(null);
    }
  };

  const updateTemplateState = (id: string, updates: Partial<NotificationTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Notification Settings</h1>
          <p className="text-zinc-600">Customize emails and alerts sent to your students and teachers.</p>
        </div>
        <Bell className="h-10 w-10 te/20" />
      </div>

      {message && (
        <Card className={`${message.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <CardContent className="py-3 flex items-center gap-3">
             {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-zinc-600" /> : <AlertCircle className="h-5 w-5 text-zinc-600" />}
             <p className={`text-zinc-600 font-medium ${message.type === 'success' ? 'te' : 'te'}`}>
                {message.text}
             </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden border-zinc-200 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="bg-zinc-50/50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">{template.name}</CardTitle>
                  <CardDescription>Trigger: <code className="text-zinc-600 bg-zinc-200 px-1 rounded">{template.trigger}</code></CardDescription>
                </div>
                <div className="flex items-center gap-2">
                   <Label htmlFor={`active-${template.id}`} className="text-zinc-600 font-semibold text-zinc-600 uppercase">Active</Label>
                   <Switch 
                      id={`active-${template.id}`}
                      checked={template.is_active} 
                      onCheckedChange={(checked) => updateTemplateState(template.id, { is_active: checked })}
                   />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-xl font-bold">Email Subject</Label>
                <Input 
                  value={template.subject}
                  onChange={(e) => updateTemplateState(template.id, { subject: e.target.value })}
                  placeholder="Enter subject line..."
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xl font-bold">Email Body</Label>
                <Textarea 
                  value={template.body}
                  onChange={(e) => updateTemplateState(template.id, { body: e.target.value })}
                  rows={6}
                  className="font-mono text-zinc-600 leading-relaxed"
                />
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 mt-2">
                   <Info className="h-4 w-4 text-zinc-600 mt-0.5" />
                   <p className="text-[11px] text-zinc-600 leading-normal">
                      Available dynamic tags: <code className="bg-blue-100 px-1 rounded">{"{{student_name}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{test_name}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{percentage}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{tenant_name}}"}</code>
                   </p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={() => handleUpdate(template)}
                  disabled={saving === template.id}
                  className="gap-2"
                >
                  {saving === template.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
