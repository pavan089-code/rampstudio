import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";

import {
  DEFAULT_EVENT_LIFECYCLE,
  DEFAULT_EVENT_MEDIA,
  DEFAULT_EVENT_PRESENTATION,
  DEFAULT_EVENT_SECTIONS,
  DEFAULT_EVENT_VENUE_DETAILS,
} from "@/lib/events/config";
import type {
  EventDocument,
  EventGalleryStatus,
  EventHost,
  EventLifecycleMode,
  EventLivestreamProvider,
  EventLivestreamStatus,
  EventScheduleItem,
  EventSectionKey,
  EventStatus,
} from "@/types/event";

const validStatuses: EventStatus[] = ["draft", "published", "archived"];
const validLifecycleModes: EventLifecycleMode[] = ["auto", "before", "live", "after"];
const validGalleryStatuses: EventGalleryStatus[] = ["disabled", "coming-soon", "available"];
const validLivestreamProviders: EventLivestreamProvider[] = ["youtube"];
const validLivestreamStatuses: EventLivestreamStatus[] = ["scheduled", "live", "ended"];
const sectionKeys = Object.keys(DEFAULT_EVENT_SECTIONS) as EventSectionKey[];

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeHosts(value: unknown): EventHost[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const host = recordValue(item);
      return {
        id: stringValue(host.id) || `host-${index + 1}`,
        name: stringValue(host.name).trim(),
        role: stringValue(host.role).trim(),
        description: stringValue(host.description).trim(),
        image: stringValue(host.image).trim(),
        order: numberValue(host.order, index),
      };
    })
    .filter((host) => host.name || host.role || host.description || host.image)
    .sort((first, second) => first.order - second.order);
}

function normalizeSchedule(value: unknown): EventScheduleItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const scheduleItem = recordValue(item);
      return {
        id: stringValue(scheduleItem.id) || `schedule-${index + 1}`,
        title: stringValue(scheduleItem.title).trim(),
        description: stringValue(scheduleItem.description).trim(),
        date: stringValue(scheduleItem.date).trim(),
        startTime: stringValue(scheduleItem.startTime).trim(),
        endTime: stringValue(scheduleItem.endTime).trim(),
        location: stringValue(scheduleItem.location).trim(),
        order: numberValue(scheduleItem.order, index),
      };
    })
    .filter((item) => item.title || item.description || item.date || item.startTime || item.location)
    .sort((first, second) => first.order - second.order);
}

