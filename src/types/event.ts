import type { Timestamp } from "firebase/firestore";

export type EventStatus = "draft" | "published" | "archived";

export type EventSectionKey =
  | "countdown"
  | "hosts"
  | "story"
  | "schedule"
  | "venue"
  | "sharing"
  | "gallery"
  | "livestream"
  | "announcements"
  | "highlights";

export type EventLifecycleMode = "auto" | "before" | "live" | "after";
export type EventLifecyclePhase = "before" | "live" | "after";
export type EventGalleryStatus = "disabled" | "coming-soon" | "available";
export type EventLivestreamProvider = "youtube";
export type EventLivestreamStatus = "scheduled" | "live" | "ended";
export type EventAnnouncementPriority = "normal" | "important" | "urgent";
export type EventAnnouncementStatus = "draft" | "published";

export type EventGalleryMediaDocument = {
  eventId: string;
  storagePath: string;
  downloadUrl: string;
  fileName: string;
  contentType: string;
  size: number;
  width: number;
  height: number;
  caption: string;
  altText: string;
  order: number;
  visible: boolean;
  downloadEnabled: boolean;
  uploadedAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type EventGalleryMedia = EventGalleryMediaDocument & { id: string };

export type PublicEventGalleryMedia = Pick<
  EventGalleryMedia,
  "id" | "downloadUrl" | "fileName" | "width" | "height" | "caption" | "altText" | "order" | "visible" | "downloadEnabled"
>;

export type EventGalleryMediaInput = {
  storagePath: string;
  downloadUrl: string;
  fileName: string;
  contentType: string;
  size: number;
  width: number;
  height: number;
  caption: string;
  altText: string;
  order: number;
  visible: boolean;
  downloadEnabled: boolean;
};

export type EventGalleryMediaUpdate = Partial<Pick<EventGalleryMediaDocument, "caption" | "altText" | "order" | "visible" | "downloadEnabled">>;

export type EventPresentation = {
  eyebrow: string;
  headline: string;
  subtitle: string;
  message: string;
  story: string;
  primaryCtaLabel: string;
};

export type EventHost = {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  order: number;
};

export type EventScheduleItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  order: number;
};

export type EventVenueDetails = {
  name: string;
  address: string;
  city: string;
  mapLink: string;
  note: string;
};

export type EventSectionConfig = Record<EventSectionKey, boolean>;

export type EventLifecycleConfig = {
  mode: EventLifecycleMode;
  timezone: string;
  startDateTime: string;
  endDateTime: string;
};

export type ResolvedEventLifecycle = {
  phase: EventLifecyclePhase;
  mode: EventLifecycleMode;
  timezone: string;
  startAt: string;
  endAt: string;
  hasValidStart: boolean;
  hasValidEnd: boolean;
  reason: string;
};

export type EventMediaConfig = {
  galleryEnabled: boolean;
  galleryStatus: EventGalleryStatus;
  galleryCoverImage: string;
  livestreamEnabled: boolean;
  livestreamProvider: EventLivestreamProvider;
  livestreamUrl: string;
  livestreamLabel: string;
  livestreamTitle: string;
  livestreamDescription: string;
  livestreamStartDateTime: string;
  livestreamEndDateTime: string;
  livestreamStatus: EventLivestreamStatus;
  livestreamFallbackMessage: string;
  livestreamReplayEnabled: boolean;
  highlightsEnabled: boolean;
  highlightVideoUrl: string;
};

export type EventDocument = {
  title: string;
  slug: string;
  eventType: string;
  status: EventStatus;
  eventDate: string;
  eventTime: string;
  eventEndDate: string;
  eventEndTime: string;
  timezone: string;
  venue: string;
  mapLink: string;
  theme: string;
  published: boolean;
  heroImage: string;
  coverVideo: string;
  presentation: EventPresentation;
  hosts: EventHost[];
  schedule: EventScheduleItem[];
  venueDetails: EventVenueDetails;
  sections: EventSectionConfig;
  lifecycle: EventLifecycleConfig;
  media: EventMediaConfig;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type Event = EventDocument & { id: string };

export type EventInput = Omit<EventDocument, "createdAt" | "updatedAt">;

export type EventValidationErrors = Partial<Record<keyof EventInput | string, string>>;

export type EventAnnouncementDocument = {
  eventId: string;
  title: string;
  message: string;
  status: EventAnnouncementStatus;
  priority: EventAnnouncementPriority;
  published: boolean;
  publishedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type EventAnnouncement = EventAnnouncementDocument & { id: string };

export type EventAnnouncementInput = {
  title: string;
  message: string;
  priority: EventAnnouncementPriority;
  published: boolean;
};
