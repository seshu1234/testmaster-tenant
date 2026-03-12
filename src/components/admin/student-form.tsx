"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  batch: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface Student {
  id: string;
  name: string;
  email: string;
  batch?: string;
  status: string;
}

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student;
  onSuccess: () => void;
}

export function StudentForm({ open, onOpenChange, student, onSuccess }: StudentFormProps) {
  const { token, tenantSlug } = useAuth();
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      batch: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        name: student.name,
        email: student.email,
        batch: student.batch || "",
        status: (student.status as StudentFormValues["status"]) || "active",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        batch: "",
        status: "active",
      });
    }
  }, [student, form]);

  const onSubmit = async (values: StudentFormValues) => {
    try {
      const url = student 
        ? `/admin/students/${student.id}` 
        : "/admin/students";
      
      const method = student ? "PUT" : "POST";

      await api(url, {
        method,
        token: token || undefined,
        tenant: tenantSlug || undefined,
        body: JSON.stringify(values),
      });

      toast.success(student ? "Student updated" : "Student created");
      onSuccess();
    } catch (err: unknown) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Student" : "Add Student"}</DialogTitle>
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
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="batch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="JEE-2026-A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {student ? "Update Details" : "Create Student"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
