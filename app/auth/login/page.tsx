"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GuestRoute } from "@/components/auth-guard";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { FormGroup } from "@/app/_components/page-states";
import { useAuth } from "@/providers/auth-provider";
import { getApiErrorMessage } from "@/lib/api-client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      await login({ email: data.email, password: data.password });
      toast.success("Welcome back!");
      router.push("/");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your HireHub account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormGroup label="Email">
          <Input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
          />
        </FormGroup>

        <FormGroup label="Password">
          <PasswordInput
            {...register("password")}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
          />
        </FormGroup>

        <Button type="submit" className="w-full" loading={submitting}>
          Sign In
        </Button>

        <p className="text-subtle text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-[#0C44B7] hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <GuestRoute>
      <LoginForm />
    </GuestRoute>
  );
}
