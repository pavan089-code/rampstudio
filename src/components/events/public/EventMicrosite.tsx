import type { Event, EventAnnouncement, PublicEventGalleryMedia } from "@/types/event";
import { resolveEventLifecycle } from "@/lib/events/lifecycle";

import EventAnnouncements from "./EventAnnouncements";
import EventAnalyticsProvider from "./EventAnalyticsProvider";
import EventCountdown from "./EventCountdown";
import EventGallery from "./EventGallery";
import EventHero from "./EventHero";
import EventHosts from "./EventHosts";
import EventLivestream from "./EventLivestream";
import EventSchedule from "./EventSchedule";
import EventSharing from "./EventSharing";
import EventStory from "./EventStory";
import EventVenue from "./EventVenue";
import { getCountdownTarget, getEventDateTimeLabel } from "./event-formatters";

type QuickAccessLink = {
  href: string;
  label: string;
};

function hasVenueDetails(event: Event): boolean {
  return Boolean(event.venueDetails.name || event.venue || event.venueDetails.address || event.venueDetails.city || event.venueDetails.note || event.venueDetails.mapLink || event.mapLink);
}

function getLiveQuickAccessLinks(event: Event, announcements: EventAnnouncement[], gallery: PublicEventGalleryMedia[]): QuickAccessLink[] {
  const links: QuickAccessLink[] = [];

  if (event.sections.schedule && event.schedule.length > 0) links.push({ href: "#schedule", label: "Schedule" });
  if (event.sections.livestream && event.media.livestreamEnabled && event.media.livestreamUrl) links.push({ href: "#livestream", label: "Watch Live" });
  if (event.sections.gallery && gallery.length > 0) links.push({ href: "#gallery", label: "Gallery" });
  if (event.sections.announcements && announcements.some((announcement) => announcement.published && (announcement.title || announcement.message))) {
    links.push({ href: "#announcements", label: "Updates" });
  }
  if (event.sections.venue && hasVenueDetails(event)) links.push({ href: "#venue", label: "Maps" });

  return links;
}

function EventDayQuickAccess({ links }: { links: QuickAccessLink[] }) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="Event day quick access" className="border-t border-white/10 bg-[#080706] px-5 py-4 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 shrink-0 items-center border border-white/10 px-4 text-xs uppercase tracking-[0.18em] text-white/70 transition hover:border-[#d0ad72] hover:text-[#d0ad72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72]"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export default function EventMicrosite({
  event,
  announcements = [],
  gallery = [],
}: {
  event: Event;
  announcements?: EventAnnouncement[];
  gallery?: PublicEventGalleryMedia[];
}) {
  const lifecycle = resolveEventLifecycle(event);
  const countdownTarget = lifecycle.startAt || getCountdownTarget(event.eventDate, event.eventTime);
  const countdownLabel = getEventDateTimeLabel(event.eventDate, event.eventTime);
  const showCountdown = lifecycle.phase === "before" && event.sections.countdown && countdownTarget;
  const visibleGallery = event.sections.gallery ? gallery.filter((item) => item.visible && item.downloadUrl) : [];
  const quickAccessLinks = lifecycle.phase === "live" ? getLiveQuickAccessLinks(event, announcements, visibleGallery) : [];

  return (
    <EventAnalyticsProvider eventId={event.id}>
      <main className={`event-microsite event-theme-${event.theme} min-h-screen bg-[#080706] text-white`} data-event-lifecycle={lifecycle.phase}>
        <EventHero event={event} lifecycle={lifecycle} />
        <EventDayQuickAccess links={quickAccessLinks} />
        <div id="event-content">
          {showCountdown ? <EventCountdown target={countdownTarget} label={countdownLabel} /> : null}
          {lifecycle.phase === "after" ? <EventGallery media={visibleGallery} lifecycle={lifecycle} /> : null}
          {event.sections.story ? <EventStory event={event} /> : null}
          {event.sections.hosts ? <EventHosts event={event} /> : null}
          {event.sections.schedule ? <EventSchedule event={event} lifecycle={lifecycle} /> : null}
          {lifecycle.phase !== "after" ? <EventGallery media={visibleGallery} lifecycle={lifecycle} /> : null}
          <EventLivestream event={event} lifecycle={lifecycle} />
          <EventAnnouncements event={event} announcements={announcements} lifecycle={lifecycle} />
          {event.sections.venue ? <EventVenue event={event} /> : null}
          {event.sections.sharing ? <EventSharing title={event.title} /> : null}
        </div>
      </main>
    </EventAnalyticsProvider>
  );
}
