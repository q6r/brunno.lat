import { getDiscordFriends } from "@/lib/discord";
import type { FriendsResponse } from "@/types/discord";

export async function GET() {
  try {
    const friends = await getDiscordFriends();
    const payload: FriendsResponse = {
      ok: true,
      available: friends.length > 0,
      friends,
    };
    return Response.json(payload);
  } catch {
    return Response.json({ ok: false, available: false, friends: [] });
  }
}
