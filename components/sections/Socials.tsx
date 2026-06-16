"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DiscordCard } from "@/components/social/DiscordCard";
import { GithubCard } from "@/components/social/GithubCard";
import { cn } from "@/lib/cn";
import { easeOutSoft } from "@/lib/motion";
import type { DiscordProfile } from "@/types/discord";
import type { GithubProfile, GithubRepo, SocialTab } from "@/types/social";

interface TabMeta {
  id: SocialTab;
  label: string;
  slug: string;
  iconColor: string;
  kicker: string;
  subtitle: string;
}

const TABS: TabMeta[] = [
  {
    id: "discord",
    label: "Discord",
    slug: "discord",
    iconColor: "5865F2",
    kicker: "Discord",
    subtitle: "Live from the cee.bio Discord API.",
  },
  {
    id: "github",
    label: "GitHub",
    slug: "github",
    iconColor: "white",
    kicker: "GitHub",
    subtitle: "@q6r on GitHub.",
  },
];

export function Socials({
  discord,
  github,
  githubRepos,
  githubReadmeHtml,
}: {
  discord: DiscordProfile;
  github: GithubProfile | null;
  githubRepos: GithubRepo[];
  githubReadmeHtml: string | null;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<SocialTab>("discord");
  const activeMeta = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section id="discord" className="py-20 sm:py-28">
      {/* Tabs */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex flex-wrap justify-center gap-1 rounded-chip border border-subtle bg-card/60 p-1">
          {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-chip px-3.5 py-1.5 text-sm transition-colors",
              active === tab.id
                ? "bg-elevated text-primary"
                : "text-secondary hover:text-highlight"
            )}
          >
            <Image
              src={`https://cdn.simpleicons.org/${tab.slug}/${tab.iconColor}`}
              alt=""
              width={16}
              height={16}
              unoptimized
              className="h-4 w-4"
            />
            {tab.label}
            </button>
          ))}
        </div>
      </div>

      <SectionHeading
        kicker={activeMeta.kicker}
        title="Profile"
        subtitle={activeMeta.subtitle}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: easeOutSoft }}
        >
          {active === "discord" && <DiscordCard profile={discord} />}
          {active === "github" && (
            <GithubCard
              profile={github}
              repos={githubRepos}
              readmeHtml={githubReadmeHtml}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
