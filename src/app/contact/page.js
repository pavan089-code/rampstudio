"use client";

import Reveal from "@/components/Reveal";

export default function ContactPage() {
  return (
    <main className="bg-primary min-h-screen text-white pt-32 px-6 md:px-16 pb-24">

      {/* Heading */}
      <Reveal>

        <div className="max-w-3xl mb-24">

          <p className="text-[var(--accent-gold)] tracking-[0.2em] uppercase text-sm mb-4">
            Contact
          </p>

          <h1 className="text-5xl md:text-7xl font-serif leading-tight">
            Let’s Connect
          </h1>

          <p className="text-muted mt-6 max-w-xl leading-relaxed">
            Whether you’re planning a wedding, engagement,
            or special celebration — we’d love to hear your story.
          </p>

        </div>

      </Reveal>

      {/* Contact Grid */}
      <div className="grid md:grid-cols-2 gap-16">

        {/* Left */}
        <Reveal>

          <div className="space-y-12">

            {/* Email */}
            <div>
              <p className="text-sm tracking-[0.15em] text-muted uppercase mb-3">
                Email
              </p>

              <a
                href="mailto:rampstudio@email.com"
                className="
                  text-2xl md:text-3xl
                  font-serif
                  hover:text-[var(--accent-gold)]
                  transition
                "
              >
                rampstudio@email.com
              </a>
            </div>

            {/* Phone */}
            <div>
              <p className="text-sm tracking-[0.15em] text-muted uppercase mb-3">
                Phone
              </p>

              <a
                href="tel:+1 980-383-0625"
                className="
                  text-2xl md:text-3xl
                  font-serif
                  hover:text-[var(--accent-gold)]
                  transition
                "
              >
                +1 980-383-0625
              </a>
            </div>

            {/* Instagram */}
            <div>
              <p className="text-sm tracking-[0.15em] text-muted uppercase mb-3">
                Instagram
              </p>

              <a
                href="https://www.instagram.com/ramp_studio?igsh=MTRzNnBjb3U4amUwaQ=="
                target="_blank"
                className="
                  text-2xl md:text-3xl
                  font-serif
                  hover:text-[var(--accent-gold)]
                  transition
                "
              >
                @rampstudio
              </a>
            </div>

          </div>

        </Reveal>

        {/* Right */}
        <Reveal delay={0.1}>

          <div className="bg-secondary border border-white/10 p-10 md:p-14">

            <p className="text-muted leading-relaxed text-lg">
              Based in India, available for weddings,
              destination events, engagements, and
              cinematic storytelling worldwide.
            </p>

            <div className="w-20 h-[1px] bg-[var(--accent-gold)] my-10" />

            <p className="text-white text-xl font-serif leading-relaxed">
              Creating timeless imagery with emotion,
              elegance, and cinematic artistry.
            </p>

          </div>

        </Reveal>

      </div>

    </main>
  );
}