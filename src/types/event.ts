import type { Timestamp } from "firebase/firestore";

export type EventStatus = "draft" | "published" | "archived";
export type LivestreamState = "upcoming" | "live" | "ended";
export type RsvpStatus = "attending" | "declined" | "pending";
export type GuestbookStatus = "pending" | "approved" | "rejected";

export type EventSectionKey =
  | "hero" | "countdown" | "details" | "timeline" | "story"
  | "family" | "gallery" | "livestream" | "map" | "rsvp"
  | "guestbook" | "thankYou" | "footer";

export type EventTimelineItem = { id: string; time: string; title: string; description: string };
export type EventGalleryItem = {
  id: string;
  url: string;
  storagePath: string;
  thumbnailUrl?: string;
  type: "image" | "video";
  category: string;
  caption: string;
  isHero: boolean;
  downloadEnabled: boolean;
  createdAt?: Timestamp | null;
};

export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  eventType: string;
  theme: string;
  status: EventStatus;
  coverImage: string;
  heroImage: string;
  backgroundAccent: string;
  seoTitle: string;
  seoDescription: string;
  openGraphImage: string;
  eventDate: string;
  eventTime: string;
  endDate: string;
  venue: string;
  address: string;
  mapsUrl: string;
  hostNames: string;
  description: string;
  story: string;
  family: string;
  dressCode: string;
  hashtag: string;
  youtubeLive: string;
  livestreamState: LivestreamState;
  timeline: EventTimelineItem[];
  gallery: EventGalleryItem[];
  sections: Record<EventSectionKey, boolean>;
  settings: { allowDownloads: boolean; allowGuestbook: boolean; showShare: boolean };
  publishedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type EventInput = Omit<EventRecord, "id" | "publishedAt" | "createdAt" | "updatedAt">;

export type EventRsvp = {
  id: string; eventId: string; name: string; phone: string; email: string;
  guests: number; attending: RsvpStatus; message: string; createdAt: Timestamp | null;
};

export type GuestbookEntry = {
  id: string; eventId: string; name: string; message: string;
  status: GuestbookStatus; createdAt: Timestamp | null;
};

export type EventAnalytics = {
  views: number; uniqueVisitors: number; galleryViews: number; rsvpCount: number;
  shareCount: number; livestreamOpens: number; photoDownloads: number;
  sources: Record<string, number>;
};
