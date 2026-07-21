"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, User } from "lucide-react";
import { toast } from "sonner";
import { GuestRoute } from "@/components/auth-guard";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormGroup } from "@/app/_components/page-states";
import { useAuth } from "@/providers/auth-provider";
import { getApiErrorMessage } from "@/lib/api-client";
import { getDashboardPath, cn } from "@/lib/utils";

const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["seeker", "employer"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const defaultRole =
    searchParams.get("role") === "employer" ? "employer" : "seeker";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    try {
      const user = await registerUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      toast.success("Account created — welcome!");
      router.push(getDashboardPath(user.role));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Join HireHub" subtitle="Create your account and start your journey">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <p className="text-heading mb-2 text-sm font-semibold">I am a...</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("role", "seeker")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                selectedRole === "seeker"
                  ? "border-[#0C44B7] bg-[#0C44B7]/5"
                  : "border-default hover:border-[#0C44B7]/40",
              )}
            >
              <User
                className={cn(
                  "h-6 w-6",
                  selectedRole === "seeker" ? "text-[#0C44B7]" : "text-subtle",
                )}
              />
              <span className="text-sm font-semibold">Job Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setValue("role", "employer")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                selectedRole === "employer"
                  ? "border-[#AB2F74] bg-[#AB2F74]/10 dark:border-[#e040fb] dark:bg-[#e040fb]/10"
                  : "border-default hover:border-[#AB2F74]/40 dark:hover:border-[#e040fb]/40",
              )}
            >
              <Briefcase
                className={cn(
                  "h-6 w-6",
                  selectedRole === "employer" ? "text-[#AB2F74] dark:text-[#e040fb]" : "text-subtle",
                )}
              />
              <span className="text-sm font-semibold">Employer</span>
            </button>
          </div>
          <input type="hidden" {...register("role")} />
          {errors.role && (
            <p className="mt-1 text-xs text-[#DA3753]">{errors.role.message}</p>
          )}
        </div>

        <FormGroup label="Full Name">
          <Input
            {...register("full_name")}
            placeholder="Jane Doe"
            autoComplete="name"
            error={errors.full_name?.message}
          />
        </FormGroup>

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
          <Input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
          />
        </FormGroup>

        <Button type="submit" className="w-full" loading={submitting}>
          Create Account
        </Button>

        <p className="text-subtle text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#0C44B7] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <GuestRoute>
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </GuestRoute>
  );
}
