import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "card-sheen rounded-card border border-subtle bg-card shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}
