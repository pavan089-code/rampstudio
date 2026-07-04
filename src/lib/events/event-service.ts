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
import { eventConverter } from "@/lib/events/converter";
import { generateEventSlug, hasEventValidationErrors, validateEvent } from "@/lib/events/validation";
import type { Event, EventDocument, EventInput } from "@/types/event";

export const EVENTS_COLLECTION = "events";
export const EVENT_ANALYTICS_COLLECTION = "eventAnalytics";

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
  return {
    ...input,
    title: input.title.trim(),
    slug: generateEventSlug(input.slug || input.title),
    eventType: input.eventType.trim(),
    venue: input.venue.trim(),
    mapLink: input.mapLink.trim(),
    theme: input.theme.trim(),
    heroImage: input.heroImage.trim(),
    coverVideo: input.coverVideo.trim(),
    metaTitle: input.metaTitle.trim(),
    metaDescription: input.metaDescription.trim(),
    ogImage: input.ogImage.trim(),
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
    const batch = writeBatch(db);
    batch.delete(doc(db, EVENTS_COLLECTION, id));
    batch.delete(doc(db, EVENT_ANALYTICS_COLLECTION, id));
    await batch.commit();
  },
};
