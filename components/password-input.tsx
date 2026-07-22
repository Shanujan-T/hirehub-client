"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="w-full">
        <div className="relative">
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full rounded-lg border border-default bg-surface-card px-3 py-2 pr-10 text-sm text-heading placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-[#DA3753] focus-visible:ring-[#DA3753]",
              className,
            )}
            aria-invalid={Boolean(error)}
            {...props}
          />
          <button
            type="button"
            disabled={disabled}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] disabled:pointer-events-none disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((show) => !show)}
          >
            {visible ? (
              <EyeOff className="h-[18px] w-[18px]" aria-hidden />
            ) : (
              <Eye className="h-[18px] w-[18px]" aria-hidden />
            )}
          </button>
        </div>
        {error ? (
          <p className="mt-1 text-xs text-[#DA3753]" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
