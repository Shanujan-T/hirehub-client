import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C44B7] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "brand-gradient glow-btn text-white shadow-md hover:opacity-95 active:scale-[0.98]",
        accent:
          "cta-gradient glow-btn-accent text-white shadow-md hover:opacity-95 active:scale-[0.98]",
        secondary:
          "accent-gradient glow-btn text-white shadow-md hover:opacity-95 active:scale-[0.98]",
        outline:
          "border-2 border-[#0C44B7] bg-transparent text-[#0C44B7] hover:bg-[#0C44B7]/10 dark:border-[#22d3ee] dark:text-[#22d3ee] dark:hover:bg-[#22d3ee]/10",
        ghost:
          "bg-transparent text-[#133099] hover:bg-surface-muted dark:text-[#e2e8f0] dark:hover:bg-white/5",
        destructive:
          "bg-gradient-to-r from-[#DA3753] to-[#F94D32] text-white shadow-md hover:opacity-95 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  ),
);

Button.displayName = "Button";

export { buttonVariants };
export default Button;
