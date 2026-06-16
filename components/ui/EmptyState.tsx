import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  hint,
  className,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center justify-center gap-2 rounded-card px-6 py-12 text-center",
        className
      )}
    >
      {icon && <div className="text-2xl text-secondary opacity-70">{icon}</div>}
      <p className="text-sm font-medium text-highlight">{title}</p>
      {hint && <p className="max-w-sm text-xs leading-relaxed text-secondary">{hint}</p>}
    </div>
  );
}
