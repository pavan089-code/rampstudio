// src/components/Footer.js

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-16 px-6 md:px-16">

      <div className="flex flex-col md:flex-row justify-between gap-12">

        {/* Left */}
        <div>
          <h2 className="text-white tracking-[0.3em] text-sm">
            RAMP STUDIO
          </h2>

          <p className="text-muted mt-4 max-w-sm leading-relaxed">
            Capturing timeless wedding stories with elegance,
            emotion, and cinematic artistry.
          </p>
        </div>

        {/* Right */}
        <div className="flex gap-12">

          <div>
            <h3 className="text-white mb-4 text-sm tracking-wide">
              Navigation
            </h3>

            <div className="flex flex-col gap-3 text-muted text-sm">
              <a className="hover:text-[var(--accent-gold)] transition">
                Portfolio
              </a>

              <a className="hover:text-[var(--accent-gold)] transition">
                Book
              </a>

              <a className="hover:text-[var(--accent-gold)] transition">
                Contact
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white mb-4 text-sm tracking-wide">
              Social
            </h3>

            <div className="flex flex-col gap-3 text-muted text-sm">
              <a className="hover:text-[var(--accent-gold)] transition">
                Instagram
              </a>

              <a className="hover:text-[var(--accent-gold)] transition">
                Behance
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 mt-12 pt-6 text-muted text-sm">
        © 2026 Ramp Studio. All rights reserved.
      </div>

    </footer>
  );
}