import { Suspense } from "react";
import { getDiscordProfile } from "@/lib/discord";
import {
  getGithubProfile,
  getGithubRepos,
  getGithubReadmeHtml,
} from "@/lib/github";
import {
  getRecentTracks,
  getTopAlbums,
  getTopArtists,
  getTopTracks,
  getUserStats,
} from "@/lib/lastfm";
import { Hero } from "@/components/sections/Hero";
import { Socials } from "@/components/sections/Socials";
import { Friends } from "@/components/sections/Friends";
import { LastFM } from "@/components/sections/LastFM";
import { TechStack } from "@/components/sections/TechStack";
import { Footer } from "@/components/sections/Footer";
import { BottomNav } from "@/components/dock/BottomNav";
import { ActivityBubble } from "@/components/dock/ActivityBubble";
import { LyricsTicker } from "@/components/effects/LyricsTicker";
import { RecentTracks } from "@/components/lastfm/RecentTracks";
import { RecentTracksSkeleton } from "@/components/ui/Skeletons";

// Short-lived (cacheLife 'seconds') → dynamic hole, must live under <Suspense>.
async function RecentTracksLoader() {
  const tracks = await getRecentTracks(6);
  return <RecentTracks initialTracks={tracks} />;
}

export default async function Home() {
  const [
    profile,
    github,
    githubRepos,
    githubReadmeHtml,
    stats,
    topArtists,
    topAlbums,
    topTracks,
  ] = await Promise.all([
    getDiscordProfile(),
    getGithubProfile(),
    getGithubRepos(6),
    getGithubReadmeHtml(),
    getUserStats(),
    getTopArtists("overall", 12),
    getTopAlbums("1month", 6),
    getTopTracks("1month", 6),
  ]);

  return (
    <>
      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-28 sm:px-8">
        <Hero profile={profile} scrobbles={stats.totalScrobbles} />
      <Socials
        discord={profile}
        github={github}
        githubRepos={githubRepos}
        githubReadmeHtml={githubReadmeHtml}
      />
      <Friends />
      <LastFM
        topArtists={topArtists}
        topAlbums={topAlbums}
        topTracks={topTracks}
        stats={stats}
        recentSlot={
          <Suspense fallback={<RecentTracksSkeleton />}>
            <RecentTracksLoader />
          </Suspense>
        }
      />
      <TechStack />
      <Footer />
      </main>
      <LyricsTicker />
      <BottomNav />
      <ActivityBubble profile={profile} />
    </>
  );
}
