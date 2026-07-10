import "server-only";

import { cache } from "react";

import { normalizeEventDocument } from "@/lib/events/converter";
import { getAdminDb } from "@/lib/firebase-admin";
import type { Event, EventAnnouncement, EventAnnouncementPriority, PublicEventGalleryMedia } from "@/types/event";

const validAnnouncementPriorities: EventAnnouncementPriority[] = ["normal", "important", "urgent"];

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toMillis(value: unknown): number {
  return value && typeof value === "object" && "toMillis" in value && typeof value.toMillis === "function"
    ? value.toMillis()
    : 0;
}

export const getPublicEventBySlug = cache(async (slug: string): Promise<Event | null> => {
  const snapshot = await getAdminDb()
    .collection("events")
    .where("slug", "==", slug)
    .limit(5)
    .get();

  const match = snapshot.docs.find((item) => {
    const data = item.data();
    return data.published === true && data.status === "published";
  });
  if (!match) return null;

  const data = match.data();
  return {
    id: match.id,
    ...normalizeEventDocument(data),
    status: "published",
    published: true,
    createdAt: null,
    updatedAt: null,
  };
});

export const getPublishedAnnouncementsForEvent = cache(async (eventId: string): Promise<EventAnnouncement[]> => {
  const snapshot = await getAdminDb()
    .collection("events")
    .doc(eventId)
    .collection("announcements")
    .where("published", "==", true)
    .get();

  return snapshot.docs
    .map((item) => {
      const data = item.data();
      const priority = validAnnouncementPriorities.includes(data.priority as EventAnnouncementPriority)
        ? data.priority as EventAnnouncementPriority
        : "normal";

      return {
        id: item.id,
        eventId,
        title: stringValue(data.title),
        message: stringValue(data.message),
        priority,
        status: "published" as const,
        published: true,
        publishedAt: (data.publishedAt as EventAnnouncement["publishedAt"]) ?? null,
        createdAt: null,
        updatedAt: null,
      };
    })
    .filter((announcement) => announcement.title || announcement.message)
    .sort((first, second) => {
      const firstTime = toMillis(first.publishedAt);
      const secondTime = toMillis(second.publishedAt);
      if (firstTime !== secondTime) return secondTime - firstTime;
      return first.title.localeCompare(second.title);
    });
});

export const getVisibleGalleryForEvent = cache(async (eventId: string): Promise<PublicEventGalleryMedia[]> => {
  const snapshot = await getAdminDb()
    .collection("events")
    .doc(eventId)
    .collection("gallery")
    .where("visible", "==", true)
    .get();

  return snapshot.docs
    .map((item) => {
      const data = item.data();
      return {
        id: item.id,
        downloadUrl: stringValue(data.downloadUrl),
        fileName: stringValue(data.fileName),
        width: typeof data.width === "number" && Number.isFinite(data.width) ? data.width : 0,
        height: typeof data.height === "number" && Number.isFinite(data.height) ? data.height : 0,
        caption: stringValue(data.caption),
        altText: stringValue(data.altText),
        order: typeof data.order === "number" && Number.isFinite(data.order) ? data.order : 0,
        visible: true,
        downloadEnabled: typeof data.downloadEnabled === "boolean" ? data.downloadEnabled : false,
        uploadedAt: data.uploadedAt,
      };
    })
    .filter((item) => item.downloadUrl)
    .sort((first, second) => {
      if (first.order !== second.order) return first.order - second.order;
      const firstTime = toMillis(first.uploadedAt);
      const secondTime = toMillis(second.uploadedAt);
      if (firstTime !== secondTime) return firstTime - secondTime;
      return first.fileName.localeCompare(second.fileName);
    })
    .map(({ uploadedAt: _uploadedAt, ...item }) => item);
});
