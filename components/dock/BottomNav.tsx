"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/cn";

function ArrowUpIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
    >
      <path d="M8 13V3M4 7l4-4 4 4" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M5.5 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM1 13c0-2.2 2-3.6 4.5-3.6S10 10.8 10 13v.5H1V13Z" />
      <path d="M11 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.3 5.5c2 .1 3.7 1.3 3.7 3.5v.5h-3.1c.1-1.4-.4-2.7-1.4-3.7.3-.1.6-.2.8-.3Z" />
    </svg>
  );
}
function StackIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M8 1 1 4.5 8 8l7-3.5L8 1Zm5 6L8 9.5 3 7 1 8l7 3.5L15 8l-2-1Zm0 3.5L8 13 3 10.5l-2 1L8 15l7-3.5-2-1Z" />
    </svg>
  );
}

interface NavItem {
  id: string;
  label: string;
  /** section id to scroll to; "top" scrolls to page top */
  target: string;
  icon: ReactNode;
}

function SimpleIcon({ slug }: { slug: string }) {
  return (
    <Image
      src={`https://cdn.simpleicons.org/${slug}/white`}
      alt=""
      width={18}
      height={18}
      unoptimized
      className="h-[18px] w-[18px]"
    />
  );
}

const ITEMS: NavItem[] = [
  { id: "top", label: "Top", target: "top", icon: <ArrowUpIcon /> },
  { id: "discord", label: "Discord", target: "discord", icon: <SimpleIcon slug="discord" /> },
  { id: "friends", label: "Friends", target: "friends", icon: <PeopleIcon /> },
  { id: "lastfm", label: "Last.fm", target: "lastfm", icon: <SimpleIcon slug="lastdotfm" /> },
  { id: "stack", label: "Tech", target: "stack", icon: <StackIcon /> },
];

const SECTION_IDS = ["discord", "friends", "lastfm", "stack"];

export function BottomNav() {
  const [active, setActive] = useState<string>("top");

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (!sections.length) return;

    const onScroll = () => {
      if (window.scrollY < 200) {
        setActive("top");
        return;
      }
      // pick the section whose top is closest above the viewport middle
      const mid = window.scrollY + window.innerHeight / 2;
      let current = "top";
      for (const sec of sections) {
        if (sec.offsetTop <= mid) current = sec.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (target: string) => {
    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
      <div className="glass flex items-center gap-1 rounded-chip p-1.5 shadow-card">
        {ITEMS.map((item) => (
          <Tooltip key={item.id} label={item.label}>
            <button
              type="button"
              aria-label={item.label}
              onClick={() => go(item.target)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                active === item.target
                  ? "bg-elevated text-primary"
                  : "text-secondary hover:bg-elevated/60 hover:text-primary"
              )}
            >
              {item.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </nav>
  );
}
