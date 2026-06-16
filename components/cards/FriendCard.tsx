"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip } from "@/components/ui/Tooltip";
import { springSoft } from "@/lib/motion";
import type { DiscordFriend, PresenceStatus } from "@/types/discord";

export function FriendCard({
  friend,
  status,
}: {
  friend: DiscordFriend;
  /** Live status from the WS — not part of the cached profile. */
  status: PresenceStatus;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -4 }}
      transition={springSoft}
    >
      <GlassCard className="flex h-full items-center gap-3 p-4">
        <Avatar
          src={friend.avatarUrl}
          alt={friend.globalName ?? friend.username}
          size={48}
          status={status}
          ring
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-primary">
            {friend.globalName ?? friend.username}
          </p>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className="truncate text-xs text-secondary">
              @{friend.username}
            </span>
            {friend.badges.length > 0 && (
              <div className="flex items-center gap-1">
                {friend.badges.map((badge) =>
                  badge.iconUrl ? (
                    <Tooltip key={badge.id} label={badge.description}>
                      <Image
                        src={badge.iconUrl}
                        alt={badge.description}
                        width={16}
                        height={16}
                        unoptimized
                        className="h-4 w-4 transition-transform duration-200 hover:scale-110"
                      />
                    </Tooltip>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
