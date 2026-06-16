export interface LyricLine {
  /** timestamp in seconds */
  t: number;
  text: string;
}

export interface LyricsResult {
  found: boolean;
  lines: LyricLine[];
  plain: string;
}
