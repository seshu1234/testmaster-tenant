"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface TestApprovalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: string;
  testTitle: string;
  onAction: () => void;
}

export function TestApprovalDialog({ open, onOpenChange, testId, testTitle, onAction }: TestApprovalProps) {
  const { token, tenantSlug } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: "published" | "draft") => {
    try {
      setLoading(true);
      await api(`/admin/tests/${testId}/status`, {
        method: "PUT",
        token: token || undefined,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({ 
          status,
          admin_feedback: feedback 
        }),
      });

      toast.success(status === "published" ? "Test Approved" : "Test returned to draft");
      onAction();
    } catch (err: unknown) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Action failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Review Test: {testTitle}
          </DialogTitle>
          <DialogDescription>
            Approve this test for publication or request changes from the teacher.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-2">
           <label className="text-sm font-medium">Internal Feedback / Rejection Reason</label>
           <Textarea 
             placeholder="Optional feedback for the teacher..."
             value={feedback}
             onChange={(e) => setFeedback(e.target.value)}
             className="min-h-[100px]"
           />
        </div>

        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleAction("draft")}
            disabled={loading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Request Fix
          </Button>
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => handleAction("published")}
            disabled={loading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve & Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
