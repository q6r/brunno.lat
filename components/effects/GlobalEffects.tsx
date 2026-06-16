import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { NoiseOverlay } from "@/components/effects/NoiseOverlay";
import { CursorGlow } from "@/components/effects/CursorGlow";

/**
 * Mounts decorative, non-interactive global effects. Aurora + noise are static
 * (server-rendered); CursorGlow is the only client island.
 */
export function GlobalEffects() {
  return (
    <>
      <AuroraBackground />
      <NoiseOverlay />
      <CursorGlow />
    </>
  );
}
