"use client";

import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { languageColor } from "@/lib/data/languageColors";
import type { GithubProfile, GithubRepo } from "@/types/social";

function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
function withProtocol(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0">
      <path d="M5.5 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM1 13c0-2.2 2-3.6 4.5-3.6S10 10.8 10 13v.5H1V13Z" />
      <path d="M11 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.3 5.5c2 .1 3.7 1.3 3.7 3.5v.5h-3.1c.1-1.4-.4-2.7-1.4-3.7.3-.1.6-.2.8-.3Z" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0">
      <path d="M8 1a5 5 0 0 0-5 5c0 3.6 5 9 5 9s5-5.4 5-9a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="h-4 w-4 shrink-0"
    >
      <path d="M6.5 9.5 9.5 6.5M7 4.5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M9 11.5l-1 1a2.5 2.5 0 0 1-3.5-3.5l1-1" />
    </svg>
  );
}
function OrgIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0">
      <path d="M2 14V2h7v3h5v9H2Zm1-1h5V3H3v10Zm6 0h4V6H9v7ZM4 4h1v1H4V4Zm2 0h1v1H6V4ZM4 6h1v1H4V6Zm2 0h1v1H6V6ZM4 8h1v1H4V8Zm2 0h1v1H6V8Zm4 0h1v1h-1V8Zm0 2h1v1h-1v-1Z" />
    </svg>
  );
}

function GithubSidebar({ profile }: { profile: GithubProfile }) {
  return (
    <div className="flex flex-col gap-4">
      <Image
        src={profile.avatarUrl ?? ""}
        alt={profile.name}
        width={260}
        height={260}
        unoptimized
        className="aspect-square w-full max-w-[240px] rounded-full object-cover ring-1 ring-subtle-2"
      />

      <div className="flex flex-col gap-0.5">
        <h3 className="text-2xl font-semibold leading-tight text-primary">
          {profile.name}
        </h3>
        <span className="text-lg text-secondary">@{profile.login}</span>
      </div>

      {profile.bio && (
        <p className="text-sm leading-relaxed text-highlight">{profile.bio}</p>
      )}

      <a
        href={profile.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-md border border-subtle bg-card/60 px-4 py-2 text-sm font-medium text-highlight transition-colors hover:border-subtle-2 hover:bg-elevated"
      >
        <Image
          src="https://cdn.simpleicons.org/github/white"
          alt=""
          width={16}
          height={16}
          unoptimized
          className="h-4 w-4"
        />
        View on GitHub
      </a>

      <ul className="flex flex-col gap-2 text-sm text-secondary">
        <li className="flex items-center gap-2">
          <PeopleIcon />
          <span>
            <span className="font-medium text-highlight">
              {profile.followers.toLocaleString()}
            </span>{" "}
            followers ·{" "}
            <span className="font-medium text-highlight">
              {profile.following.toLocaleString()}
            </span>{" "}
            following
          </span>
        </li>
        {profile.company && (
          <li className="flex items-center gap-2">
            <OrgIcon />
            <span>{profile.company}</span>
          </li>
        )}
        {profile.location && (
          <li className="flex items-center gap-2">
            <PinIcon />
            <span>{profile.location}</span>
          </li>
        )}
        {profile.blog && (
          <li className="flex items-center gap-2">
            <LinkIcon />
            <a
              href={withProtocol(profile.blog)}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-highlight hover:underline"
            >
              {prettyUrl(profile.blog)}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

function RepoCard({ repo }: { repo: GithubRepo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-2 rounded-card border border-subtle bg-card p-4 transition-colors hover:border-subtle-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-primary group-hover:text-highlight">
          {repo.name}
        </span>
        {repo.isFork && (
          <span className="shrink-0 rounded-chip border border-subtle px-2 py-0.5 text-[10px] uppercase tracking-wide text-secondary">
            Fork
          </span>
        )}
      </div>
      {repo.description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-secondary">
          {repo.description}
        </p>
      )}
      <div className="mt-auto flex items-center gap-3 pt-1 text-[11px] tabular-nums text-secondary">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: languageColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}
        <span className="inline-flex items-center gap-1">★ {repo.stars}</span>
        <span className="inline-flex items-center gap-1">⑂ {repo.forks}</span>
      </div>
    </a>
  );
}

export function GithubCard({
  profile,
  repos,
  readmeHtml,
}: {
  profile: GithubProfile | null;
  repos: GithubRepo[];
  readmeHtml: string | null;
}) {
  if (!profile) {
    return (
      <EmptyState
        title="GitHub profile unavailable"
        hint="Couldn't load the GitHub profile right now. Try again in a bit."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* GitHub-style profile sidebar (no card) | README */}
      <div
        className={cn(
          "grid items-start gap-8",
          readmeHtml && "lg:grid-cols-[260px_minmax(0,1fr)]"
        )}
      >
        <GithubSidebar profile={profile} />

        {readmeHtml && (
          <Card className="overflow-hidden p-5 sm:p-6">
            <div
              className="readme-body"
              dangerouslySetInnerHTML={{ __html: readmeHtml }}
            />
          </Card>
        )}
      </div>

      {/* Repositories below */}
      {repos.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-secondary">
            Repositories
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <RepoCard key={repo.name} repo={repo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
