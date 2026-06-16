import "server-only";

/**
 * Server-only environment access. Keeps the Last.fm API key out of any
 * client bundle (importing this file from a client component is a build error
 * thanks to `server-only`).
 */
export function getLastfmApiKey(): string | null {
  return process.env.LASTFM_API_KEY?.trim() || null;
}

export function getLastfmUser(): string {
  return process.env.LASTFM_USER?.trim() || "crynew";
}
