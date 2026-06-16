export interface GithubProfile {
  login: string;
  name: string;
  avatarUrl: string | null;
  bio: string;
  htmlUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  location: string | null;
  blog: string | null;
  company: string | null;
}

export interface GithubRepo {
  name: string;
  description: string;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  isFork: boolean;
  homepage: string | null;
}

export type SocialTab = "discord" | "github";
