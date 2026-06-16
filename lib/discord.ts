import "server-only";
import { cacheLife } from "next/cache";
import { fetchJson } from "@/lib/http";
import {
  CEEBIO_BASE,
  DISCORD_FRIEND_IDS,
  DISCORD_USER_ID,
} from "@/lib/constants";
import type { DiscordFriend, DiscordProfile } from "@/types/discord";

/* ---------- Raw cee.bio response (partial, from live API) ---------- */
interface CeeBioUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  banner: string | null;
  banner_color: string | null;
  accent_color: number | null;
  bio?: string;
  created_at: number; // ms epoch
  avatar_url?: string;
  primary_guild?: { tag?: string | null } | null;
  premium_type?: number | null;
}

interface CeeBioUserProfile {
  bio?: string;
  accent_color?: number | null;
  pronouns?: string;
}

interface CeeBioBadge {
  id: string;
  description: string;
  icon: string;
  link?: string;
}

interface CeeBioUserResponse {
  success: boolean;
  data: {
    user: CeeBioUser;
    user_profile?: CeeBioUserProfile;
    badges?: CeeBioBadge[];
    premium_type?: number | null;
  };
}

function intToHex(n: number | null | undefined): string | null {
  if (typeof n !== "number") return null;
  return "#" + (n & 0xffffff).toString(16).padStart(6, "0");
}

function bannerUrl(id: string, hash: string | null): string | null {
  if (!hash) return null;
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${id}/${hash}.${ext}?size=600`;
}

function badgeIconUrl(icon: string): string | null {
  if (!icon) return null;
  return `https://cdn.discordapp.com/badge-icons/${icon}.png`;
}

const EMPTY_PROFILE: DiscordProfile = {
  id: DISCORD_USER_ID,
  username: "",
  displayName: "",
  globalName: null,
  avatarUrl: null,
  bannerUrl: null,
  accentColorHex: null,
  bio: "",
  pronouns: null,
  createdAt: null,
  badges: [],
  premiumType: null,
  guildTag: null,
};

export async function getDiscordProfile(): Promise<DiscordProfile> {
  "use cache";
  cacheLife("hours");
  try {
    const json = await fetchJson<CeeBioUserResponse>(
      `${CEEBIO_BASE}/discord/user/${DISCORD_USER_ID}`
    );
    if (!json.success) return EMPTY_PROFILE;
    const u = json.data.user;
    const profile = json.data.user_profile;
    return {
      id: u.id,
      username: u.username,
      displayName: u.global_name ?? u.username,
      globalName: u.global_name,
      avatarUrl: u.avatar_url ?? null,
      bannerUrl: bannerUrl(u.id, u.banner),
      accentColorHex: u.banner_color ?? intToHex(u.accent_color),
      bio: profile?.bio || u.bio || "",
      pronouns: profile?.pronouns?.trim() || null,
      createdAt: typeof u.created_at === "number" ? u.created_at : null,
      badges: (json.data.badges ?? []).map((b) => ({
        id: b.id,
        description: b.description,
        icon: b.icon,
        iconUrl: badgeIconUrl(b.icon),
        link: b.link,
      })),
      premiumType: json.data.premium_type ?? u.premium_type ?? null,
      guildTag: u.primary_guild?.tag ?? null,
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// cee.bio rate-limits bursts (429), so retry per-friend with backoff.
async function fetchFriend(id: string, attempts = 4): Promise<DiscordFriend | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const json = await fetchJson<CeeBioUserResponse>(
        `${CEEBIO_BASE}/discord/user/${id}`,
        { timeoutMs: 12000 }
      );
      if (json.success) {
        const u = json.data.user;
        return {
          id: u.id,
          username: u.username,
          globalName: u.global_name,
          avatarUrl: u.avatar_url ?? null,
          badges: (json.data.badges ?? []).map((b) => ({
            id: b.id,
            description: b.description,
            icon: b.icon,
            iconUrl: badgeIconUrl(b.icon),
            link: b.link,
          })),
          bio: json.data.user_profile?.bio || u.bio || "",
        };
      }
    } catch {
      /* retry below */
    }
    if (i < attempts - 1) await sleep(800 * (i + 1));
  }
  return null;
}

export async function getDiscordFriends(): Promise<DiscordFriend[]> {
  "use cache";
  // Fetch sequentially with a small gap to avoid the cee.bio rate limit (429).
  const friends: DiscordFriend[] = [];
  for (const id of DISCORD_FRIEND_IDS) {
    const friend = await fetchFriend(id);
    if (friend) friends.push(friend);
    await sleep(400);
  }
  // Don't keep a partial list cached for long — retry soon if some failed.
  if (friends.length === DISCORD_FRIEND_IDS.length) {
    cacheLife("hours");
  } else {
    cacheLife("minutes");
  }
  return friends;
}
