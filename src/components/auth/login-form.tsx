"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "teacher", "student", "parent"]),
});

export function LoginForm() {
  const { login, branding } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      await login(values);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please check your credentials.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-none bg-white/80 backdrop-blur-md">
      <CardHeader>
        {branding?.logo_url && (
          <div className="flex justify-center mb-4">
            <Image src={branding.logo_url} alt="Logo" className="h-12 w-auto object-contain" width={100} height={100} />
          </div>
        )}
        <CardTitle className="text-xl font-bold text-zinc-600 tracking-tight">
          {branding?.welcome_message || "Welcome Back"}
        </CardTitle>
        <p className="text-zinc-600 text-zinc-600">Sign in to your account</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login as</FormLabel>
                  <FormControl>
                    <select 
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-zinc-600 ring-offset-background file:border-0 file:bg-transparent file :text-zinc-600 file:font-medium placeholder :text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Centre Admin</option>
                      <option value="parent">Parent</option>
                    </select>
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
                    <Input 
                      placeholder="name@example.com" 
                      {...field} 
                      className="transition-colors hover:border-primary/50 focus-visible:ring-primary/30"
                    />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      className="transition-colors hover:border-primary/50 focus-visible:ring-primary/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="font-medium text-zinc-600 bg-destructive/10 p-3 rounded-md animate-in fade-in slide-in-from-top-1 duration-300">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              variant="default"
              className="w-full py-6 text-white font-semibold bg-black hover:bg-black/90 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] active:shadow-md disabled:hover:scale-100 disabled:active:scale-100" 
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}