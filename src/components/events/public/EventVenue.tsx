import type { Event } from "@/types/event";

import EventAnalyticsLink from "./EventAnalyticsLink";
import EventSection from "./EventSection";

export default function EventVenue({ event }: { event: Event }) {
  const name = event.venueDetails.name || event.venue;
  const mapLink = event.venueDetails.mapLink || event.mapLink;
  const hasVenue = name || event.venueDetails.address || event.venueDetails.city || event.venueDetails.note || mapLink;
  if (!hasVenue) return null;

  return (
    <EventSection id="venue" eyebrow="Venue" title="Arrive with ease">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div>
          {name ? <h3 className="font-serif text-4xl leading-tight text-white sm:text-5xl">{name}</h3> : null}
          {[event.venueDetails.address, event.venueDetails.city].filter(Boolean).length ? (
            <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-white/62">
              {[event.venueDetails.address, event.venueDetails.city].filter(Boolean).join("\n")}
            </p>
          ) : null}
          {event.venueDetails.note ? <p className="mt-6 max-w-2xl text-sm leading-7 text-white/48">{event.venueDetails.note}</p> : null}
        </div>
        {mapLink ? (
          <EventAnalyticsLink
            analyticsType="map_click"
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-fit items-center border border-[#d0ad72] px-6 text-xs font-medium uppercase tracking-[0.22em] text-[#d0ad72] transition hover:bg-[#d0ad72] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72]"
          >
            Open in maps
          </EventAnalyticsLink>
        ) : null}
      </div>
    </EventSection>
  );
}
