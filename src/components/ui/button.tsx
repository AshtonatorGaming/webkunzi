import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "ghost" | "primary" | "danger" | "staff" | "gold";

export function Button({
  className,
  variant = "ghost",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-9 items-center justify-center rounded-sm px-3 text-sm font-medium",
        "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-accent text-accent-fg hover:opacity-90",
        variant === "ghost" && "border border-border bg-raised text-fg hover:bg-hover",
        variant === "danger" && "bg-danger text-fg hover:opacity-90",
        variant === "staff" && "bg-staff text-fg hover:opacity-90",
        variant === "gold" && "border border-gold-dim bg-raised text-gold hover:bg-hover",
        className,
      )}
      {...props}
    />
  );
}
