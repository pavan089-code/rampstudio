import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black px-6 py-20 sm:px-8 md:px-16 lg:px-24">
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,215,160,0.06),transparent_55%)]" />

      <div className="relative z-10 flex flex-col gap-16">
        {/* Top Section */}
        <div className="flex flex-col justify-between gap-14 lg:flex-row lg:items-end">
          {/* Brand */}
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Ramp Studio
            </p>

            <h2 className="mt-6 font-serif text-4xl leading-tight text-white sm:text-5xl">
              Timeless storytelling through cinematic imagery.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-white/50 sm:text-base">
              Wedding and event photography crafted with emotion, elegance, and
              a refined editorial perspective.
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-14 sm:gap-20">
            <div>
              <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-white/40">
                Navigation
              </h3>

              <div className="flex flex-col gap-4">
                <Link
                  href="/"
                  className="text-sm text-white/65 transition-all duration-500 hover:text-[var(--accent-gold)]"
                >
                  Home
                </Link>

                <Link
                  href="/portfolio"
                  className="text-sm text-white/65 transition-all duration-500 hover:text-[var(--accent-gold)]"
                >
                  Portfolio
                </Link>

                <Link
                  href="/booking"
                  className="text-sm text-white/65 transition-all duration-500 hover:text-[var(--accent-gold)]"
                >
                  Booking
                </Link>

                <Link
                  href="/contact"
                  className="text-sm text-white/65 transition-all duration-500 hover:text-[var(--accent-gold)]"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Socials */}
            <div>
              <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-white/40">
                Social
              </h3>

              <div className="flex flex-col gap-4">
                <a
                  href="https://www.instagram.com/ramp_studio?igsh=MTRzNnBjb3U4amUwaQ=="
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/65 transition-all duration-500 hover:text-[var(--accent-gold)]"
                >
                  Instagram
                </a>

                <a
                  href="#"
                  className="text-sm text-white/65 transition-all duration-500 hover:text-[var(--accent-gold)]"
                >
                  Behance
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/35 sm:flex-row sm:items-center">
          <p>© 2026 Ramp Studio. All rights reserved.</p>

          <p className="text-white/25">
            Crafted with a cinematic editorial aesthetic.
          </p>
        </div>
      </div>
    </footer>
  );
}