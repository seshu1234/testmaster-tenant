// src/components/admin/teacher-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Key, 
  Activity,
  Plus,
  Save,
  X 
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  subjects: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TeacherFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subjects?: string[];
    status?: string | null;
  };
  onSuccess: () => void;
}

export function TeacherForm({ open, onOpenChange, teacher, onSuccess }: TeacherFormProps) {
  const { token, tenantSlug } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!teacher;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subjects: "",
      password: "",
      status: "active",
    },
  });

  // Reset form when teacher prop changes or dialog opens
  useEffect(() => {
    if (open) {
      if (teacher) {
        form.reset({
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone || "",
          subjects: teacher.subjects?.join(", ") || "",
          password: "", 
          status: (teacher.status as "active" | "inactive" | "suspended") || "active",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          phone: "",
          subjects: "",
          password: "",
          status: "active",
        });
      }
    }
  }, [open, teacher, form]);

  const onSubmit = async (values: FormValues) => {
    if (!token) return;

    try {
      setIsSubmitting(true);
      
      const payload: {
        name: string;
        email: string;
        phone?: string;
        status?: string;
        subjects: string[];
        password?: string;
      } = {
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        status: values.status,
        subjects: values.subjects 
          ? values.subjects.split(",").map(s => s.trim()).filter(Boolean)
          : ["General"],
      };

      if (values.password) {
        payload.password = values.password;
      } else if (!isEditing) {
        // If creating new teacher, password is required
        form.setError("password", { message: "Password is required for new teachers" });
        setIsSubmitting(false);
        return;
      }

      const response = await api(isEditing ? `/admin/teachers/${teacher.id}` : "/admin/teachers", {
        method: isEditing ? "PUT" : "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify(payload)
      });

      toast.success(isEditing ? "Update Complete" : "Teacher Created", {
        description: response.message || (isEditing ? "Teacher updated successfully" : "Teacher created successfully"),
      });
      
      onSuccess();
    } catch (err: unknown) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[550px] bg-white border-zinc-200 p-0 overflow-hidden shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 text-white">
                {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold">{isEditing ? "Edit Teacher Profile" : "Register New Teacher"}</DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm">
              {isEditing 
                ? "Update teacher contact details and subject specializations." 
                : "Enter teacher details to grant them access to the platform."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
                        <User className="h-3 w-3" /> Full Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seshu Budda" 
                          {...field} 
                          autoComplete="off"
                          className="h-10 bg-white border-zinc-200 focus:ring-2 focus:ring-zinc-900 transition-all rounded-xl" 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
                        <Mail className="h-3 w-3" /> Email Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="teacher@demo.com" 
                          type="email" 
                          {...field} 
                          autoComplete="off"
                          className="h-10 bg-white border-zinc-200 focus:ring-2 focus:ring-zinc-900 transition-all rounded-xl" 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
                        <Phone className="h-3 w-3" /> Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+91..." 
                          {...field} 
                          autoComplete="off"
                          className="h-10 bg-white border-zinc-200 focus:ring-2 focus:ring-zinc-900 transition-all rounded-xl" 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
                        <BookOpen className="h-3 w-3" /> Subjects
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Maths, Physics..." 
                          {...field} 
                          autoComplete="off"
                          className="h-10 bg-white border-zinc-200 focus:ring-2 focus:ring-zinc-900 transition-all rounded-xl" 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
                          <Key className="h-3 w-3" /> {isEditing ? "New Password" : "Password"}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={isEditing ? "Keep blank to unchanged" : "Min 8 characters"} 
                            type="password" 
                            {...field} 
                            autoComplete="off"
                            className="h-10 bg-white border-zinc-200 focus:ring-2 focus:ring-zinc-900 transition-all rounded-xl"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  {isEditing && (
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
                            <Activity className="h-3 w-3" /> Access Status
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 bg-white border-zinc-200 rounded-xl">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white border-zinc-200">
                              <SelectItem value="active" className="text-zinc-600 font-medium">Active</SelectItem>
                              <SelectItem value="inactive" className="text-zinc-600 font-medium">Inactive</SelectItem>
                              <SelectItem value="suspended" className="text-zinc-600 font-medium">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="px-6 h-10 font-bold text-zinc-600 uppercase tracking-widest hover:bg-zinc-50 border-zinc-100 rounded-xl"
                >
                  <X className="mr-2 h-3.5 w-3.5" /> Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 h-10 font-bold uppercase tracking-widest bg-zinc-900 text-white hover:opacity-90 active:scale-95 transition-all shadow-lg rounded-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                       <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       {isEditing ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                       {isEditing ? "Save" : "Create"}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
