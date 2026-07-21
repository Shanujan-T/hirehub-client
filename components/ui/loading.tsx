import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

export function LoadingSpinner({
  className,
  size = "md",
  label = "Loading…",
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-[#0C44B7]", sizeMap[size], className)}
      aria-label={label}
      role="status"
    />
  );
}

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <LoadingSpinner size="lg" label={label} />
      <p className="text-sm text-subtle">{label}</p>
    </div>
  );
}

export function LoadingOverlay({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-surface/70 backdrop-blur-sm">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}

export default LoadingSpinner;
