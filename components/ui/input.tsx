import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-default bg-surface-card px-3 py-2 text-sm text-heading placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[#DA3753] focus-visible:ring-[#DA3753]",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-[#DA3753]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  ),
);

Input.displayName = "Input";

export default Input;