export function normalizeEventDocument(data: Record<string, unknown>): EventDocument {
  const status = validStatuses.includes(data.status as EventStatus) ? data.status as EventStatus : "draft";
  const presentation = recordValue(data.presentation);
  const venueDetails = recordValue(data.venueDetails);
  const sections = recordValue(data.sections);
  const lifecycle = recordValue(data.lifecycle);
  const media = recordValue(data.media);
  const lifecycleMode = validLifecycleModes.includes(lifecycle.mode as EventLifecycleMode)
    ? lifecycle.mode as EventLifecycleMode
    : DEFAULT_EVENT_LIFECYCLE.mode;
  const galleryStatus = validGalleryStatuses.includes(media.galleryStatus as EventGalleryStatus)
    ? media.galleryStatus as EventGalleryStatus
    : DEFAULT_EVENT_MEDIA.galleryStatus;
  const livestreamProvider = validLivestreamProviders.includes(media.livestreamProvider as EventLivestreamProvider)
    ? media.livestreamProvider as EventLivestreamProvider
    : DEFAULT_EVENT_MEDIA.livestreamProvider;
  const livestreamStatus = validLivestreamStatuses.includes(media.livestreamStatus as EventLivestreamStatus)
    ? media.livestreamStatus as EventLivestreamStatus
    : DEFAULT_EVENT_MEDIA.livestreamStatus;
  const eventDate = stringValue(data.eventDate);
  const eventTime = stringValue(data.eventTime);
  const eventEndDate = stringValue(data.eventEndDate);
  const eventEndTime = stringValue(data.eventEndTime);
  const timezone = stringValue(data.timezone) || stringValue(lifecycle.timezone) || DEFAULT_EVENT_LIFECYCLE.timezone;
  const venue = stringValue(data.venue);
  const mapLink = stringValue(data.mapLink ?? data.mapsUrl);

  return {
    title: stringValue(data.title),
    slug: stringValue(data.slug),
    eventType: stringValue(data.eventType),
    status,
    eventDate,
    eventTime,
    eventEndDate,
    eventEndTime,
    timezone,
    venue,
    mapLink,
    theme: stringValue(data.theme) || "cinematic-gold",
    published: typeof data.published === "boolean" ? data.published : status === "published",
    heroImage: stringValue(data.heroImage ?? data.coverImage),
    coverVideo: stringValue(data.coverVideo),
    presentation: {
      eyebrow: stringValue(presentation.eyebrow),
      headline: stringValue(presentation.headline),
      subtitle: stringValue(presentation.subtitle),
      message: stringValue(presentation.message),
      story: stringValue(presentation.story),
      primaryCtaLabel: stringValue(presentation.primaryCtaLabel),
    },
    hosts: normalizeHosts(data.hosts),
    schedule: normalizeSchedule(data.schedule),
    venueDetails: {
      name: stringValue(venueDetails.name) || venue,
      address: stringValue(venueDetails.address),
      city: stringValue(venueDetails.city),
      mapLink: stringValue(venueDetails.mapLink) || mapLink,
      note: stringValue(venueDetails.note),
    },
    sections: sectionKeys.reduce((accumulator, key) => ({
      ...accumulator,
      [key]: booleanValue(sections[key], DEFAULT_EVENT_SECTIONS[key]),
    }), { ...DEFAULT_EVENT_SECTIONS }),
    lifecycle: {
      mode: lifecycleMode,
      timezone,
      startDateTime: stringValue(lifecycle.startDateTime) || [eventDate, eventTime].filter(Boolean).join("T"),
      endDateTime: stringValue(lifecycle.endDateTime) || [eventEndDate, eventEndTime].filter(Boolean).join("T"),
    },
    media: {
      galleryEnabled: booleanValue(media.galleryEnabled, DEFAULT_EVENT_MEDIA.galleryEnabled),
      galleryStatus,
      galleryCoverImage: stringValue(media.galleryCoverImage),
      livestreamEnabled: booleanValue(media.livestreamEnabled, DEFAULT_EVENT_MEDIA.livestreamEnabled),
      livestreamProvider,
      livestreamUrl: stringValue(media.livestreamUrl),
      livestreamLabel: stringValue(media.livestreamLabel),
      livestreamTitle: stringValue(media.livestreamTitle),
      livestreamDescription: stringValue(media.livestreamDescription),
      livestreamStartDateTime: stringValue(media.livestreamStartDateTime),
      livestreamEndDateTime: stringValue(media.livestreamEndDateTime),
      livestreamStatus,
      livestreamFallbackMessage: stringValue(media.livestreamFallbackMessage),
      livestreamReplayEnabled: booleanValue(media.livestreamReplayEnabled, DEFAULT_EVENT_MEDIA.livestreamReplayEnabled),
      highlightsEnabled: booleanValue(media.highlightsEnabled, DEFAULT_EVENT_MEDIA.highlightsEnabled),
      highlightVideoUrl: stringValue(media.highlightVideoUrl),
    },
    metaTitle: stringValue(data.metaTitle ?? data.seoTitle),
    metaDescription: stringValue(data.metaDescription ?? data.seoDescription),
    ogImage: stringValue(data.ogImage ?? data.openGraphImage),
    createdAt: (data.createdAt as EventDocument["createdAt"]) ?? null,
    updatedAt: (data.updatedAt as EventDocument["updatedAt"]) ?? null,
  };
}

export const eventConverter: FirestoreDataConverter<EventDocument> = {
  toFirestore(event): DocumentData {
    return event;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): EventDocument {
    return normalizeEventDocument(snapshot.data(options));
  },
};
