"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { usePolling } from "@/hooks/usePolling";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { NowPlayingTrack } from "@/types/lastfm";

interface RecentResponse {
  ok: boolean;
  tracks: NowPlayingTrack[];
}

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
  const { data } = usePolling<RecentResponse>("/api/lastfm/recent?limit=6", 15000, {
    ok: true,
    tracks: initialTracks,
  });
  const tracks = data?.tracks ?? initialTracks;

  if (!tracks.length) {
    return (
      <p className="px-2 py-6 text-sm text-secondary">
        No recent tracks to show.
      </p>
    );
  }

  return (
    <motion.div
      className="flex flex-col"
      variants={reduce ? undefined : staggerContainer}
      initial={reduce ? undefined : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, amount: 0.2 }}
    >
      {tracks.map((track, i) => (
        <motion.div key={`${track.url}-${i}`} variants={reduce ? undefined : fadeUp}>
          <TrackRow track={track} />
        </motion.div>
      ))}
    </motion.div>
  );
}
