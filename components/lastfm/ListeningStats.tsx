"use client";

import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { TopItem, UserStats } from "@/types/lastfm";

interface StatEntry {
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ entry }: { entry: StatEntry }) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <span className="text-[11px] font-medium uppercase tracking-wide text-secondary">
        {entry.label}
      </span>
      <span className="truncate text-lg font-semibold tabular-nums text-primary">
        {entry.value}
      </span>
      {entry.sub && (
        <span className="truncate text-xs text-secondary">{entry.sub}</span>
      )}
    </Card>
  );
}

export function ListeningStats({
  stats,
  topArtist,
  topAlbum,
  topTrack,
}: {
  stats: UserStats;
  topArtist?: TopItem;
  topAlbum?: TopItem;
  topTrack?: TopItem;
}) {
  const reduce = useReducedMotion();
  const entries: StatEntry[] = [
    {
      label: "Total Scrobbles",
      value: stats.totalScrobbles.toLocaleString(),
      sub: `${stats.artistCount.toLocaleString()} artists`,
    },
    {
      label: "Top Artist",
      value: topArtist?.name ?? "—",
      sub: topArtist ? topArtist.subtitle : undefined,
    },
    {
      label: "Top Album",
      value: topAlbum?.name ?? "—",
      sub: topAlbum?.subtitle,
    },
    {
      label: "Top Track",
      value: topTrack?.name ?? "—",
      sub: topTrack?.subtitle,
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      variants={reduce ? undefined : staggerContainer}
      initial={reduce ? undefined : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, amount: 0.2 }}
    >
      {entries.map((entry) => (
        <motion.div key={entry.label} variants={reduce ? undefined : fadeUp}>
          <StatCard entry={entry} />
        </motion.div>
      ))}
    </motion.div>
  );
}
