"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { scaleIn, staggerFast } from "@/lib/motion";
import type { TopItem } from "@/types/lastfm";

function ArtistTile({ item }: { item: TopItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-2 text-center"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-card border border-subtle bg-elevated transition-transform duration-300 group-hover:scale-[1.04]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={160}
            height={160}
            unoptimized
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-2xl font-semibold text-secondary"
            style={{
              background:
                "linear-gradient(135deg, #161616, #0b0b0b)",
            }}
          >
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="absolute left-1.5 top-1.5 rounded-chip bg-base/70 px-1.5 py-0.5 text-[10px] font-medium text-highlight backdrop-blur">
          #{item.rank}
        </span>
      </div>
      <div className="w-full">
        <p className="truncate text-xs font-medium text-primary">{item.name}</p>
        <p className="truncate text-[11px] text-secondary">{item.subtitle}</p>
      </div>
    </a>
  );
}

export function TopArtists({ items }: { items: TopItem[] }) {
  const reduce = useReducedMotion();
  if (!items.length) {
    return <p className="text-sm text-secondary">No top artists yet.</p>;
  }
  return (
    <motion.div
      className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6"
      variants={reduce ? undefined : staggerFast}
      initial={reduce ? undefined : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, amount: 0.15 }}
    >
      {items.map((item) => (
        <motion.div key={item.url} variants={reduce ? undefined : scaleIn}>
          <ArtistTile item={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
