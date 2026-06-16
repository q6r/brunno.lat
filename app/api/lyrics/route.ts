import type { NextRequest } from "next/server";
import { getLyrics } from "@/lib/lyrics";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const artist = sp.get("artist") ?? "";
  const track = sp.get("track") ?? "";
  const album = sp.get("album") ?? undefined;
  const durationRaw = Number(sp.get("duration"));
  const duration = Number.isFinite(durationRaw) ? durationRaw : undefined;

  if (!artist || !track) {
    return Response.json({ found: false, lines: [], plain: "" });
  }

  try {
    const result = await getLyrics(artist, track, album, duration);
    return Response.json(result);
  } catch {
    return Response.json({ found: false, lines: [], plain: "" });
  }
}
