import "server-only";
import { cacheLife } from "next/cache";
import { fetchJson } from "@/lib/http";

interface DeezerArtist {
  name: string;
  picture_medium?: string;
  picture_big?: string;
}

interface DeezerSearchResponse {
  data?: DeezerArtist[];
}

/**
 * Real artist photo via Deezer's public (keyless) search API. The Last.fm API
 * no longer serves artist images, so we resolve them here by name.
 * Cached for weeks — artist photos rarely change.
 */
export async function getArtistImage(name: string): Promise<string | null> {
  "use cache";
  cacheLife("weeks");
  try {
    if (!name.trim()) return null;
    const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(
      name
    )}&limit=1`;
    const json = await fetchJson<DeezerSearchResponse>(url);
    const artist = json.data?.[0];
    return artist?.picture_medium || artist?.picture_big || null;
  } catch {
    return null;
  }
}
