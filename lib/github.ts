import "server-only";
import { cacheLife } from "next/cache";
import { fetchJson, fetchText } from "@/lib/http";
import { GITHUB_USER } from "@/lib/constants";
import type { GithubProfile, GithubRepo } from "@/types/social";

const GH_HEADERS = { "User-Agent": "crynew-portfolio" };

interface GithubApiUser {
  login: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
  blog: string | null;
  company: string | null;
}

export async function getGithubProfile(): Promise<GithubProfile | null> {
  "use cache";
  cacheLife("hours");
  try {
    const u = await fetchJson<GithubApiUser>(
      `https://api.github.com/users/${GITHUB_USER}`,
      { init: { headers: GH_HEADERS } }
    );
    if (!u?.login) return null;
    return {
      login: u.login,
      name: u.name || u.login,
      avatarUrl: u.avatar_url ?? null,
      bio: u.bio ?? "",
      htmlUrl: u.html_url || `https://github.com/${u.login}`,
      followers: u.followers ?? 0,
      following: u.following ?? 0,
      publicRepos: u.public_repos ?? 0,
      location: u.location ?? null,
      blog: u.blog?.trim() || null,
      company: u.company?.trim() || null,
    };
  } catch {
    return null;
  }
}

interface GithubApiRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  fork: boolean;
  homepage: string | null;
  updated_at: string;
}

function topLanguage(langs: Record<string, number>): string | null {
  let best: string | null = null;
  let max = -1;
  for (const [lang, bytes] of Object.entries(langs)) {
    if (bytes > max) {
      max = bytes;
      best = lang;
    }
  }
  return best;
}

export async function getGithubRepos(limit = 6): Promise<GithubRepo[]> {
  "use cache";
  cacheLife("hours");
  try {
    const repos = await fetchJson<GithubApiRepo[]>(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
      { init: { headers: GH_HEADERS } }
    );
    if (!Array.isArray(repos)) return [];

    const picked = repos
      // drop the special profile repo (q6r/q6r) — it's the README shown separately
      .filter((r) => r.name.toLowerCase() !== GITHUB_USER.toLowerCase())
      .map((r) => ({
        name: r.name,
        description: r.description ?? "",
        language: r.language ?? null,
        stars: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        url: r.html_url,
        isFork: !!r.fork,
        homepage: r.homepage || null,
        _updated: r.updated_at,
      }))
      .sort((a, b) => {
        // non-forks first, then by stars, then most recently updated
        if (a.isFork !== b.isFork) return a.isFork ? 1 : -1;
        if (b.stars !== a.stars) return b.stars - a.stars;
        return b._updated.localeCompare(a._updated);
      })
      .slice(0, limit);

    // Resolve the primary language per repo via /languages (the list field is
    // often null even when the repo has code).
    return Promise.all(
      picked.map(async ({ _updated, ...repo }) => {
        void _updated;
        try {
          const langs = await fetchJson<Record<string, number>>(
            `https://api.github.com/repos/${GITHUB_USER}/${repo.name}/languages`,
            { init: { headers: GH_HEADERS } }
          );
          return { ...repo, language: topLanguage(langs) ?? repo.language };
        } catch {
          return repo;
        }
      })
    );
  } catch {
    return [];
  }
}

export async function getGithubReadmeHtml(): Promise<string | null> {
  "use cache";
  cacheLife("hours");
  try {
    const html = await fetchText(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_USER}/readme`,
      {
        init: {
          headers: { ...GH_HEADERS, Accept: "application/vnd.github.html" },
        },
      }
    );
    return html?.trim() ? html : null;
  } catch {
    return null;
  }
}
