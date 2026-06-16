"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useDiscordPresence } from "@/hooks/useDiscordPresence";
import { STATUS_LABEL } from "@/components/ui/StatusDot";
import { ACTIVITY_TYPE_VERB } from "@/lib/data/activityIcons";
import { easeOutSoft } from "@/lib/motion";
import type { DiscordProfile, PresenceStatus } from "@/types/discord";

const DOT_BG: Record<PresenceStatus, string> = {
  online: "bg-online",
  idle: "bg-idle",
  dnd: "bg-dnd",
  offline: "bg-offline",
};

export function ActivityBubble({ profile }: { profile: DiscordProfile }) {
  const reduce = useReducedMotion();
  const { presence, status } = useDiscordPresence();

  const spotify = presence?.spotify ?? null;
  const activity =
    presence?.activities.find((a) => a.type !== 2 && a.type !== 4) ?? null;
  const custom = presence?.customStatus ?? null;

  const detail = spotify
    ? `${spotify.song} — ${spotify.artist}`
    : activity
      ? activity.name
      : custom?.text
        ? `${custom.emoji ? custom.emoji + " " : ""}${custom.text}`
        : profile.displayName;

  const context = spotify
    ? "Listening to Spotify"
    : activity
      ? ACTIVITY_TYPE_VERB[activity.type] || "Playing"
      : STATUS_LABEL[status];

  return (
    <motion.div
      className="fixed bottom-5 right-5 z-40"
      initial={reduce ? false : { opacity: 0, y: 20, scale: 0.9 }}
      animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: easeOutSoft }}
    >
      <button
        type="button"
        aria-label="Live Discord status"
        onClick={() =>
          document.getElementById("discord")?.scrollIntoView({ behavior: "smooth" })
        }
        className="glass flex items-center gap-3 rounded-chip p-1.5 shadow-card transition-colors hover:border-subtle-2 sm:pr-4"
      >
        <span className="relative inline-block shrink-0">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={40}
              height={40}
              unoptimized={profile.avatarUrl.includes(".gif")}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-secondary">
              {profile.displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-base">
            <span
              className={`block h-full w-full rounded-full ${DOT_BG[status]}`}
            />
          </span>
        </span>

        <span className="hidden min-w-0 max-w-[200px] flex-col items-start text-left sm:flex">
          <span className="w-full truncate text-[11px] uppercase tracking-wide text-secondary">
            {context}
          </span>
          <span className="w-full truncate text-sm font-medium text-primary">
            {detail}
          </span>
        </span>
      </button>
    </motion.div>
  );
}
