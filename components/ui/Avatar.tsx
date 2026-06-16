import Image from "next/image";
import { cn } from "@/lib/cn";
import type { PresenceStatus } from "@/types/discord";

const RING: Record<PresenceStatus, string> = {
  online: "ring-online",
  idle: "ring-idle",
  dnd: "ring-dnd",
  offline: "ring-offline",
};

const DOT_BG: Record<PresenceStatus, string> = {
  online: "bg-online",
  idle: "bg-idle",
  dnd: "bg-dnd",
  offline: "bg-offline",
};

export function Avatar({
  src,
  alt,
  size = 80,
  status,
  ring = false,
  priority = false,
  className,
}: {
  src: string | null;
  alt: string;
  size?: number;
  status?: PresenceStatus;
  ring?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const initial = alt?.trim()?.[0]?.toUpperCase() ?? "?";
  const dotSize = Math.max(10, Math.round(size * 0.22));

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
    >
      <span
        className={cn(
          "block overflow-hidden rounded-full",
          ring && status && `ring-2 ring-offset-2 ring-offset-base ${RING[status]}`,
          className
        )}
        style={{ width: size, height: size }}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            priority={priority}
            unoptimized={src.endsWith(".gif")}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center bg-elevated font-medium text-secondary"
            style={{ fontSize: Math.round(size * 0.4) }}
          >
            {initial}
          </span>
        )}
      </span>

      {status && (
        <span
          className="absolute bottom-0 right-0 rounded-full ring-2 ring-base"
          style={{ width: dotSize, height: dotSize }}
        >
          <span
            className={cn("block h-full w-full rounded-full", DOT_BG[status])}
          />
        </span>
      )}
    </span>
  );
}
