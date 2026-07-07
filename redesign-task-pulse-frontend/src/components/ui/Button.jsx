import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover shadow-tp-sm",
  secondary:
    "bg-surface text-foreground border border-border hover:border-border-strong hover:bg-elevated",
  ghost: "text-muted hover:text-foreground hover:bg-accent-soft",
  ai: "tp-ai-surface tp-ai-glow hover:brightness-110",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

/**
 * Button — shared primitive for TaskPulse.
 * variant: primary | secondary | ghost | ai
 * size: sm | md | lg
 */
const Button = forwardRef(function Button(
  { as: Comp = "button", variant = "primary", size = "md", className, ...props },
  ref
) {
  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 ease-tp-spring disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

export default Button;
