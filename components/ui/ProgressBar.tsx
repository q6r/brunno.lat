import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  accent,
  animated = false,
  className,
}: {
  value: number;
  accent?: string;
  animated?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn(
        "h-1 w-full overflow-hidden rounded-chip bg-subtle",
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-chip",
          animated && "transition-[width] duration-1000 ease-linear"
        )}
        style={{
          width: `${pct}%`,
          background: accent ?? "var(--color-highlight)",
        }}
      />
    </div>
  );
}
