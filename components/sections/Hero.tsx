"use client";

import { motion, useReducedMotion } from "motion/react";
import { Avatar } from "@/components/ui/Avatar";
import { StatChip } from "@/components/ui/StatChip";
import { StatusDot, STATUS_LABEL } from "@/components/ui/StatusDot";
import { useDiscordPresence } from "@/hooks/useDiscordPresence";
import { fadeUp, staggerContainer, scaleIn } from "@/lib/motion";
import { PROFILE } from "@/lib/data/profile";
import type { DiscordProfile } from "@/types/discord";

export function Hero({
  profile,
  scrobbles,
}: {
  profile: DiscordProfile;
  scrobbles: number;
}) {
  const reduce = useReducedMotion();
  const { status } = useDiscordPresence();

  const Tag = reduce ? "div" : motion.div;
  const stagger = reduce
    ? {}
    : {
        variants: staggerContainer,
        initial: "hidden" as const,
        animate: "show" as const,
      };
  const item = reduce ? {} : { variants: fadeUp };

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center py-20 text-center">
      <Tag className="flex flex-col items-center gap-6" {...stagger}>
        <motion.div
          variants={reduce ? undefined : scaleIn}
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={
            reduce
              ? undefined
              : { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <Avatar
            src={profile.avatarUrl}
            alt={profile.displayName || PROFILE.name}
            size={132}
            status={status}
            ring
            priority
          />
        </motion.div>

        <Tag {...item}>
          <span className="inline-flex items-center gap-2 rounded-chip glass px-3 py-1.5 text-xs text-secondary">
            <StatusDot status={status} pulse />
            {STATUS_LABEL[status]}
          </span>
        </Tag>

        <motion.h1
          {...item}
          className="font-display text-6xl leading-none tracking-tight text-primary sm:text-8xl"
        >
          {PROFILE.name}
        </motion.h1>

        <motion.p
          {...item}
          className="max-w-xl text-balance text-base text-secondary sm:text-lg"
        >
          {PROFILE.subtitle}
        </motion.p>

        <motion.div
          {...item}
          className="mt-2 flex flex-wrap items-center justify-center gap-3"
        >
          <StatChip label="Scrobbles" value={scrobbles.toLocaleString()} />
          <StatChip label="Experience" value="5+ yrs" />
          <StatChip label="Projects" value="40+" />
        </motion.div>
      </Tag>
    </section>
  );
}
