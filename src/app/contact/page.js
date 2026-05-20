"use client";

import Reveal from "@/components/Reveal";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-primary px-6 pb-24 pt-32 text-white sm:px-8 md:px-16 md:pb-32 md:pt-40">
      <Reveal>
        <div className="mb-16 max-w-3xl md:mb-24">
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--accent-gold)]">
            Contact
          </p>

          <h1 className="font-serif text-5xl leading-[1.02] sm:text-6xl md:text-8xl">
            Let&apos;s Connect
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-muted sm:text-base">
            Whether you&apos;re planning a wedding, engagement, or special
            celebration - we&apos;d love to hear your story.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-14 md:grid-cols-2 md:gap-16">
        <Reveal>
          <div className="space-y-10 md:space-y-12">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">
                Email
              </p>

              <a
                href="mailto:rampstudio@email.com"
                className="link-underline inline-block font-serif text-2xl leading-tight transition hover:text-[var(--accent-gold)] sm:text-3xl"
              >
                rampstudio@email.com
              </a>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">
                Phone
              </p>

              <a
                href="tel:+19803830625"
                className="link-underline inline-block font-serif text-2xl leading-tight transition hover:text-[var(--accent-gold)] sm:text-3xl"
              >
                +1 980-383-0625
              </a>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">
                Instagram
              </p>

              <a
                href="https://www.instagram.com/ramp_studio?igsh=MTRzNnBjb3U4amUwaQ=="
                target="_blank"
                rel="noreferrer"
                className="link-underline inline-block font-serif text-2xl leading-tight transition hover:text-[var(--accent-gold)] sm:text-3xl"
              >
                @rampstudio
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border border-white/10 bg-white/[0.03] p-7 sm:p-10 md:p-14">
            <p className="text-base leading-8 text-muted sm:text-lg">
              Based in India, available for weddings, destination events,
              engagements, and cinematic storytelling worldwide.
            </p>

            <div className="my-9 h-px w-20 bg-[var(--accent-gold)] md:my-10" />

            <p className="font-serif text-xl leading-8 text-white sm:text-2xl">
              Creating timeless imagery with emotion, elegance, and cinematic
              artistry.
            </p>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
