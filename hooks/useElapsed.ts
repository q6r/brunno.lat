"use client";

import { useEffect, useState } from "react";

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function formatClock(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface ElapsedResult {
  progress: number;
  elapsed: number;
  remaining: number;
  elapsedLabel: string;
  remainingLabel: string;
}

/**
 * Live ticker between two ms-epoch timestamps. Ticks every second and pauses
 * while the tab is hidden to save work. Pass start only (end omitted) for an
 * open-ended elapsed counter (progress stays 0).
 */
export function useElapsed(start?: number, end?: number): ElapsedResult {
  const [now, setNow] = useState<number>(() => start ?? 0);

  useEffect(() => {
    if (!start) return;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => setNow(Date.now());
    const startTimer = () => {
      tick();
      if (timer) clearInterval(timer);
      timer = setInterval(tick, 1000);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") startTimer();
      else if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    startTimer();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [start, end]);

  const safeNow = start ? now || start : 0;
  const elapsed = start ? Math.max(0, safeNow - start) : 0;
  const duration = start && end ? Math.max(0, end - start) : 0;
  const remaining = duration ? Math.max(0, end! - safeNow) : 0;
  const progress = duration ? clamp01(elapsed / duration) : 0;

  return {
    progress,
    elapsed,
    remaining,
    elapsedLabel: formatClock(elapsed),
    remainingLabel: `-${formatClock(remaining)}`,
  };
}
