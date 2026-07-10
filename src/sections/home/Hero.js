import Button from "@/components/Button";
import Reveal from "../../components/Reveal";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-black">
      {/* Background Video */}
      <div className="absolute inset-0 scale-[1.03]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/marraige/hero.jpeg"
          aria-hidden="true"
          className="h-full w-full object-cover object-center opacity-90"
        >
          <source src="/herovideo.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Directional Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/25" />

      {/* Bottom Fade */}
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/70 to-transparent" />

      {/* Soft Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] items-center px-6 pb-20 pt-32 sm:px-8 md:px-16 lg:px-24">
        <Reveal>
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/60 sm:text-sm">
              Wedding & Event Photography
            </p>

            {/* Heading */}
            <h1 className="font-serif text-[clamp(3.5rem,11vw,8rem)] leading-[0.92] tracking-[-0.03em] text-white">
              Capturing
              <br />

              <span className="italic text-[var(--accent-gold)]">
                timeless
              </span>{" "}
              moments
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
              Cinematic wedding and event photography crafted with emotion,
              elegance, and storytelling at its core.
            </p>

            {/* Buttons */}
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button as={Link} href="/booking" variant="primary">
                Book Now
              </Button>

              <Button as={Link} href="/portfolio" variant="outline">
                View Portfolio
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
