import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";

import type { EventDocument, EventStatus } from "@/types/event";

const validStatuses: EventStatus[] = ["draft", "published", "archived"];

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export const eventConverter: FirestoreDataConverter<EventDocument> = {
  toFirestore(event): DocumentData {
    return event;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): EventDocument {
    const data = snapshot.data(options);
    const status = validStatuses.includes(data.status) ? data.status : "draft";

    return {
      title: stringValue(data.title),
      slug: stringValue(data.slug),
      eventType: stringValue(data.eventType),
      status,
      eventDate: stringValue(data.eventDate),
      eventTime: stringValue(data.eventTime),
      venue: stringValue(data.venue),
      mapLink: stringValue(data.mapLink ?? data.mapsUrl),
      theme: stringValue(data.theme) || "cinematic-gold",
      published: typeof data.published === "boolean" ? data.published : status === "published",
      heroImage: stringValue(data.heroImage ?? data.coverImage),
      coverVideo: stringValue(data.coverVideo),
      metaTitle: stringValue(data.metaTitle ?? data.seoTitle),
      metaDescription: stringValue(data.metaDescription ?? data.seoDescription),
      ogImage: stringValue(data.ogImage ?? data.openGraphImage),
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    };
  },
};
