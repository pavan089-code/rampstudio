import type { Event, ResolvedEventLifecycle } from "@/types/event";

import { getEventDateTimeLabel } from "./event-formatters";

export default function EventHero({ event, lifecycle }: { event: Event; lifecycle: ResolvedEventLifecycle }) {
  const heading = event.presentation.headline || event.title;
  const eyebrow = lifecycle.phase === "live"
    ? "Happening now"
    : lifecycle.phase === "after"
      ? "Event completed"
      : event.presentation.eyebrow || event.eventType || "Ramp Studio Event";
  const subtitle = lifecycle.phase === "after"
    ? event.presentation.subtitle || "Thank you for being part of this event."
    : event.presentation.subtitle;
  const message = lifecycle.phase === "live"
    ? event.presentation.message || "Event-day details, updates, and access are gathered below."
    : lifecycle.phase === "after"
      ? event.presentation.message || "A completed event, preserved with the details that mattered most."
      : event.presentation.message;
  const dateLabel = getEventDateTimeLabel(event.eventDate, event.eventTime) || "Date to be announced";
  const venue = event.venueDetails.name || event.venue || "Venue to be announced";
  const ctaLabel = event.presentation.primaryCtaLabel || (lifecycle.phase === "live" ? "Open Event Day Details" : lifecycle.phase === "after" ? "View Event Details" : "Explore Event");

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#080706] text-white">
      {event.heroImage ? (
        // Native image supports Firebase Storage and arbitrary CDN URLs configured by admins.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      ) : event.coverVideo ? (
        <video
          muted
          playsInline
          preload="metadata"
          poster={event.heroImage || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src={event.coverVideo} />
        </video>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_24%,rgba(198,164,108,0.22),transparent_38%)]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-black/55 to-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#080706] to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-36 sm:px-8 sm:pb-24 md:px-12 lg:px-16 lg:pb-28">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d0ad72]">{eyebrow}</p>
        {lifecycle.mode !== "auto" ? (
          <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/42">Manual lifecycle mode</p>
        ) : null}
        <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.6rem,14vw,8.5rem)] leading-[0.9] text-balance text-white">
          {heading}
        </h1>

        {subtitle ? <p className="mt-7 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">{subtitle}</p> : null}

        <div className="mt-10 grid gap-4 border-y border-white/10 py-6 text-sm uppercase tracking-[0.16em] text-white/68 sm:grid-cols-2 lg:max-w-3xl">
          <p>{dateLabel}</p>
          <p>{venue}</p>
        </div>

        {message ? <p className="mt-8 max-w-2xl font-serif text-2xl leading-snug text-white/88 sm:text-3xl">{message}</p> : null}

        <a
          href="#event-content"
          className="mt-10 inline-flex min-h-12 items-center border border-[#d0ad72] px-6 text-xs font-medium uppercase tracking-[0.22em] text-[#d0ad72] transition hover:bg-[#d0ad72] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72]"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
