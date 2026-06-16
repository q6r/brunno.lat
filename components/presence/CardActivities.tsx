"use client";

import Image from "next/image";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useElapsed } from "@/hooks/useElapsed";
import { getActivityVisual, ACTIVITY_TYPE_VERB } from "@/lib/data/activityIcons";
import type {
  DiscordActivity,
  DiscordPresence,
  SpotifyActivity,
} from "@/types/discord";

function SpotifyRow({ spotify }: { spotify: SpotifyActivity }) {
  const hasTiming = spotify.start > 0 && spotify.end > spotify.start;
  const { progress, remainingLabel } = useElapsed(
    hasTiming ? spotify.start : undefined,
    hasTiming ? spotify.end : undefined
  );
  return (
    <div className="flex items-center gap-3">
      {spotify.albumArtUrl ? (
        <Image
          src={spotify.albumArtUrl}
          alt={spotify.album || spotify.song}
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-elevated text-2xl text-spotify">
          ♪
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-medium uppercase tracking-wide text-spotify">
          Listening to Spotify
        </span>
        <p className="truncate text-sm font-medium text-primary">
          {spotify.song}
        </p>
        <p className="truncate text-xs text-secondary">by {spotify.artist}</p>
        {hasTiming && (
          <div className="mt-1.5 flex items-center gap-2">
            <ProgressBar value={progress} accent="var(--color-spotify)" animated />
            <span className="shrink-0 text-[10px] tabular-nums text-secondary">
              {remainingLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ activity }: { activity: DiscordActivity }) {
  const visual = getActivityVisual(activity);
  const { elapsedLabel } = useElapsed(activity.timestamps?.start, undefined);
  const verb = ACTIVITY_TYPE_VERB[activity.type] || visual.category;
  return (
    <div className="flex items-center gap-3">
      {activity.assets?.largeImageUrl ? (
        <Image
          src={activity.assets.largeImageUrl}
          alt={activity.name}
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-2xl font-semibold"
          style={{
            background: `color-mix(in srgb, ${visual.accent} 18%, #161616)`,
            color: visual.accent,
          }}
        >
          {visual.glyph}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span
          className="text-[10px] font-medium uppercase tracking-wide"
          style={{ color: visual.accent }}
        >
          {verb}
        </span>
        <p className="truncate text-sm font-medium text-primary">
          {activity.name}
        </p>
        {activity.details && (
          <p className="truncate text-xs text-secondary">{activity.details}</p>
        )}
        {activity.state && (
          <p className="truncate text-[11px] text-secondary/70">
            {activity.state}
          </p>
        )}
      </div>
      {activity.timestamps?.start && (
        <span className="shrink-0 self-start text-[10px] tabular-nums text-secondary">
          {elapsedLabel}
        </span>
      )}
    </div>
  );
}

export function CardActivities({
  presence,
}: {
  presence: DiscordPresence | null;
}) {
  const activities =
    presence?.activities.filter((a) => a.type !== 2 && a.type !== 4) ?? [];
  const hasContent = !!presence?.spotify || activities.length > 0;

  return (
    <div className="mt-5 border-t border-subtle pt-4">
      <span className="text-xs uppercase tracking-wide text-secondary">
        Activities
      </span>
      <div className="mt-3 flex flex-col gap-3">
        {presence?.spotify && <SpotifyRow spotify={presence.spotify} />}
        {activities.map((activity, i) => (
          <ActivityRow key={`${activity.name}-${i}`} activity={activity} />
        ))}
        {!hasContent && (
          <p className="text-sm text-secondary">
            Nothing right now — open Spotify, a game or an app and it shows up
            here live.
          </p>
        )}
      </div>
    </div>
  );
}
