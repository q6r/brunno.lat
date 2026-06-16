"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Reads a client-only value (e.g. the current clock) without bailing prerender
 * or triggering hydration errors. The server renders `server`; the client
 * computes `getClient()` after hydration. Avoids setState-in-effect.
 */
export function useClientValue<T>(getClient: () => T, server: T): T {
  return useSyncExternalStore(subscribe, getClient, () => server);
}
