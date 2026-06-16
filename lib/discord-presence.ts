import type {
  CustomStatus,
  DiscordActivity,
  DiscordPresence,
  PresenceStatus,
  SpotifyActivity,
} from "@/types/discord";

/**
 * Tolerant parser for cee.bio presence WebSocket frames.
 *
 * Verified envelope (user offline at capture time):
 *   { type: "user_activity_update", userId, presence: { status, activities[], customStatus, clientStatus } }
 *   { type: "ack", op, success, message }   <- ignored
 *
 * Activity object shape was not observable while offline, so mapping below
 * defensively accepts both raw Discord gateway fields (snake_case) and any
 * pre-resolved fields cee.bio may add.
 */

type AnyRecord = Record<string, unknown>;

function isRecord(v: unknown): v is AnyRecord {
  return !!v && typeof v === "object";
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)))
    return Number(v);
  return undefined;
}

export function normalizeStatus(v: unknown): PresenceStatus {
  const s = typeof v === "string" ? v.toLowerCase() : "";
  if (s === "online" || s === "idle" || s === "dnd" || s === "offline") return s;
  if (s === "invisible") return "offline";
  return "offline";
}

/** Resolve a Discord asset reference to a usable image URL. */
function resolveAsset(
  image: unknown,
  applicationId?: string
): string | undefined {
  const v = str(image);
  if (!v) return undefined;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("spotify:")) return `https://i.scdn.co/image/${v.slice(8)}`;
  if (v.startsWith("mp:")) return `https://media.discordapp.net/${v.slice(3)}`;
  if (applicationId)
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${v}.png`;
  return undefined;
}

function mapButtons(raw: unknown, meta?: unknown): DiscordActivity["buttons"] {
  if (!Array.isArray(raw)) return undefined;
  const urls = Array.isArray(meta) ? (meta as unknown[]) : [];
  const out = raw.map((b, i) => {
    if (typeof b === "string") return { label: b, url: str(urls[i]) };
    if (isRecord(b)) return { label: str(b.label) ?? "", url: str(b.url) };
    return { label: "" };
  });
  return out.filter((b) => b.label);
}

function mapActivity(raw: unknown): DiscordActivity | null {
  if (!isRecord(raw)) return null;
  const applicationId = str(raw.application_id) ?? str(raw.applicationId);
  const assetsRaw = isRecord(raw.assets) ? raw.assets : undefined;
  const tsRaw = isRecord(raw.timestamps) ? raw.timestamps : undefined;

  const activity: DiscordActivity = {
    type: num(raw.type) ?? 0,
    name: str(raw.name) ?? "",
    details: str(raw.details),
    state: str(raw.state),
    applicationId,
  };

  // cee.bio sends timestamps flat (startTimestamp/endTimestamp); fall back to nested.
  const start =
    num(tsRaw?.start) ?? num(raw.startTimestamp) ?? num(raw.start_timestamp);
  const end =
    num(tsRaw?.end) ?? num(raw.endTimestamp) ?? num(raw.end_timestamp);
  if (start !== undefined || end !== undefined)
    activity.timestamps = { start, end };

  if (assetsRaw) {
    activity.assets = {
      // cee.bio key is `largeImageURL` (uppercase URL) and already a full URL.
      largeImageUrl: resolveAsset(
        assetsRaw.largeImageURL ??
          assetsRaw.large_image ??
          assetsRaw.largeImage ??
          assetsRaw.largeImageUrl,
        applicationId
      ),
      largeText: str(assetsRaw.large_text ?? assetsRaw.largeText),
      smallImageUrl: resolveAsset(
        assetsRaw.smallImageURL ??
          assetsRaw.small_image ??
          assetsRaw.smallImage ??
          assetsRaw.smallImageUrl,
        applicationId
      ),
      smallText: str(assetsRaw.small_text ?? assetsRaw.smallText),
    };
  }

  const buttons = mapButtons(raw.buttons, raw.button_urls ?? raw.buttonUrls);
  if (buttons?.length) activity.buttons = buttons;

  return activity;
}

function extractSpotify(
  presenceRaw: AnyRecord,
  activities: DiscordActivity[],
  rawActivities: unknown[]
): SpotifyActivity | null {
  // Prefer an explicit normalized spotify object if cee.bio provides one.
  const explicit = presenceRaw.spotify;
  if (isRecord(explicit)) {
    const start = num(explicit.start ?? explicit.startedAt ?? explicit.timestamp_start);
    const end = num(explicit.end ?? explicit.endsAt ?? explicit.timestamp_end);
    return {
      trackId: str(explicit.trackId ?? explicit.track_id ?? explicit.sync_id) ?? null,
      song: str(explicit.song ?? explicit.title ?? explicit.name) ?? "",
      artist: str(explicit.artist) ?? "",
      album: str(explicit.album) ?? "",
      albumArtUrl: resolveAsset(explicit.albumArtUrl ?? explicit.cover ?? explicit.image) ?? null,
      start: start ?? 0,
      end: end ?? 0,
    };
  }

  // Otherwise derive from a "listening" (type 2) activity.
  const idx = activities.findIndex(
    (a) => a.type === 2 || a.name.toLowerCase() === "spotify"
  );
  if (idx === -1) return null;
  const a = activities[idx];
  const rawA = isRecord(rawActivities[idx]) ? (rawActivities[idx] as AnyRecord) : {};
  return {
    trackId: str(rawA.sync_id) ?? str(rawA.syncId) ?? null,
    song: a.details ?? a.name,
    artist: a.state ?? "",
    album: a.assets?.largeText ?? "",
    albumArtUrl: a.assets?.largeImageUrl ?? null,
    start: a.timestamps?.start ?? 0,
    end: a.timestamps?.end ?? 0,
  };
}

function extractCustomStatus(
  presenceRaw: AnyRecord,
  activities: DiscordActivity[],
  rawActivities: unknown[]
): CustomStatus | null {
  const cs = presenceRaw.customStatus ?? presenceRaw.custom_status;
  if (isRecord(cs)) {
    const text = str(cs.text ?? cs.state ?? cs.name);
    const emoji = isRecord(cs.emoji) ? str(cs.emoji.name) : str(cs.emoji);
    if (text || emoji) return { text: text ?? "", emoji: emoji ?? null };
  }
  if (typeof cs === "string" && cs) return { text: cs, emoji: null };

  const idx = activities.findIndex((a) => a.type === 4);
  if (idx !== -1) {
    const a = activities[idx];
    const rawA = isRecord(rawActivities[idx]) ? (rawActivities[idx] as AnyRecord) : {};
    const emoji = isRecord(rawA.emoji) ? str(rawA.emoji.name) : undefined;
    if (a.state || emoji) return { text: a.state ?? "", emoji: emoji ?? null };
  }
  return null;
}

/**
 * Returns a normalized presence, or null for non-presence frames
 * (ack, pong, frames for a different user, parse failures).
 */
/**
 * Lightweight multi-user variant: returns just { userId, status } for any
 * presence frame, without filtering by a specific user. Used to track the live
 * status of many friends over a single subscription.
 */
export function parsePresenceFrameAny(
  data: unknown
): { userId: string; status: PresenceStatus } | null {
  if (!isRecord(data)) return null;
  if (str(data.type) !== "user_activity_update") return null;
  const userId = str(data.userId) ?? str(data.user_id);
  const presence = isRecord(data.presence) ? data.presence : null;
  if (!userId || !presence) return null;
  return { userId, status: normalizeStatus(presence.status) };
}

export function parsePresenceFrame(
  data: unknown,
  expectedUserId?: string
): DiscordPresence | null {
  if (!isRecord(data)) return null;

  const type = str(data.type);
  if (type === "ack" || type === "pong" || type === "ping") return null;

  // Locate the presence payload.
  let presenceRaw: AnyRecord | null = null;
  if (isRecord(data.presence)) presenceRaw = data.presence;
  else if (isRecord(data.data) && isRecord((data.data as AnyRecord).presence))
    presenceRaw = (data.data as AnyRecord).presence as AnyRecord;
  else if ("status" in data || "activities" in data) presenceRaw = data;

  if (!presenceRaw) return null;

  // Filter by user when an id is present in the frame.
  const frameUser = str(data.userId) ?? str(data.user_id);
  if (expectedUserId && frameUser && frameUser !== expectedUserId) return null;

  const rawActivities = Array.isArray(presenceRaw.activities)
    ? (presenceRaw.activities as unknown[])
    : [];
  const activities = rawActivities
    .map(mapActivity)
    .filter((a): a is DiscordActivity => a !== null);

  return {
    status: normalizeStatus(presenceRaw.status),
    activities,
    spotify: extractSpotify(presenceRaw, activities, rawActivities),
    customStatus: extractCustomStatus(presenceRaw, activities, rawActivities),
  };
}
