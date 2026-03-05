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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
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
          password: "", // Don't show password when editing
          status: (teacher.status as "active" | "inactive" | "suspended") || "active",
        });
      } else {
        form.reset({
          name: "",
          email: "",
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
      
      // If editing, we shouldn't send empty password, so we build the payload
      const payload: Record<string, string | undefined> = {
        name: values.name,
        email: values.email,
        status: values.status,
      };

      if (values.password) {
        payload.password = values.password;
      } else if (!isEditing) {
        // If creating new teacher, password is required
        form.setError("password", { message: "Password is required for new teachers" });
        setIsSubmitting(false);
        return;
      }

      await api(isEditing ? `/admin/teachers/${teacher.id}` : "/admin/teachers", {
        method: isEditing ? "PUT" : "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify(payload)
      });

      toast.success("Success", {
        description: isEditing ? "Teacher updated successfully" : "Teacher created successfully",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details for this educator." 
              : "Create a new teacher account. They will use these credentials to log in."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEditing ? "New Password (Optional)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={isEditing ? "Leave blank to keep current" : "Minimum 8 characters"} 
                      type="password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end pt-4 space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Teacher"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
