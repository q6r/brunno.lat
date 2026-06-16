import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  icon,
  title,
  className,
}: {
  children?: ReactNode;
  icon?: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip border border-subtle bg-card/60 px-2.5 py-1 text-xs text-secondary transition-colors hover:border-subtle-2 hover:text-highlight",
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
