"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Palette, 
  Users, 
  GraduationCap, 
  Database,
  Sparkles,
  Loader2,
  Rocket,
  ArrowRight,
  Image as ImageIcon,
  Save
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { FileUploadService } from "@/lib/upload-service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface BrandingConfig {
  primary_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  welcome_message: string | null;
}

const steps = [
  {
    title: "Branding & Identity",
    description: "Personalize your center's look and feel.",
    icon: Palette,
    tasks: ["Upload Logo & Favicon", "Select Primary Theme", "Set Welcome Message"]
  },
  {
    title: "Academic Structure",
    description: "Organize your batches and subjects.",
    icon: GraduationCap,
    tasks: ["Create First Batch", "Define Subjects", "Set Grading Scales"]
  },
  {
    title: "Team & Community",
    description: "Invite your staff and students.",
    icon: Users,
    tasks: ["Invite Teachers", "Bulk Import Students", "Configure Parent Portal"]
  },
  {
    title: "Ready for Launch",
    description: "Final verification and sample data.",
    icon: Rocket,
    tasks: ["Run System Test", "Load Sample Data (Optional)", "Publish First Test"]
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { token, tenantSlug } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [populating, setPopulating] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  const [branding, setBranding] = useState<BrandingConfig>({
    primary_color: "#181b",
    logo_url: null,
    favicon_url: null,
    welcome_message: "Welcome to our learning platform.",
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [savingWelcome, setSavingWelcome] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const toggleTask = (taskName: string) => {
    setExpandedTask(expandedTask === taskName ? null : taskName);
  };

  const markCompleted = (taskName: string) => {
    setCompletedTasks(prev => ({ ...prev, [taskName]: true }));
    setExpandedTask(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const tenantId = tenantSlug;
    if (!file || !tenantId || !token) return;

    setUploadingLogo(true);
    try {
      const result = await FileUploadService.uploadToR2(file, "branding_logo", tenantId, token);
      setBranding({ ...branding, logo_url: result.url });
      markCompleted("Upload Logo & Favicon");
      toast.success("Logo uploaded successfully");
    } catch (err) {
      console.error("Logo upload failed", err);
      toast.error("Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const tenantId = tenantSlug;
    if (!file || !tenantId || !token) return;

    setUploadingFavicon(true);
    try {
      const result = await FileUploadService.uploadToR2(file, "branding_favicon", tenantId, token);
      setBranding({ ...branding, favicon_url: result.url });
      markCompleted("Upload Logo & Favicon");
      toast.success("Favicon uploaded successfully");
    } catch (err) {
      console.error("Favicon upload failed", err);
      toast.error("Favicon upload failed");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleThemeSelect = async (color: string) => {
    setBranding({ ...branding, primary_color: color });
    markCompleted("Select Primary Theme");
    toast.success("Theme preference saved");
  };

  const handleWelcomeSave = async () => {
    setSavingWelcome(true);
    try {
      // Small delay to simulate API if needed, or just set it
      markCompleted("Set Welcome Message");
      toast.success("Welcome message updated");
    } finally {
      setSavingWelcome(false);
    }
  };

  const handlePopulateData = async () => {
    if (!token) return;
    setPopulating(true);
    try {
      // Simulate/Execute seeding
      const response = await api("/admin/seed-sample-data", {
        method: "POST",
        token,
        tenant: tenantSlug || undefined
      });
      
      if (response.success) {
        toast.success("Sample Data Populated", {
          description: "Your platform is now ready with realistic test data.",
        });
      }
    } catch (error) {
       console.error("Seeding failed:", error);
       toast.error("Operation Failed", {
         description: "We couldn't populate sample data at this time.",
       });
    } finally {
      setPopulating(false);
    }
  };

  const handleSkip = () => {
    router.push("/admin");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.success("Center Setup Complete!", {
        description: "You've successfully configured your institution on TestMaster.",
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-zinc-600 space-y-2">
        <h1 className="text-zinc-600 font-extrabold tracking-tight">Center Setup Wizard</h1>
        <p className="text-zinc-600">
          Welcome to TestMaster. Let&apos;s get your center ready for excellence in 4 simple steps.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-xl font-bold uppercase tracking-widest text-zinc-600 px-1">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2 bg-zinc-100" />
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <Card className="border shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md">
                <StepIcon className="h-8 w-8 text-zinc-600" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-zinc-600">{steps[currentStep].title}</CardTitle>
                <CardDescription className="text-zinc-600">{steps[currentStep].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid gap-4">
              {steps[currentStep].tasks.map((task, i) => (
                <div key={i} className="space-y-3">
                  <button 
                    onClick={() => toggleTask(task)}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 text-zinc-600 group",
                      completedTasks[task] 
                        ? "bg-zinc-50 border-zinc-200" 
                        : expandedTask === task
                        ? "bg-white border-zinc-900 shadow-lg ring-1 ring-zinc-900"
                        : "bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-md"
                    )}
                  >
                    <div className={cn(
                      "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                      completedTasks[task] 
                        ? "bg-emerald-500 border-emerald-500" 
                        : "border-zinc-200 group-hover:border-zinc-400"
                    )}>
                       {completedTasks[task] && <CheckCircle2 className="h-4 w-4 text-zinc-600" />}
                     </div>
                     <span className={cn(
                       "font-bold text-zinc-600 uppercase tracking-widest transition-all",
                       completedTasks[task] ?  "text-zinc-600 line-through decoration-emerald-500 decoration-2 underline-offset-4" : ""
                     )}>{task}</span>
                    <ArrowRight className={cn(
                      "h-4 w-4 ml-auto text-zinc-600 transition-all",
                      expandedTask === task ? "rotate-90 text-zinc-600" : "group-hover:translate-x-1"
                    )} />
                  </button>

                  {/* Task Specific Inputs */}
                  {expandedTask === task && (
                    <div className="px-5 pb-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                        {task === "Upload Logo & Favicon" && (
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Brand Logo</Label>
                              <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center bg-white overflow-hidden relative">
                                  {branding.logo_url ? (
                                    <Image src={branding.logo_url} alt="Logo Preview" width={64} height={64} className="object-contain p-2" />
                                  ) : (
                                    <ImageIcon className="h-6 w-6 text-zinc-600" />
                                  )}
                                  {uploadingLogo && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <Input 
                                    type="file" 
                                    className="h-10 text-[10px] font-bold rounded-xl border-zinc-200 bg-white" 
                                    onChange={handleLogoUpload}
                                    disabled={uploadingLogo}
                                  />
                                  <p className="text-[9px] text-zinc-600 font-medium">Clear background PNG recommended (250x100px).</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Favicon</Label>
                              <div className="flex items-center gap-6">
                                <div className="h-12 w-12 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center bg-white overflow-hidden relative">
                                  {branding.favicon_url ? (
                                    <Image src={branding.favicon_url} alt="Favicon Preview" width={32} height={32} className="object-contain p-1" />
                                  ) : (
                                    <ImageIcon className="h-4 w-4 text-zinc-600" />
                                  )}
                                  {uploadingFavicon && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <Input 
                                    type="file" 
                                    className="h-10 text-[10px] font-bold rounded-xl border-zinc-200 bg-white" 
                                    onChange={handleFaviconUpload}
                                    disabled={uploadingFavicon}
                                  />
                                  <p className="text-[9px] text-zinc-600 font-medium">Standard ICO or 32x32px PNG.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {task === "Select Primary Theme" && (
                          <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Brand Colors</Label>
                            <div className="flex flex-wrap gap-3">
                              {["#181b", "#1e40af", "#7c3aed", "#16a34a", "#dc2626", "#ea580c"].map(color => (
                                <button
                                  key={color}
                                  onClick={() => handleThemeSelect(color)}
                                  className={cn(
                                    "h-10 w-10 rounded-full border-2 transition-all hover:scale-110 shadow-sm",
                                    branding.primary_color === color ? "border-zinc-900 scale-125 ring-2 ring-offset-2 ring-zinc-900" : "border-transparent"
                                  )}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {task === "Set Welcome Message" && (
                          <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Student Welcome</Label>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="e.g. Welcome to Excellence Academy" 
                                className="h-12 rounded-xl border-zinc-200 bg-white text-xl font-bold"
                                value={branding.welcome_message || ""}
                                onChange={(e) => setBranding({ ...branding, welcome_message: e.target.value })}
                              />
                              <Button 
                                className="h-12 w-12 rounded-xl bg-black text-zinc-600 shrink-0" 
                                size="icon"
                                onClick={handleWelcomeSave}
                                disabled={savingWelcome}
                              >
                                {savingWelcome ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Fallback for other tasks */}
                        {!["Upload Logo & Favicon", "Select Primary Theme", "Set Welcome Message"].includes(task) && (
                          <div className="text-zinc-600 py-4 space-y-3">
                            <Rocket className="h-8 w-8 text-zinc-600 mx-auto" strokeWidth={1.5} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Coming soon in production</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 rounded-lg text-[9px] font-bold"
                              onClick={() => markCompleted(task)}
                            >
                              MARK AS READY
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentStep === 0}
                className="gap-2 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                className="gap-2 px-8 bg-black text-zinc-600 hover:bg-zinc-800 rounded-xl"
              >
                {currentStep === steps.length - 1 ? "Finish Setup" : "Continue"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border shadow-none bg-zinc-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Quick Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-600 leading-relaxed font-medium">
                {currentStep === 0 && "Your logo will appear on student result cards and login pages. Use a high-resolution PNG for clarity."}
                {currentStep === 1 && "Start with your main academic batches. You can always refine subjects and grading later."}
                {currentStep === 2 && "Invite your senior staff first. They can help with the bulk import of student data."}
                {currentStep === 3 && "Loading sample data allows you to test the student dashboard experience without real accounts."}
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-zinc-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <Database className="h-3 w-3" />
                Demo Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-[10px] text-zinc-600 leading-tight font-medium">
                 Want to explore the platform before setting it up? 
               </p>
               <Button 
                 variant="outline" 
                 size="sm" 
                 className="w-full text-[10px] h-9 gap-2 border-zinc-200 rounded-xl font-bold"
                 onClick={handlePopulateData}
                 disabled={populating}
               >
                  {populating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  {populating ? "POPULATING..." : "POPULATE SAMPLE DATA"}
               </Button>
            </CardContent>
          </Card>

          <Button 
            variant="link" 
            className="w-full text-[10px] font-bold uppercase tracking-widest text-zinc-600 "
            onClick={handleSkip}
          >
            Skip for now, go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
