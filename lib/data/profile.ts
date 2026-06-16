export interface SocialLink {
  label: string;
  url: string;
}

export const PROFILE = {
  name: "Brunno",
  subtitle: "Full Stack Developer • Cybersecurity Student",
  tagline:
    "Building refined digital experiences — real-time presence, music, and motion.",
  socials: [
    { label: "GitHub", url: "https://github.com/crynew" },
    { label: "Last.fm", url: "https://www.last.fm/user/crynew" },
    { label: "Discord", url: "https://discord.com/users/73598582153805824" },
  ] satisfies SocialLink[],
};
