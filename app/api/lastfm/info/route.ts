import { getUserStats } from "@/lib/lastfm";

export async function GET() {
  try {
    const stats = await getUserStats();
    return Response.json({ ok: true, stats });
  } catch {
    return Response.json({ ok: false, stats: null });
  }
}
