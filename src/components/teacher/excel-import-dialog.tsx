"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}

export function ExcelImportDialog({ open, onOpenChange, onImportSuccess }: ExcelImportDialogProps) {
  const { user, token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setMessage("");
    }
  };

  const handleImport = async () => {
    if (!file || !user || !token) return;

    setLoading(true);
    setStatus("uploading");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use standard fetch here because api() helper might not handle FormData seamlessly 
      // depending on its implementation (it usually expects JSON)
      const headers: HeadersInit = {
        "Authorization": `Bearer ${token}`,
      };
      
      if (user?.tenant_id) {
        headers["X-Tenant"] = user.tenant_id;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/teacher/questions/bulk`, {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setMessage("Questions imported successfully!");
        setTimeout(() => {
          onImportSuccess();
          onOpenChange(false);
          setFile(null);
          setStatus("idle");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(result.message || "Failed to import questions. Please check the file format.");
      }
    } catch (error) {
      console.error("Import failed:", error);
      setStatus("error");
      setMessage("A network error occurred during import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-zinc-600" />
            Bulk Import Questions
          </DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx) or CSV file containing your questions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file" className="text-zinc-600">
              Select File
            </Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-zinc-50/50 hover:bg-zinc-100 transition-colors cursor-pointer relative">
              <Input 
                id="file" 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={loading}
              />
              <FileUp className={`h-8 w-8 mb-2 ${file ? 'text-emerald-600' : 'text-zinc-400'}`} />
              <p className="text-zinc-600 font-medium">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-zinc-600 opacity-80">
                MAX: 5MB (XLSX, CSV)
              </p>
            </div>
          </div>

          {status === "success" && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-100 border border-green-200 text-zinc-600">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-100 border border-red-200 text-zinc-600">
              <AlertCircle className="h-4 w-4" />
              {message}
            </div>
          )}

          <div className="p-3 rounded-md bg-blue-50 border border-blue-100 text-zinc-600">
            <p className="font-semibold mb-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Template Guide:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Columns: title, content, type, marks...</li>
              <li>Type: mcq_single, mcq_multiple, true_false</li>
              <li>Check our <span className="underline cursor-pointer">Sample Template</span></li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Importing..." : "Start Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
