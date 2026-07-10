"use client";

export default function CinematicGrain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999] opacity-[0.035] mix-blend-soft-light"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.6) 0 0.6px, transparent 0.8px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.45) 0 0.5px, transparent 0.7px)",
        backgroundSize: "3px 3px, 5px 5px",
      }}
      aria-hidden="true"
    />
  );
}
