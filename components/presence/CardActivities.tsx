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

/**
 * Compact activity tile shown for every activity beyond the primary one. The
 * full details live in a popover that reveals on hover or keyboard focus.
 */
function ActivityThumb({ activity }: { activity: DiscordActivity }) {
  const visual = getActivityVisual(activity);
  const { elapsedLabel } = useElapsed(activity.timestamps?.start, undefined);
  // For apps/games (type 0) the category reads better than the generic
  // "Playing" verb (e.g. "Coding" for VS Code, "Browsing" for a browser).
  const verb =
    activity.type === 0
      ? visual.category
      : ACTIVITY_TYPE_VERB[activity.type] || visual.category;
  const fallbackStyle = {
    background: `color-mix(in srgb, ${visual.accent} 18%, #161616)`,
    color: visual.accent,
  };

  return (
    <div className="group/act relative">
      <button
        type="button"
        aria-label={`${verb} ${activity.name}`}
        className="relative block shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-highlight"
      >
        <span className="block h-11 w-11 overflow-hidden rounded-md ring-1 ring-subtle transition-transform duration-200 group-hover/act:scale-105">
          {activity.assets?.largeImageUrl ? (
            <Image
              src={activity.assets.largeImageUrl}
              alt={activity.name}
              width={44}
              height={44}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center text-base font-semibold"
              style={fallbackStyle}
            >
              {visual.glyph}
            </span>
          )}
        </span>
        {activity.assets?.smallImageUrl && (
          <Image
            src={activity.assets.smallImageUrl}
            alt={activity.assets.smallText || ""}
            width={16}
            height={16}
            unoptimized
            className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full object-cover ring-2 ring-base"
          />
        )}
      </button>

      {/* Hover/focus popover. The outer wrapper sits flush against the thumb
          (bottom-full) and its `pb-2` forms a transparent bridge over the gap,
          so moving the cursor from the thumb onto the popover keeps it open.
          It becomes interactive only while open so it never blocks clicks. */}
      <div
        className="pointer-events-none absolute bottom-full left-0 z-50 w-64 max-w-[calc(100vw-3rem)] translate-y-1 pb-2 opacity-0 transition-all duration-150 group-hover/act:pointer-events-auto group-hover/act:translate-y-0 group-hover/act:opacity-100 group-focus-within/act:pointer-events-auto group-focus-within/act:translate-y-0 group-focus-within/act:opacity-100"
      >
       <div
        role="tooltip"
        className="rounded-lg border border-subtle bg-elevated p-3 shadow-soft"
       >
        <div className="flex gap-3">
          {activity.assets?.largeImageUrl ? (
            <Image
              src={activity.assets.largeImageUrl}
              alt={activity.assets.largeText || activity.name}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-xl font-semibold"
              style={fallbackStyle}
            >
              {visual.glyph}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-primary">
              {activity.name}
            </p>
            {activity.details && (
              <p className="truncate text-xs text-secondary">
                {activity.details}
              </p>
            )}
            {activity.state && (
              <p className="truncate text-[11px] text-secondary/70">
                {activity.state}
              </p>
            )}
          </div>
        </div>

        {(activity.assets?.largeText ||
          activity.timestamps?.start ||
          (activity.buttons && activity.buttons.length > 0)) && (
          <div className="mt-2 flex flex-col gap-1 border-t border-subtle pt-2">
            {activity.assets?.largeText && (
              <span className="truncate text-[11px] text-secondary">
                {activity.assets.largeText}
              </span>
            )}
            {activity.timestamps?.start && (
              <span className="text-[11px] tabular-nums text-secondary">
                {elapsedLabel} elapsed
              </span>
            )}
            {activity.buttons && activity.buttons.length > 0 && (
              <div className="mt-0.5 flex flex-wrap gap-1.5">
                {activity.buttons.map((b, i) =>
                  b.url ? (
                    <a
                      key={i}
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-chip border border-subtle px-2 py-0.5 text-[10px] text-highlight transition-colors hover:border-subtle-2 hover:bg-subtle"
                    >
                      {b.label}
                    </a>
                  ) : (
                    <span
                      key={i}
                      className="rounded-chip border border-subtle px-2 py-0.5 text-[10px] text-highlight"
                    >
                      {b.label}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        )}
       </div>
      </div>
    </div>
  );
}

export function CardActivities({
  presence,
}: {
  presence: DiscordPresence | null;
}) {
  const spotify = presence?.spotify ?? null;
  // Show every activity except the custom status (type 4) and the Spotify track,
  // which is already rendered as the primary row. Other listening apps (type 2,
  // e.g. Mono) and games/apps (type 0) are kept.
  const activities = (presence?.activities ?? []).filter(
    (a) =>
      a.type !== 4 &&
      !(
        a.type === 2 &&
        (a.name.toLowerCase() === "spotify" ||
          (spotify !== null && a.details === spotify.song))
      )
  );
  const hasContent = !!spotify || activities.length > 0;

  // The first item (Spotify, or the first app/game) keeps the full detailed
  // row. Everything else collapses into compact thumbnails with hover popovers,
  // so the card stays short no matter how many activities are running.
  const primaryActivity = spotify ? null : activities[0];
  const extras = spotify ? activities : activities.slice(1);

  return (
    <div className="mt-5 border-t border-subtle pt-4">
      <span className="text-xs uppercase tracking-wide text-secondary">
        Activities
      </span>
      <div className="mt-3 flex flex-col gap-3">
        {spotify && <SpotifyRow spotify={spotify} />}
        {primaryActivity && <ActivityRow activity={primaryActivity} />}
        {extras.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {extras.map((activity, i) => (
              <ActivityThumb key={`${activity.name}-${i}`} activity={activity} />
            ))}
          </div>
        )}
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
