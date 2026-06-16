"use client";

import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { Tooltip } from "@/components/ui/Tooltip";
import { CardActivities } from "@/components/presence/CardActivities";
import { useDiscordPresence } from "@/hooks/useDiscordPresence";
import type {
  DiscordProfile as DiscordProfileType,
  PresenceStatus,
} from "@/types/discord";

const DOT_BG: Record<PresenceStatus, string> = {
  online: "bg-online",
  idle: "bg-idle",
  dnd: "bg-dnd",
  offline: "bg-offline",
};

function formatDate(ms: number | null): string {
  if (!ms) return "—";
  try {
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function DiscordCard({ profile }: { profile: DiscordProfileType }) {
  const { presence, status } = useDiscordPresence();
  const accent = profile.accentColorHex ?? "#5865f2";

  return (
    <GlassCard>
      {/* Banner */}
      <div
        className="h-28 w-full overflow-hidden rounded-t-[16px] sm:h-36"
        style={{
          background: profile.bannerUrl
            ? undefined
            : `linear-gradient(120deg, ${accent}, #0b0b0b)`,
        }}
      >
        {profile.bannerUrl && (
          <Image
            src={profile.bannerUrl}
            alt="Profile banner"
            width={600}
            height={240}
            unoptimized={profile.bannerUrl.includes(".gif")}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        {/* Avatar overlap + live status dot */}
        <div className="-mt-12 mb-3 flex items-end justify-between">
          <div
            className="relative rounded-full p-1"
            style={{ background: "var(--color-base)" }}
          >
            <div
              className="overflow-hidden rounded-full ring-4"
              style={{ ["--tw-ring-color" as string]: accent }}
            >
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  width={88}
                  height={88}
                  unoptimized={profile.avatarUrl.includes(".gif")}
                  className="h-[88px] w-[88px] object-cover"
                />
              ) : (
                <div className="flex h-[88px] w-[88px] items-center justify-center bg-elevated text-2xl text-secondary">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full ring-4 ring-base">
              <span
                className={`block h-full w-full rounded-full ${DOT_BG[status]}`}
              />
            </span>
          </div>

        </div>

        {/* Identity */}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xl font-semibold text-primary">
            {profile.displayName}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm text-secondary">
              @{profile.username}
              {profile.pronouns ? ` · ${profile.pronouns}` : ""}
            </span>
            {profile.badges.length > 0 && (
              <div className="flex items-center gap-1.5">
                {profile.badges.map((badge) => (
                  <Tooltip key={badge.id} label={badge.description}>
                    {badge.iconUrl ? (
                      <Image
                        src={badge.iconUrl}
                        alt={badge.description}
                        width={18}
                        height={18}
                        unoptimized
                        className="h-[18px] w-[18px] transition-transform duration-200 hover:scale-110"
                      />
                    ) : (
                      <span className="text-xs text-secondary">●</span>
                    )}
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
          {presence?.customStatus &&
            (presence.customStatus.text || presence.customStatus.emoji) && (
              <span className="mt-1 truncate text-sm text-highlight">
                {presence.customStatus.emoji && (
                  <span className="mr-1">{presence.customStatus.emoji}</span>
                )}
                {presence.customStatus.text}
              </span>
            )}
        </div>

        {/* Live activities */}
        <CardActivities presence={presence} />

        {/* Meta row */}
        <div className="mt-5 border-t border-subtle pt-4 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-secondary">
              Member since
            </span>
            <span className="text-highlight">
              {formatDate(profile.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
