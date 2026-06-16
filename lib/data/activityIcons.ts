import type { DiscordActivity } from "@/types/discord";

export interface ActivityVisual {
  category: string;
  accent: string;
  /** monogram fallback when no asset image is available */
  glyph: string;
}

/**
 * Derives a category + accent for an activity, used as a styled fallback
 * when Discord doesn't provide asset images.
 */
export function getActivityVisual(activity: DiscordActivity): ActivityVisual {
  const name = activity.name.toLowerCase();

  if (activity.type === 2 || name === "spotify")
    return { category: "Music", accent: "#1db954", glyph: "♪" };
  if (name.includes("visual studio code") || name.includes("code"))
    return { category: "Coding", accent: "#0098ff", glyph: "{ }" };
  if (name.includes("chrome") || name.includes("browser") || name.includes("firefox"))
    return { category: "Browsing", accent: "#4285f4", glyph: "◎" };
  if (activity.type === 1 || name.includes("twitch") || name.includes("stream"))
    return { category: "Streaming", accent: "#9146ff", glyph: "▶" };
  if (activity.type === 3)
    return { category: "Watching", accent: "#e5e5e5", glyph: "▷" };
  if (activity.type === 0)
    return { category: "Playing", accent: "#5865f2", glyph: "◆" };

  return { category: "Activity", accent: "#9b9b9b", glyph: "●" };
}

export const ACTIVITY_TYPE_VERB: Record<number, string> = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  4: "",
  5: "Competing in",
};
