import type { Timestamp } from "firebase/firestore";

export type EventStatus = "draft" | "published" | "archived";

export type EventDocument = {
  title: string;
  slug: string;
  eventType: string;
  status: EventStatus;
  eventDate: string;
  eventTime: string;
  venue: string;
  mapLink: string;
  theme: string;
  published: boolean;
  heroImage: string;
  coverVideo: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type Event = EventDocument & { id: string };

export type EventInput = Omit<EventDocument, "createdAt" | "updatedAt">;

export type EventValidationErrors = Partial<Record<keyof EventInput, string>>;
