"use client";

import { useEffect, useRef, useState } from "react";

export interface PollingResult<T> {
  data: T | undefined;
  error: string | null;
  loading: boolean;
}

/**
 * Polls a JSON endpoint on an interval. Pauses while the tab is hidden and
 * refetches immediately when it becomes visible again. Cleans up on unmount.
 */
export function usePolling<T>(
  url: string,
  intervalMs: number,
  seed?: T
): PollingResult<T> {
  const [data, setData] = useState<T | undefined>(seed);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(seed === undefined);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;

    const tick = async () => {
      if (document.visibilityState !== "visible") {
        schedule();
        return;
      }
      controller?.abort();
      controller = new AbortController();
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as T;
        if (mounted.current) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (
          mounted.current &&
          !(err instanceof DOMException && err.name === "AbortError")
        ) {
          setError(err instanceof Error ? err.message : "fetch error");
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
          schedule();
        }
      }
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(tick, intervalMs);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };

    tick();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mounted.current = false;
      if (timer) clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [url, intervalMs]);

  return { data, error, loading };
}
