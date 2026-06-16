"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useDiscordPresence } from "@/hooks/useDiscordPresence";
import { useLyrics } from "@/hooks/useLyrics";
import { cn } from "@/lib/cn";
import type { SpotifyActivity } from "@/types/discord";
import type { LyricLine } from "@/types/lyrics";

const WINDOW_BEFORE = 1;
const WINDOW_AFTER = 4;

/* ---------------- Fullscreen lyrics overlay ---------------- */
function LyricsOverlay({
  spotify,
  lines,
  idx,
  onClose,
}: {
  spotify: SpotifyActivity;
  lines: LyricLine[];
  idx: number;
  onClose: () => void;
}) {
  const currentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-base/85 backdrop-blur-2xl" />

      <div
        className="relative mx-auto flex h-full max-w-2xl flex-col px-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center gap-4 py-6">
          {spotify.albumArtUrl && (
            <Image
              src={spotify.albumArtUrl}
              alt={spotify.album || spotify.song}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 rounded-md object-cover shadow-soft"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-primary">
              {spotify.song}
            </p>
            <p className="truncate text-sm text-secondary">{spotify.artist}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lyrics"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-subtle text-secondary transition-colors hover:border-subtle-2 hover:text-primary"
          >
            ✕
          </button>
        </div>

        {/* lyrics */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent, #000 12%, #000 82%, transparent)",
          }}
        >
          <div className="flex flex-col gap-3 py-[42vh] text-center">
            {lines.map((line, i) => (
              <p
                key={`${i}-${line.t}`}
                ref={i === idx ? currentRef : undefined}
                className={cn(
                  "font-display leading-tight transition-all duration-300",
                  i === idx
                    ? "text-3xl font-semibold text-primary"
                    : i < idx
                      ? "text-2xl text-secondary/30"
                      : "text-2xl text-secondary/55"
                )}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Corner ticker ---------------- */
export function LyricsTicker() {
  const { presence } = useDiscordPresence();
  const spotify = presence?.spotify ?? null;
  const { lines, found } = useLyrics(spotify);

  const [now, setNow] = useState(0);
  const [open, setOpen] = useState(false);
  const active = !!spotify && found && lines.length > 0;
  const start = spotify?.start ?? 0;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [active, start]);

  if (!active) return null;

  const elapsed = now ? (now - start) / 1000 : 0;
  // last line whose timestamp has passed; -1 = song hasn't reached the first
  // line yet → we still show the beginning.
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].t <= elapsed) idx = i;
    else break;
  }

  const from = Math.max(0, idx - WINDOW_BEFORE);
  const windowLines = lines.slice(from, idx + 1 + WINDOW_AFTER);

  return (
    <>
      <div className="pointer-events-none fixed right-8 top-24 z-20 hidden w-[42vw] max-w-[480px] select-none lg:block">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open lyrics"
          className="pointer-events-auto block w-full cursor-pointer text-right"
          style={{
            transform: "rotate(7deg)",
            maskImage:
              "linear-gradient(to bottom, transparent, #000 22%, #000 70%, transparent)",
          }}
        >
          <div className="flex flex-col items-end gap-1.5">
            {windowLines.map((line, i) => {
              const isCurrent = from + i === idx;
              return (
                <span
                  key={`${from + i}-${line.t}`}
                  className={cn(
                    "block truncate font-display leading-tight transition-all duration-500",
                    isCurrent
                      ? "text-2xl text-primary/90"
                      : "text-xl text-secondary/25"
                  )}
                >
                  {line.text}
                </span>
              );
            })}
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <LyricsOverlay
            spotify={spotify}
            lines={lines}
            idx={idx}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
