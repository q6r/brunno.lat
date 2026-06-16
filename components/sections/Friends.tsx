"use client";

import { motion, useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { FriendCard } from "@/components/cards/FriendCard";
import { useDiscordFriends } from "@/hooks/useDiscordFriends";
import { useDiscordPresences } from "@/hooks/useDiscordPresences";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function Friends() {
  const reduce = useReducedMotion();
  const { available, friends, loading } = useDiscordFriends();
  const statuses = useDiscordPresences(friends.map((f) => f.id));

  const hasFriends = available && friends.length > 0;

  return (
    <section id="friends" className="py-20 sm:py-28">
      <SectionHeading
        kicker="Connections"
        title="Friends"
        subtitle="A few people I share servers with — live status from Discord."
      />

      {hasFriends ? (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={reduce ? undefined : staggerContainer}
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, amount: 0.1 }}
        >
          {friends.map((friend) => (
            <motion.div key={friend.id} variants={reduce ? undefined : fadeUp}>
              <FriendCard
                friend={friend}
                status={statuses[friend.id] ?? "offline"}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] w-full rounded-card" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="👥"
          title="Friends list not connected yet"
          hint="This section is wired to /api/discord/friends and will populate automatically once a friends source is available."
        />
      )}
    </section>
  );
}
