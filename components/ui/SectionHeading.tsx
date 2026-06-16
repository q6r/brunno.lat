import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  title,
  subtitle,
  kicker,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex items-end justify-between gap-4 sm:mb-8",
        className
      )}
    >
      <div className="flex flex-col gap-1.5">
        {kicker && (
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
            {kicker}
          </span>
        )}
        <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="max-w-xl text-sm text-secondary">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
