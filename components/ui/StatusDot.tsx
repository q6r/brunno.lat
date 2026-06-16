import { cn } from "@/lib/cn";
import type { PresenceStatus } from "@/types/discord";

const STATUS_BG: Record<PresenceStatus, string> = {
  online: "bg-online",
  idle: "bg-idle",
  dnd: "bg-dnd",
  offline: "bg-offline",
};

export const STATUS_LABEL: Record<PresenceStatus, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

export function StatusDot({
  status,
  pulse = false,
  className,
}: {
  status: PresenceStatus;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex h-2.5 w-2.5", className)}>
      {pulse && status !== "offline" && (
        <span
          className={cn(
            "absolute inset-0 rounded-full opacity-60",
            STATUS_BG[status]
          )}
          style={{ animation: "pulse-ring 2s ease-out infinite" }}
        />
      )}
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full",
          STATUS_BG[status]
        )}
      />
    </span>
  );
}
