import "server-only";
import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fetchJson } from "@/lib/http";
import type { LyricLine, LyricsResult } from "@/types/lyrics";

const UA = "crynew-portfolio (https://crynew.dev)";

interface LrclibTrack {
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
  instrumental?: boolean;
}

const EMPTY: LyricsResult = { found: false, lines: [], plain: "" };

/* ============================================================
   Persistent cache (disk) — lyrics never change, so found
   results are kept "forever" (well past a year) and survive
   server restarts. An in-memory Map dedups within a session.
   ============================================================ */
const mem = new Map<string, LyricsResult>();
const CACHE_DIR = path.join(process.cwd(), ".cache", "lyrics");

function keyFor(artist: string, track: string): string {
  return createHash("sha1")
    .update(`${artist.trim().toLowerCase()}|${track.trim().toLowerCase()}`)
    .digest("hex");
}

async function readCache(key: string): Promise<LyricsResult | null> {
  try {
    const raw = await readFile(path.join(CACHE_DIR, `${key}.json`), "utf8");
    return JSON.parse(raw) as LyricsResult;
  } catch {
    return null; // ENOENT / parse error → miss
  }
}

async function writeCache(key: string, value: LyricsResult): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(
      path.join(CACHE_DIR, `${key}.json`),
      JSON.stringify(value),
      "utf8"
    );
  } catch {
    /* best-effort cache; ignore disk errors */
  }
}

/** Parse an LRC string into timestamped lines (skipping metadata + empties). */
function parseLrc(lrc: string): LyricLine[] {
  const out: LyricLine[] = [];
  const re = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  for (const raw of lrc.split("\n")) {
    re.lastIndex = 0;
    const stamps: number[] = [];
    let m: RegExpExecArray | null;
    let lastIndex = 0;
    while ((m = re.exec(raw)) !== null) {
      const min = Number(m[1]);
      const sec = Number(m[2]);
      const frac = m[3] ? Number(`0.${m[3]}`) : 0;
      stamps.push(min * 60 + sec + frac);
      lastIndex = re.lastIndex;
    }
    if (!stamps.length) continue; // metadata like [ar:] has no mm:ss → skipped
    const text = raw.slice(lastIndex).trim();
    if (!text) continue;
    for (const t of stamps) out.push({ t, text });
  }
  return out.sort((a, b) => a.t - b.t);
}

async function fetchFromLrclib(
  artist: string,
  track: string,
  album?: string,
  durationSec?: number
): Promise<LyricsResult> {
  try {
    // 1) exact match via /get (duration/album improve the hit)
    const getParams = new URLSearchParams({
      artist_name: artist,
      track_name: track,
    });
    if (album) getParams.set("album_name", album);
    if (durationSec && durationSec > 0)
      getParams.set("duration", String(Math.round(durationSec)));

    let synced: string | null | undefined;
    let plain: string | null | undefined;
    try {
      const hit = await fetchJson<LrclibTrack>(
        `https://lrclib.net/api/get?${getParams}`,
        { timeoutMs: 12000, init: { headers: { "User-Agent": UA } } }
      );
      synced = hit.syncedLyrics;
      plain = hit.plainLyrics;
    } catch {
      /* fall through to search */
    }

    // 2) fuzzy fallback via /search — first result with synced lyrics
    if (!synced) {
      const results = await fetchJson<LrclibTrack[]>(
        `https://lrclib.net/api/search?${new URLSearchParams({
          track_name: track,
          artist_name: artist,
        })}`,
        { timeoutMs: 12000, init: { headers: { "User-Agent": UA } } }
      );
      const best =
        results.find((r) => r.syncedLyrics) ??
        results.find((r) => r.plainLyrics);
      synced = best?.syncedLyrics;
      plain = best?.plainLyrics;
    }

    const lines = synced ? parseLrc(synced) : [];
    return { found: lines.length > 0, lines, plain: plain ?? "" };
  } catch {
    return EMPTY;
  }
}

export async function getLyrics(
  artist: string,
  track: string,
  album?: string,
  durationSec?: number
): Promise<LyricsResult> {
  if (!artist.trim() || !track.trim()) return EMPTY;
  const key = keyFor(artist, track);

  // 1) in-memory (this process)
  const cached = mem.get(key);
  if (cached) return cached;

  // 2) persistent disk cache (survives restarts)
  const fromDisk = await readCache(key);
  if (fromDisk) {
    mem.set(key, fromDisk);
    return fromDisk;
  }

  // 3) fetch (slow) and cache
  const result = await fetchFromLrclib(artist, track, album, durationSec);
  mem.set(key, result);
  if (result.found) await writeCache(key, result); // lyrics don't change → keep
  return result;
}
