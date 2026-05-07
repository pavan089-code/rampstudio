import Reveal from "@/components/Reveal";
import Link from "next/link";
export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">

      {/* Background */}
      <img
        src="/hero.jpeg"
        alt="Wedding"
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-6 md:px-20">
        <Reveal>
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-serif leading-tight text-white">
              Capturing <br />
              <span className="text-[var(--accent-gold)] italic">
              timeless
            </span>{" "}
            moments
          </h1>

          <p className="mt-6 text-lg text-muted max-w-md">
            Wedding & Event Photography that tells your story with elegance
          </p>

          <div className="mt-10 flex gap-5">
            <Link href="/booking">
              <button className="btn-primary">
                Book Now
              </button>
            </Link>

            <Link href="/portfolio">
              <button className="btn-outline">
                View Portfolio
              </button>
            </Link>
          </div>

        </div>
      </Reveal>
      </div>
    </section>
  );
}