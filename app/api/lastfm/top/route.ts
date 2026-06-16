import type { NextRequest } from "next/server";
import { getTopArtists, getTopAlbums, getTopTracks } from "@/lib/lastfm";
import type { LfmPeriod, TopType } from "@/types/lastfm";

const PERIODS: LfmPeriod[] = ["7day", "1month", "3month", "6month", "12month", "overall"];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = (sp.get("type") ?? "artists") as TopType;
  const periodRaw = sp.get("period") ?? "1month";
  const period: LfmPeriod = PERIODS.includes(periodRaw as LfmPeriod)
    ? (periodRaw as LfmPeriod)
    : "1month";
  const limit = Math.min(Number(sp.get("limit")) || 12, 24);

  try {
    const items =
      type === "albums"
        ? await getTopAlbums(period, limit)
        : type === "tracks"
          ? await getTopTracks(period, limit)
          : await getTopArtists(period, limit);
    return Response.json({ ok: true, type, period, items });
  } catch {
    return Response.json({ ok: false, type, period, items: [] });
  }
}
