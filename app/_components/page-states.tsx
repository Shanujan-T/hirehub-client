import type { LucideIcon } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading";
export { EmptyState } from "@/components/empty-state";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return <LoadingScreen label={message} />;
}

export function FormGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-heading">{label}</label>
        {hint && <p className="text-subtle mt-0.5 text-xs">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
