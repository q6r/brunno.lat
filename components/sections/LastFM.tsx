import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { LastfmProfileHeader } from "@/components/lastfm/LastfmProfileHeader";
import { TopArtists } from "@/components/lastfm/TopArtists";
import { ListeningStats } from "@/components/lastfm/ListeningStats";
import type { TopItem, UserStats } from "@/types/lastfm";

export function LastFM({
  recentSlot,
  topArtists,
  topAlbums,
  topTracks,
  stats,
}: {
  recentSlot: ReactNode;
  topArtists: TopItem[];
  topAlbums: TopItem[];
  topTracks: TopItem[];
  stats: UserStats;
}) {
  return (
    <section id="lastfm" className="py-20 sm:py-28">
      <SectionHeading
        kicker="Last.fm"
        title="Listening"
        subtitle="Real scrobbles from @crynew, refreshed automatically."
      />

      <div className="flex flex-col gap-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-secondary">
              Recent Tracks
            </h3>
            <Card className="p-2">{recentSlot}</Card>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-secondary">
                Profile
              </h3>
              <LastfmProfileHeader stats={stats} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-secondary">
                Top Artists
              </h3>
              <TopArtists items={topArtists} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-secondary">
            Listening Stats
          </h3>
          <ListeningStats
            stats={stats}
            topArtist={topArtists[0]}
            topAlbum={topAlbums[0]}
            topTrack={topTracks[0]}
          />
        </div>
      </div>
    </section>
  );
}
