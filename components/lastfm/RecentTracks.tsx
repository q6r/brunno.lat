"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useDiscordPresence } from "@/hooks/useDiscordPresence";
import type { NowPlayingTrack } from "@/types/lastfm";

function timeAgo(unix: number | null): string {
  if (!unix) return "";
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return "just now";
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function TrackRow({ track }: { track: NowPlayingTrack }) {
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-elevated"
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-elevated">
        {track.imageUrl ? (
          <Image
            src={track.imageUrl}
            alt={track.album || track.name}
            width={44}
            height={44}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-secondary">
            ♪
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-primary">{track.name}</p>
        <p className="truncate text-xs text-secondary">{track.artist}</p>
      </div>
      <div className="shrink-0 text-right">
        {track.nowPlaying ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-spotify">
            <span className="flex items-end gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-0.5 rounded-full bg-spotify"
                  style={{
                    height: 8,
                    transformOrigin: "bottom",
                    animation: "float-idle 0.8s ease-in-out infinite",
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </span>
            Now playing
          </span>
        ) : (
          <span className="text-[11px] tabular-nums text-secondary">
            {timeAgo(track.playedAt)}
          </span>
        )}
      </div>
    </a>
  );
}

export function RecentTracks({
  initialTracks,
}: {
  initialTracks: NowPlayingTrack[];
}) {
  const reduce = useReducedMotion();
  const { presence } = useDiscordPresence();
  // Same Spotify drives both Discord presence and Last.fm — refetch when the
  // playing track changes. Key only changes on an actual song change.
  const songKey = presence?.spotify
    ? `${presence.spotify.song}|${presence.spotify.artist}`
    : "";

  const [tracks, setTracks] = useState<NowPlayingTrack[]>(initialTracks);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (cancelled) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(fetchTracks, 15000);
    };

    const fetchTracks = async () => {
      if (document.visibilityState !== "visible") {
        schedule();
        return;
      }
      try {
        const res = await fetch("/api/lastfm/recent?limit=6", {
          signal: controller.signal,
        });
        const data = await res.json();
        // Only replace when we actually got tracks → never wipe the list on a
        // transient empty/rate-limited response.
        if (!cancelled && Array.isArray(data?.tracks) && data.tracks.length) {
          setTracks(data.tracks);
        }
      } catch {
        /* keep last good */
      }
      schedule();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") fetchTracks();
    };

    // Immediate refetch (also fires when songKey changes), plus a follow-up to
    // let Last.fm catch up to the new "now playing" after a song change.
    fetchTracks();
    const lagTimer = setTimeout(fetchTracks, 2500);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      clearTimeout(lagTimer);
      controller.abort();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [songKey]);

  if (!tracks.length) {
    return (
      <p className="px-2 py-6 text-sm text-secondary">
        No recent tracks to show.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {tracks.map((track, i) => (
        <motion.div
          key={`${track.url}-${i}`}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: reduce ? 0 : Math.min(i, 6) * 0.04 }}
        >
          <TrackRow track={track} />
        </motion.div>
      ))}
    </div>
  );
}
