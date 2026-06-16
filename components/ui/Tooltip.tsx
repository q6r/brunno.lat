import type { ReactNode } from "react";

/**
 * Lightweight premium tooltip via Tailwind group-hover (no dependency, no JS).
 * Reveals `label` above the child on hover/focus. Uses a named group so it
 * never clashes with other `group` usages on the page.
 */
export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-subtle bg-elevated px-2 py-1 text-xs text-highlight opacity-0 shadow-soft transition-all duration-150 group-hover/tt:translate-y-0 group-hover/tt:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
