"use client";

import { useEffect, useState } from "react";
import type { SpotifyActivity } from "@/types/discord";
import type { LyricLine } from "@/types/lyrics";

interface LyricsState {
  lines: LyricLine[];
  found: boolean;
}

/**
 * Fetches synced lyrics for the currently playing Spotify track (via the
 * /api/lyrics route → LRCLIB). Re-fetches only when the song changes.
 */
export function useLyrics(spotify: SpotifyActivity | null): LyricsState {
  const [state, setState] = useState<LyricsState>({ lines: [], found: false });

  const song = spotify?.song ?? "";
  const artist = spotify?.artist ?? "";
  const album = spotify?.album ?? "";
  const dur =
    spotify && spotify.end > spotify.start
      ? Math.round((spotify.end - spotify.start) / 1000)
      : 0;

  useEffect(() => {
    if (!song || !artist) return;
    let cancelled = false;
    const controller = new AbortController();

    const params = new URLSearchParams({ artist, track: song });
    if (album) params.set("album", album);
    if (dur) params.set("duration", String(dur));

    fetch(`/api/lyrics?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled)
          setState({
            lines: Array.isArray(d.lines) ? d.lines : [],
            found: !!d.found,
          });
      })
      .catch(() => {
        if (!cancelled) setState({ lines: [], found: false });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [song, artist, album, dur]);

  return state;
}
