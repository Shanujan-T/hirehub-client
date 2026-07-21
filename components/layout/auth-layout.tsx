import type { ReactNode } from "react";
import { Briefcase, Sparkles, Users } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

const features = [
  { icon: Briefcase, text: "Thousands of local job listings" },
  { icon: Sparkles, text: "Smart skill-based matching" },
  { icon: Users, text: "Career communities & mentorship" },
];

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title = "Welcome back",
  subtitle = "Sign in to continue to HireHub",
  className,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <div className="relative hidden flex-1 overflow-hidden lg:flex">
        <div className="absolute inset-0 hero-gradient" />
        <div className="hero-pattern absolute inset-0 opacity-40" />
        <div
          className="mesh-glow left-1/4 top-1/4 h-72 w-72 opacity-40"
          style={{ background: "#22d3ee" }}
        />
        <div
          className="mesh-glow bottom-1/4 right-1/4 h-64 w-64 opacity-35"
          style={{ background: "#e040fb" }}
        />
        <div
          className="mesh-glow bottom-1/3 left-1/2 h-56 w-56 opacity-30"
          style={{ background: "#f97316" }}
        />
        <div className="absolute inset-0 bg-[#050505]/60" />
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-black/50 xl:size-[4.5rem]">
              <BrandLogo size="lg" forceDarkIcon showName={false} href="/" />
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight text-white xl:text-3xl">
              HireHub
            </span>
          </div>
          <div className="max-w-md space-y-6">
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Find your next role with{" "}
              <span className="brand-gradient-text">confidence</span>
            </h1>
            <p className="text-lg text-white/85">
              Browse jobs, connect with companies, and grow your career — all in one place.
            </p>
            <ul className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-[#22d3ee]" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-white/50">
            Trusted by seekers and employers worldwide
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col justify-center bg-surface px-6 py-12 sm:px-10 lg:max-w-lg xl:max-w-xl dark:bg-transparent",
          className,
        )}
      >
        <div className="mb-8 lg:hidden">
          <BrandLogo size="md" />
        </div>

        <div className="mx-auto w-full max-w-md space-y-2">
          <div className="brand-gradient-line mb-4 w-12 lg:hidden" />
          <h2 className="section-title text-2xl">{title}</h2>
          <p className="text-subtle">{subtitle}</p>
        </div>

        <div className="glass-card mx-auto mt-8 w-full max-w-md rounded-2xl p-6 dark:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
