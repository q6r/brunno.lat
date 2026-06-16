import type { NextRequest } from "next/server";
import { getRecentTracks } from "@/lib/lastfm";

export async function GET(req: NextRequest) {
  const raw = Number(req.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 20) : 6;
  try {
    const tracks = await getRecentTracks(limit);
    return Response.json({ ok: true, tracks });
  } catch {
    return Response.json({ ok: false, tracks: [] });
  }
}
