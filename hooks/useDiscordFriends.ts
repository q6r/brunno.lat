"use client";

import { usePolling } from "@/hooks/usePolling";
import type { FriendsResponse } from "@/types/discord";

const FALLBACK: FriendsResponse = { ok: true, available: false, friends: [] };

/**
 * Polls /api/discord/friends. The route returns `available: false` until a
 * real friends source is configured — the UI renders an empty state until then.
 */
export function useDiscordFriends(): FriendsResponse & { loading: boolean } {
  const { data, loading } = usePolling<FriendsResponse>(
    "/api/discord/friends",
    60000,
    FALLBACK
  );
  return { ...(data ?? FALLBACK), loading };
}
