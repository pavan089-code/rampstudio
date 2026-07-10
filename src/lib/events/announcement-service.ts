import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import {
  type EventAnnouncement,
  type EventAnnouncementDocument,
  type EventAnnouncementInput,
  type EventAnnouncementPriority,
  type EventAnnouncementStatus,
} from "@/types/event";

import { EVENTS_COLLECTION } from "./event-service";

export const EVENT_ANNOUNCEMENTS_COLLECTION = "announcements";

const validPriorities: EventAnnouncementPriority[] = ["normal", "important", "urgent"];
const validStatuses: EventAnnouncementStatus[] = ["draft", "published"];

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeAnnouncementDocument(data: Record<string, unknown>, eventId: string): EventAnnouncementDocument {
  const status = validStatuses.includes(data.status as EventAnnouncementStatus)
    ? data.status as EventAnnouncementStatus
    : "draft";
  const published = booleanValue(data.published, status === "published");
  const priority = validPriorities.includes(data.priority as EventAnnouncementPriority)
    ? data.priority as EventAnnouncementPriority
    : "normal";

  return {
    eventId: stringValue(data.eventId) || eventId,
    title: stringValue(data.title).trim(),
    message: stringValue(data.message).trim(),
    status: published ? "published" : status,
    priority,
    published,
    publishedAt: (data.publishedAt as EventAnnouncementDocument["publishedAt"]) ?? null,
    createdAt: (data.createdAt as EventAnnouncementDocument["createdAt"]) ?? null,
    updatedAt: (data.updatedAt as EventAnnouncementDocument["updatedAt"]) ?? null,
  };
}

function sortAnnouncements(first: EventAnnouncement, second: EventAnnouncement): number {
  const firstTime = first.publishedAt?.toMillis() ?? first.updatedAt?.toMillis() ?? first.createdAt?.toMillis() ?? 0;
  const secondTime = second.publishedAt?.toMillis() ?? second.updatedAt?.toMillis() ?? second.createdAt?.toMillis() ?? 0;
  if (firstTime !== secondTime) return secondTime - firstTime;
  return first.title.localeCompare(second.title);
}

function converterForEvent(eventId: string): FirestoreDataConverter<EventAnnouncementDocument> {
  return {
    toFirestore(announcement): DocumentData {
      return announcement;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): EventAnnouncementDocument {
      return normalizeAnnouncementDocument(snapshot.data(options), eventId);
    },
  };
}

function announcementsCollection(eventId: string) {
  return collection(db, EVENTS_COLLECTION, eventId, EVENT_ANNOUNCEMENTS_COLLECTION).withConverter(converterForEvent(eventId));
}

function toAnnouncement(id: string, data: EventAnnouncementDocument): EventAnnouncement {
  return { id, ...data };
}

function prepareInput(eventId: string, input: EventAnnouncementInput): Omit<EventAnnouncementDocument, "createdAt" | "updatedAt" | "publishedAt"> {
  const published = Boolean(input.published);
  const priority = validPriorities.includes(input.priority) ? input.priority : "normal";

  return {
    eventId,
    title: input.title.trim(),
    message: input.message.trim(),
    priority,
    published,
    status: published ? "published" : "draft",
  };
}

function assertValidInput(input: EventAnnouncementInput): void {
  if (!input.title.trim()) throw new Error("Announcement title is required.");
  if (!input.message.trim()) throw new Error("Announcement message is required.");
}

export const EventAnnouncementService = {
  subscribe(eventId: string, callback: (announcements: EventAnnouncement[]) => void, onError?: (error: Error) => void): Unsubscribe {
    return onSnapshot(
      announcementsCollection(eventId),
      (snapshot) => {
        callback(snapshot.docs.map((item) => toAnnouncement(item.id, item.data())).sort(sortAnnouncements));
      },
      onError,
    );
  },

  async list(eventId: string): Promise<EventAnnouncement[]> {
    const snapshot = await getDocs(announcementsCollection(eventId));
    return snapshot.docs.map((item) => toAnnouncement(item.id, item.data())).sort(sortAnnouncements);
  },

  async create(eventId: string, input: EventAnnouncementInput): Promise<string> {
    assertValidInput(input);
    const prepared = prepareInput(eventId, input);
    const created = await addDoc(announcementsCollection(eventId), {
      ...prepared,
      publishedAt: prepared.published ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return created.id;
  },

  async update(eventId: string, announcementId: string, input: EventAnnouncementInput): Promise<void> {
    assertValidInput(input);
    const prepared = prepareInput(eventId, input);
    const announcementRef = doc(announcementsCollection(eventId), announcementId);
    const current = await getDoc(announcementRef);
    const currentData = current.exists() ? current.data() : null;
    const publishedAt = prepared.published
      ? currentData?.published && currentData.publishedAt
        ? currentData.publishedAt
        : serverTimestamp()
      : null;

    await updateDoc(announcementRef, {
      ...prepared,
      publishedAt,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(eventId: string, announcementId: string): Promise<void> {
    await deleteDoc(doc(announcementsCollection(eventId), announcementId));
  },
};
