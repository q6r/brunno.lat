export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base"
    >
      <div
        className="absolute -top-1/4 left-1/4 h-[60vmax] w-[60vmax] rounded-full opacity-[0.10] blur-[120px] will-change-transform"
        style={{
          background: "radial-gradient(circle, #5865f2, transparent 60%)",
          animation: "aurora-drift 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 -right-1/4 h-[55vmax] w-[55vmax] rounded-full opacity-[0.08] blur-[120px] will-change-transform"
        style={{
          background: "radial-gradient(circle, #1db954, transparent 60%)",
          animation: "aurora-drift 22s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[40vmax] w-[40vmax] rounded-full opacity-[0.06] blur-[120px] will-change-transform"
        style={{
          background: "radial-gradient(circle, #e5e5e5, transparent 60%)",
          animation: "aurora-drift 26s ease-in-out infinite",
        }}
      />
      {/* Vignette toward the base color so content stays legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, transparent, #0b0b0b 80%)",
        }}
      />
    </div>
  );
}
