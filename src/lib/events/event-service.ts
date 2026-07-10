import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
  type WithFieldValue,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { eventConverter, normalizeEventDocument } from "@/lib/events/converter";
import { EventGalleryService } from "@/lib/events/gallery-service";
import { generateEventSlug, hasEventValidationErrors, validateEvent } from "@/lib/events/validation";
import type { Event, EventDocument, EventInput } from "@/types/event";

export const EVENTS_COLLECTION = "events";
export const EVENT_ANALYTICS_COLLECTION = "eventAnalytics";
export const EVENT_ANNOUNCEMENTS_COLLECTION = "announcements";

const eventsCollection = collection(db, EVENTS_COLLECTION).withConverter(eventConverter);

function toEvent(id: string, data: EventDocument): Event {
  return { id, ...data };
}

async function assertUniqueSlug(slug: string, currentId?: string): Promise<void> {
  const matches = await getDocs(query(eventsCollection, where("slug", "==", slug)));
  if (matches.docs.some((match) => match.id !== currentId)) {
    throw new Error("This event URL is already in use.");
  }
}

function prepareInput(input: EventInput): EventInput {
  const normalized = normalizeEventDocument(input);
  const trim = (value: string) => value.trim();
  const startDateTime = normalized.eventDate ? [normalized.eventDate, normalized.eventTime].filter(Boolean).join("T") : trim(normalized.lifecycle.startDateTime);
  const endDateTime = normalized.eventEndDate ? [normalized.eventEndDate, normalized.eventEndTime].filter(Boolean).join("T") : trim(normalized.lifecycle.endDateTime);

  return {
    title: trim(normalized.title),
    slug: generateEventSlug(normalized.slug || normalized.title),
    eventType: trim(normalized.eventType),
    status: normalized.status,
    eventDate: trim(normalized.eventDate),
    eventTime: trim(normalized.eventTime),
    eventEndDate: trim(normalized.eventEndDate),
    eventEndTime: trim(normalized.eventEndTime),
    timezone: trim(normalized.timezone),
    venue: trim(normalized.venue),
    mapLink: trim(normalized.mapLink),
    theme: trim(normalized.theme),
    published: normalized.published,
    heroImage: trim(normalized.heroImage),
    coverVideo: trim(normalized.coverVideo),
    presentation: {
      eyebrow: trim(normalized.presentation.eyebrow),
      headline: trim(normalized.presentation.headline),
      subtitle: trim(normalized.presentation.subtitle),
      message: trim(normalized.presentation.message),
      story: trim(normalized.presentation.story),
      primaryCtaLabel: trim(normalized.presentation.primaryCtaLabel),
    },
    hosts: normalized.hosts
      .map((host, index) => ({
        id: host.id || `host-${index + 1}`,
        name: trim(host.name),
        role: trim(host.role),
        description: trim(host.description),
        image: trim(host.image),
        order: index,
      }))
      .filter((host) => host.name || host.role || host.description || host.image),
    schedule: normalized.schedule
      .map((item, index) => ({
        id: item.id || `schedule-${index + 1}`,
        title: trim(item.title),
        description: trim(item.description),
        date: trim(item.date),
        startTime: trim(item.startTime),
        endTime: trim(item.endTime),
        location: trim(item.location),
        order: index,
      }))
      .filter((item) => item.title || item.description || item.date || item.startTime || item.endTime || item.location),
    venueDetails: {
      name: trim(normalized.venueDetails.name),
      address: trim(normalized.venueDetails.address),
      city: trim(normalized.venueDetails.city),
      mapLink: trim(normalized.venueDetails.mapLink),
      note: trim(normalized.venueDetails.note),
    },
    sections: normalized.sections,
    lifecycle: {
      mode: normalized.lifecycle.mode,
      timezone: trim(normalized.lifecycle.timezone),
      startDateTime: trim(startDateTime),
      endDateTime: trim(endDateTime),
    },
    media: {
      galleryEnabled: normalized.media.galleryEnabled,
      galleryStatus: normalized.media.galleryStatus,
      galleryCoverImage: trim(normalized.media.galleryCoverImage),
      livestreamEnabled: normalized.media.livestreamEnabled,
      livestreamProvider: normalized.media.livestreamProvider,
      livestreamUrl: trim(normalized.media.livestreamUrl),
      livestreamLabel: trim(normalized.media.livestreamLabel),
      livestreamTitle: trim(normalized.media.livestreamTitle),
      livestreamDescription: trim(normalized.media.livestreamDescription),
      livestreamStartDateTime: trim(normalized.media.livestreamStartDateTime),
      livestreamEndDateTime: trim(normalized.media.livestreamEndDateTime),
      livestreamStatus: normalized.media.livestreamStatus,
      livestreamFallbackMessage: trim(normalized.media.livestreamFallbackMessage),
      livestreamReplayEnabled: normalized.media.livestreamReplayEnabled,
      highlightsEnabled: normalized.media.highlightsEnabled,
      highlightVideoUrl: trim(normalized.media.highlightVideoUrl),
    },
    metaTitle: trim(normalized.metaTitle),
    metaDescription: trim(normalized.metaDescription),
    ogImage: trim(normalized.ogImage),
  };
}

export const EventService = {
  subscribe(callback: (events: Event[]) => void, onError?: (error: Error) => void): Unsubscribe {
    return onSnapshot(
      eventsCollection,
      (snapshot) => {
        const events = snapshot.docs
          .map((item) => toEvent(item.id, item.data()))
          .sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0));
        callback(events);
      },
      onError,
    );
  },

  async getById(id: string): Promise<Event | null> {
    const snapshot = await getDoc(doc(eventsCollection, id));
    return snapshot.exists() ? toEvent(snapshot.id, snapshot.data()) : null;
  },

  async getPublishedBySlug(slug: string): Promise<Event | null> {
    const snapshot = await getDocs(
      query(eventsCollection, where("slug", "==", slug), where("published", "==", true)),
    );
    const match = snapshot.docs.find((item) => item.data().status === "published");
    return match ? toEvent(match.id, match.data()) : null;
  },

  async create(input: EventInput): Promise<string> {
    const prepared = prepareInput(input);
    const errors = validateEvent(prepared);
    if (hasEventValidationErrors(errors)) throw new Error(Object.values(errors)[0]);
    await assertUniqueSlug(prepared.slug);

    const payload: WithFieldValue<EventDocument> = {
      ...prepared,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const created = await addDoc(eventsCollection, payload);
    return created.id;
  },

  async update(id: string, input: EventInput): Promise<void> {
    const prepared = prepareInput(input);
    const errors = validateEvent(prepared);
    if (hasEventValidationErrors(errors)) throw new Error(Object.values(errors)[0]);
    await assertUniqueSlug(prepared.slug, id);

    const payload = {
      ...prepared,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(eventsCollection, id), payload);
  },

  async delete(id: string): Promise<void> {
    await EventGalleryService.deleteAll(id);
    const announcements = await getDocs(collection(db, EVENTS_COLLECTION, id, EVENT_ANNOUNCEMENTS_COLLECTION));
    const batch = writeBatch(db);
    announcements.docs.forEach((announcement) => batch.delete(announcement.ref));
    batch.delete(doc(db, EVENTS_COLLECTION, id));
    batch.delete(doc(db, EVENT_ANALYTICS_COLLECTION, id));
    await batch.commit();
  },
};
