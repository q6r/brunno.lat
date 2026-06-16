import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StatChip({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass inline-flex items-center gap-2.5 rounded-chip px-4 py-2",
        className
      )}
    >
      {icon && <span className="text-secondary">{icon}</span>}
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-medium tabular-nums text-primary">
          {value}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-secondary">
          {label}
        </span>
      </span>
    </div>
  );
}
