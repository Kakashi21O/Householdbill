import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "paid" | "unpaid" | "partial" | "info" | "default";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]",
    paid: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
    unpaid: "bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30",
    partial: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
    info: "bg-[var(--secondary)]/15 text-[var(--secondary)] border-[var(--secondary)]/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
