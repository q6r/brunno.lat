"use client";

import { useClientValue } from "@/hooks/useClientValue";

/** Renders the current year on the client to avoid reading the clock during prerender. */
export function CurrentYear() {
  const year = useClientValue(() => new Date().getFullYear(), 2026);
  return <>{year}</>;
}
