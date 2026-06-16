export type LfmPeriod =
  | "7day"
  | "1month"
  | "3month"
  | "6month"
  | "12month"
  | "overall";

export interface NowPlayingTrack {
  name: string;
  artist: string;
  album: string;
  imageUrl: string | null;
  url: string;
  nowPlaying: boolean;
  /** Unix seconds, or null when now playing */
  playedAt: number | null;
}

export interface TopItem {
  name: string;
  /** artist for albums/tracks; empty for artists */
  subtitle: string;
  imageUrl: string | null;
  url: string;
  playcount: number;
  rank: number;
}

export interface UserStats {
  totalScrobbles: number;
  artistCount: number;
  trackCount: number;
  albumCount: number;
  registeredUnix: number | null;
  imageUrl: string | null;
  username: string;
  realName: string;
  country: string;
  countryCode: string | null;
  profileUrl: string;
}

export type TopType = "artists" | "albums" | "tracks";

/* ---------- Raw Last.fm response shapes (partial) ---------- */
export interface LfmImage {
  "#text": string;
  size: string;
}

export interface LfmErrorResponse {
  error: number;
  message: string;
}

export interface LfmRecentTrack {
  name: string;
  url: string;
  artist: { "#text": string };
  album: { "#text": string };
  image: LfmImage[];
  date?: { uts: string };
  "@attr"?: { nowplaying?: string };
}

export interface LfmRecentTracksResponse {
  recenttracks: {
    track: LfmRecentTrack[];
  };
}

export interface LfmTopArtist {
  name: string;
  url: string;
  playcount: string;
  image: LfmImage[];
  "@attr"?: { rank: string };
}

export interface LfmTopArtistsResponse {
  topartists: { artist: LfmTopArtist[] };
}

export interface LfmTopAlbum {
  name: string;
  url: string;
  playcount: string;
  image: LfmImage[];
  artist: { name: string };
  "@attr"?: { rank: string };
}

export interface LfmTopAlbumsResponse {
  topalbums: { album: LfmTopAlbum[] };
}

export interface LfmTopTrack {
  name: string;
  url: string;
  playcount: string;
  image: LfmImage[];
  artist: { name: string };
  "@attr"?: { rank: string };
}

export interface LfmTopTracksResponse {
  toptracks: { track: LfmTopTrack[] };
}

export interface LfmUserInfoResponse {
  user: {
    name: string;
    realname: string;
    country: string;
    url: string;
    playcount: string;
    artist_count: string;
    track_count: string;
    album_count: string;
    registered: { unixtime: string };
    image: LfmImage[];
  };
}
