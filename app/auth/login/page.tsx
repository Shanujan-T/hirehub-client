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
import { getDashboardPath } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

type LoginForm = z.infer<typeof loginSchema>;
type OtpForm = z.infer<typeof otpSchema>;

function LoginForm() {
  const router = useRouter();
  const { login, verify2fa } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [debugHint, setDebugHint] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      const result = await login({ email: data.email, password: data.password });
      if (result.requires_2fa) {
        setTempToken(result.temp_token);
        setDebugHint(result.debug_otp ?? null);
        toast.message("Enter the verification code sent to you");
        return;
      }
      toast.success("Welcome back!");
      router.push(getDashboardPath(result.user.role));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async (data: OtpForm) => {
    if (!tempToken) return;
    setSubmitting(true);
    try {
      const user = await verify2fa({ temp_token: tempToken, code: data.code });
      toast.success("Welcome back!");
      router.push(getDashboardPath(user.role));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (tempToken) {
    return (
      <AuthLayout
        title="Two-factor authentication"
        subtitle="Enter the 6-digit code we sent you"
      >
        <form onSubmit={otpForm.handleSubmit(onVerify)} className="space-y-4">
          <FormGroup label="Verification code">
            <Input
              {...otpForm.register("code")}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              aria-label="Six-digit verification code"
              error={otpForm.formState.errors.code?.message}
            />
          </FormGroup>
          {debugHint ? (
            <p className="text-subtle text-xs" role="status">
              Demo code: {debugHint}
            </p>
          ) : null}
          <Button type="submit" className="w-full" loading={submitting}>
            Verify and sign in
          </Button>
          <button
            type="button"
            className="text-subtle w-full text-center text-sm hover:underline"
            onClick={() => {
              setTempToken(null);
              setDebugHint(null);
              otpForm.reset();
            }}
          >
            Back to sign in
          </button>
        </form>
      </AuthLayout>
    );
  }

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
