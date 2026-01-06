"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/othercomponents/LoadingButton";
import Link from "next/link";
// We'll create this action later
// import { forgotPassword } from "@/actions/forgotPassword";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setError(undefined);
    setSuccess(undefined);
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Something went wrong");
        } else {
          setSuccess("If an account exists, a reset link has been sent.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <main className="flex justify-center items-center md:p-10 p-5 h-[90vh]">
      <div className="h-fit w-full max-w-[30rem] overflow-hidden bg-card border border-border rounded-lg p-5">
        <h1 className="text-center text-xl md:text-2xl font-bold mb-5">
          Forgot Password
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && <p className="text-center text-destructive">{error}</p>}
            {success && <p className="text-center text-green-500">{success}</p>}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton loading={isPending} type="submit" className="w-full">
              Send Reset Link
            </LoadingButton>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-primary hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
}
