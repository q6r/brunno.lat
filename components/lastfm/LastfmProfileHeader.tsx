import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { flagUrl } from "@/lib/data/countries";
import type { UserStats } from "@/types/lastfm";

export function LastfmProfileHeader({ stats }: { stats: UserStats }) {
  const flag = flagUrl(stats.countryCode);
  const displayName = stats.realName || stats.username;

  return (
    <GlassCard className="flex items-center gap-4 p-4 sm:gap-5 sm:p-5">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-subtle-2 sm:h-20 sm:w-20">
        {stats.imageUrl ? (
          <Image
            src={stats.imageUrl}
            alt={displayName}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-elevated text-xl text-secondary">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-lg font-semibold text-primary sm:text-xl">
            {displayName}
          </h3>
          {flag && (
            <Image
              src={flag}
              alt={stats.country}
              title={stats.country}
              width={21}
              height={14}
              className="shrink-0 rounded-[2px] shadow-soft"
            />
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm">
          <a
            href={stats.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary transition-colors hover:text-highlight"
          >
            @{stats.username}
          </a>
          {stats.country && (
            <span className="text-xs text-secondary/70">· {stats.country}</span>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 flex-col items-end sm:flex">
        <span className="text-lg font-semibold tabular-nums text-primary">
          {stats.totalScrobbles.toLocaleString()}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-secondary">
          scrobbles
        </span>
      </div>
    </GlassCard>
  );
}
