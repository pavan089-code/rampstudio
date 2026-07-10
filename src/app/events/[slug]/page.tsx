import type { Metadata } from "next";
import { notFound } from "next/navigation";

import EventMicrosite from "@/components/events/public/EventMicrosite";
import { formatEventDate } from "@/components/events/public/event-formatters";
import { getPublicEventBySlug, getPublishedAnnouncementsForEvent, getVisibleGalleryForEvent } from "@/lib/events/event-server-service";
import type { EventAnnouncement, PublicEventGalleryMedia } from "@/types/event";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) return { title: "Event not found | Ramp Studio" };

  const title = event.metaTitle || `${event.title} | Ramp Studio`;
  const description = event.metaDescription || event.presentation.subtitle || [formatEventDate(event.eventDate), event.venue].filter(Boolean).join(" - ");
  const image = event.ogImage || event.heroImage;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: image ? [{ url: image }] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();
  const [announcements, gallery] = await Promise.all([
    getPublishedAnnouncementsForEvent(event.id).catch((error): EventAnnouncement[] => {
      console.error("[events/public] Announcement fetch failed", {
        eventId: event.id,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }),
    getVisibleGalleryForEvent(event.id).catch((error): PublicEventGalleryMedia[] => {
      console.error("[events/public] Gallery fetch failed", {
        eventId: event.id,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }),
  ]);

  return <EventMicrosite event={event} announcements={announcements} gallery={gallery} />;
}
