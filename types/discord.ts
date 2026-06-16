export type PresenceStatus = "online" | "idle" | "dnd" | "offline";

export interface DiscordBadge {
  id: string;
  description: string;
  icon: string;
  iconUrl: string | null;
  link?: string;
}

export interface DiscordProfile {
  id: string;
  username: string;
  /** global_name ?? username */
  displayName: string;
  globalName: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  /** Hex string like "#28282c" */
  accentColorHex: string | null;
  bio: string;
  pronouns: string | null;
  /** ms epoch */
  createdAt: number | null;
  badges: DiscordBadge[];
  premiumType: number | null;
  guildTag: string | null;
}

export interface SpotifyActivity {
  trackId: string | null;
  song: string;
  artist: string;
  album: string;
  albumArtUrl: string | null;
  /** ms epoch */
  start: number;
  /** ms epoch */
  end: number;
}

export interface DiscordActivity {
  /** Discord activity type: 0 game, 1 streaming, 2 listening, 3 watching, 4 custom, 5 competing */
  type: number;
  name: string;
  details?: string;
  state?: string;
  applicationId?: string;
  timestamps?: { start?: number; end?: number };
  assets?: {
    largeImageUrl?: string;
    largeText?: string;
    smallImageUrl?: string;
    smallText?: string;
  };
  buttons?: { label: string; url?: string }[];
}

export interface CustomStatus {
  text: string;
  emoji?: string | null;
}

export interface DiscordPresence {
  status: PresenceStatus;
  activities: DiscordActivity[];
  spotify: SpotifyActivity | null;
  customStatus: CustomStatus | null;
}

export type ConnectionState =
  | "connecting"
  | "open"
  | "closed"
  | "reconnecting";

export interface UseDiscordPresenceResult {
  presence: DiscordPresence | null;
  status: PresenceStatus;
  connection: ConnectionState;
  lastUpdate: number | null;
  error: string | null;
  raw: unknown;
}

// Cached profile data only — the live `status` is supplied separately (WS),
// never cached.
export interface DiscordFriend {
  id: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
  badges: DiscordBadge[];
  bio?: string;
  mutualFriends?: number;
  mutualServers?: number;
}

export interface FriendsResponse {
  ok: boolean;
  available: boolean;
  friends: DiscordFriend[];
  reason?: string;
}
