"use client";

export default function CinematicGrain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[999] opacity-[0.03] mix-blend-soft-light">
      <svg className="w-full h-full">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>

        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}