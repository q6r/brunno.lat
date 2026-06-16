import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "glass rounded-card shadow-card transition-[border-color,box-shadow,transform] duration-300 hover:border-subtle-2 hover:shadow-glow",
        className
      )}
    >
      {children}
    </div>
  );
}
