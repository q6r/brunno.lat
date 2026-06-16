"use client";

import { useEffect, useState } from "react";
import { useDiscordPresence } from "@/hooks/useDiscordPresence";
import { useLyrics } from "@/hooks/useLyrics";
import { cn } from "@/lib/cn";

const WINDOW_BEFORE = 1;
const WINDOW_AFTER = 4;

export function LyricsTicker() {
  const { presence } = useDiscordPresence();
  const spotify = presence?.spotify ?? null;
  const { lines, found } = useLyrics(spotify);

  // `now` is driven by an interval (async setState only — avoids reading the
  // clock during render / set-state-in-effect). 0 until mounted → renders nothing.
  const [now, setNow] = useState(0);
  const active = !!spotify && found && lines.length > 0;
  const start = spotify?.start ?? 0;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [active, start]);

  if (!active || !now) return null;

  const elapsed = (now - start) / 1000;
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].t <= elapsed) idx = i;
    else break;
  }
  if (idx < 0) return null;

  const from = Math.max(0, idx - WINDOW_BEFORE);
  const windowLines = lines.slice(from, idx + 1 + WINDOW_AFTER);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-8 top-24 z-20 hidden w-[42vw] max-w-[480px] select-none lg:block"
      style={{ transform: "rotate(7deg)", maskImage: "linear-gradient(to bottom, transparent, #000 22%, #000 70%, transparent)" }}
    >
      <div className="flex flex-col items-end gap-1.5 text-right">
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
    </div>
  );
}
