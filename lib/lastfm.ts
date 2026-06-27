import "server-only";
import { cacheLife } from "next/cache";
import { fetchJson } from "@/lib/http";
import { getLastfmApiKey, getLastfmUser } from "@/lib/env";
import { getArtistImage } from "@/lib/deezer";
import { countryToCode } from "@/lib/data/countries";
import { LASTFM_BASE } from "@/lib/constants";
import type {
  LfmImage,
  LfmPeriod,
  LfmRecentTracksResponse,
  LfmTopAlbumsResponse,
  LfmTopArtistsResponse,
  LfmTopTracksResponse,
  LfmUserInfoResponse,
  NowPlayingTrack,
  TopItem,
  UserStats,
} from "@/types/lastfm";

/** Last.fm's "no image" placeholder hash — treat as missing. */
const PLACEHOLDER = "2a96cbd8b46e442fc41c2b86b821562f";

function buildUrl(method: string, params: Record<string, string | number>): string | null {
  const key = getLastfmApiKey();
  if (!key) return null;
  const sp = new URLSearchParams({
    method,
    user: getLastfmUser(),
    api_key: key,
    format: "json",
  });
  for (const [k, v] of Object.entries(params)) sp.set(k, String(v));
  return `${LASTFM_BASE}?${sp.toString()}`;
}

function bestImage(images: LfmImage[] | undefined): string | null {
  if (!images?.length) return null;
  const url = images[images.length - 1]?.["#text"] || images[0]?.["#text"] || "";
  if (!url || url.includes(PLACEHOLDER)) return null;
  return url.replace(/^http:\/\//, "https://");
}

function hasLfmError(json: unknown): json is { error: number; message: string } {
  return !!json && typeof json === "object" && "error" in json;
}

/**
 * Last.fm's user.getinfo returns avatar URLs whose large sizes (`174s`,
 * `300x300`) frequently 404 on the CDN, while `avatar170s` is served
 * reliably. Rewrite the size segment so the profile photo actually loads.
 */
function normalizeAvatar(url: string | null): string | null {
  if (!url) return null;
  return url.replace(/\/i\/u\/[^/]+\//, "/i/u/avatar170s/");
}

export async function getRecentTracks(limit = 6): Promise<NowPlayingTrack[]> {
  "use cache";
  cacheLife("seconds");
  try {
    const url = buildUrl("user.getrecenttracks", { limit, extended: 0 });
    if (!url) return [];
    const json = await fetchJson<LfmRecentTracksResponse>(url);
    if (hasLfmError(json)) return [];
    const tracks = json.recenttracks?.track ?? [];
    return tracks.map((t) => ({
      name: t.name,
      artist: t.artist?.["#text"] ?? "",
      album: t.album?.["#text"] ?? "",
      imageUrl: bestImage(t.image),
      url: t.url,
      nowPlaying: t["@attr"]?.nowplaying === "true",
      playedAt: t.date ? Number(t.date.uts) : null,
    }));
  } catch {
    return [];
  }
}

export async function getTopArtists(
  period: LfmPeriod = "1month",
  limit = 12
): Promise<TopItem[]> {
  "use cache";
  cacheLife("hours");
  try {
    const url = buildUrl("user.gettopartists", { period, limit });
    if (!url) return [];
    const json = await fetchJson<LfmTopArtistsResponse>(url);
    if (hasLfmError(json)) return [];
    const artists = json.topartists?.artist ?? [];
    const items: TopItem[] = artists.map((a, i) => ({
      name: a.name,
      subtitle: `${Number(a.playcount).toLocaleString()} plays`,
      imageUrl: bestImage(a.image),
      url: a.url,
      playcount: Number(a.playcount) || 0,
      rank: Number(a["@attr"]?.rank) || i + 1,
    }));
    // Last.fm no longer serves artist photos → resolve real ones via Deezer.
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        imageUrl: item.imageUrl ?? (await getArtistImage(item.name)),
      }))
    );
  } catch {
    return [];
  }
}

export async function getTopAlbums(
  period: LfmPeriod = "1month",
  limit = 6
): Promise<TopItem[]> {
  "use cache";
  cacheLife("hours");
  try {
    const url = buildUrl("user.gettopalbums", { period, limit });
    if (!url) return [];
    const json = await fetchJson<LfmTopAlbumsResponse>(url);
    if (hasLfmError(json)) return [];
    const albums = json.topalbums?.album ?? [];
    return albums.map((a, i) => ({
      name: a.name,
      subtitle: a.artist?.name ?? "",
      imageUrl: bestImage(a.image),
      url: a.url,
      playcount: Number(a.playcount) || 0,
      rank: Number(a["@attr"]?.rank) || i + 1,
    }));
  } catch {
    return [];
  }
}

export async function getTopTracks(
  period: LfmPeriod = "1month",
  limit = 6
): Promise<TopItem[]> {
  "use cache";
  cacheLife("hours");
  try {
    const url = buildUrl("user.gettoptracks", { period, limit });
    if (!url) return [];
    const json = await fetchJson<LfmTopTracksResponse>(url);
    if (hasLfmError(json)) return [];
    const tracks = json.toptracks?.track ?? [];
    return tracks.map((t, i) => ({
      name: t.name,
      subtitle: t.artist?.name ?? "",
      imageUrl: bestImage(t.image),
      url: t.url,
      playcount: Number(t.playcount) || 0,
      rank: Number(t["@attr"]?.rank) || i + 1,
    }));
  } catch {
    return [];
  }
}

export async function getUserStats(): Promise<UserStats> {
  "use cache";
  cacheLife("hours");
  const user = getLastfmUser();
  const empty: UserStats = {
    totalScrobbles: 0,
    artistCount: 0,
    trackCount: 0,
    albumCount: 0,
    registeredUnix: null,
    imageUrl: null,
    username: user,
    realName: "",
    country: "",
    countryCode: null,
    profileUrl: `https://www.last.fm/user/${user}`,
  };
  try {
    const url = buildUrl("user.getinfo", {});
    if (!url) return empty;
    const json = await fetchJson<LfmUserInfoResponse>(url);
    if (hasLfmError(json)) return empty;
    const u = json.user;
    const country = u.country && u.country !== "None" ? u.country : "";
    return {
      totalScrobbles: Number(u.playcount) || 0,
      artistCount: Number(u.artist_count) || 0,
      trackCount: Number(u.track_count) || 0,
      albumCount: Number(u.album_count) || 0,
      registeredUnix: Number(u.registered?.unixtime) || null,
      imageUrl: normalizeAvatar(bestImage(u.image)),
      username: u.name || user,
      realName: u.realname || "",
      country,
      countryCode: countryToCode(u.country),
      profileUrl: u.url || `https://www.last.fm/user/${u.name || user}`,
    };
  } catch {
    return empty;
  }
}
