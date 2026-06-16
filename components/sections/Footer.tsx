import { PROFILE } from "@/lib/data/profile";
import { CurrentYear } from "@/components/ui/CurrentYear";

export function Footer() {
  return (
    <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-subtle py-12 sm:flex-row">
      <p className="text-sm text-secondary">
        © <CurrentYear /> {PROFILE.name}. Crafted with Next.js & motion.
      </p>
      <nav className="flex items-center gap-5">
        {PROFILE.socials.map((s) => (
          <a
            key={s.label}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-secondary transition-colors hover:text-primary"
          >
            {s.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
