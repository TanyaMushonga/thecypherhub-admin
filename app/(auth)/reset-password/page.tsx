"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/othercomponents/passwordInput";
import LoadingButton from "@/components/othercomponents/LoadingButton";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      setError("Missing token");
      return;
    }
    setError(undefined);
    setSuccess(undefined);
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password: values.password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Something went wrong");
        } else {
          setSuccess("Password reset successfully. Redirecting...");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  if (!token) {
    return (
      <main className="flex justify-center items-center h-[90vh] bg-[#020617] text-white">
        <p>Invalid link. Please check your email again.</p>
      </main>
    );
  }

  return (
    <main className="flex justify-center items-center md:p-10 p-5 h-[90vh]">
      <div className="h-fit w-full max-w-[30rem] overflow-hidden bg-card border border-border rounded-lg p-5">
        <h1 className="text-center text-xl md:text-2xl font-bold mb-5">
          Reset Password
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && <p className="text-center text-destructive">{error}</p>}
            {success && <p className="text-center text-green-500">{success}</p>}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="New password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Confirm password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton loading={isPending} type="submit" className="w-full">
              Reset Password
            </LoadingButton>
          </form>
        </Form>
      </div>
    </main>
  );
}
