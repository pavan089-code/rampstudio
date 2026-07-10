import type {
  EventInput,
  EventLifecycleConfig,
  EventMediaConfig,
  EventPresentation,
  EventSectionConfig,
  EventVenueDetails,
} from "@/types/event";

export const EVENT_TYPES = [
  "Wedding",
  "Engagement",
  "Reception",
  "Anniversary",
  "Birthday",
  "Corporate Event",
  "Other",
] as const;

export const EVENT_THEMES = [
  { value: "cinematic-gold", label: "Cinematic Gold" },
  { value: "midnight", label: "Midnight" },
  { value: "classic-ivory", label: "Classic Ivory" },
] as const;

export const EVENT_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

export const EVENT_SECTION_OPTIONS = [
  { key: "countdown", label: "Countdown" },
  { key: "hosts", label: "Hosts / People" },
  { key: "story", label: "Story" },
  { key: "schedule", label: "Schedule" },
  { key: "venue", label: "Venue" },
  { key: "sharing", label: "Sharing" },
  { key: "gallery", label: "Gallery" },
  { key: "livestream", label: "Livestream" },
  { key: "announcements", label: "Announcements" },
  { key: "highlights", label: "Highlights" },
] as const;

export const EVENT_TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Dubai",
] as const;

export const EVENT_LIFECYCLE_MODES = [
  { value: "auto", label: "Automatic" },
  { value: "before", label: "Force Before Event" },
  { value: "live", label: "Force Live / Event Day" },
  { value: "after", label: "Force After Event" },
] as const;

export const EVENT_GALLERY_STATUS_OPTIONS = [
  { value: "disabled", label: "Disabled" },
  { value: "coming-soon", label: "Coming soon" },
  { value: "available", label: "Available" },
] as const;

export const EVENT_LIVESTREAM_PROVIDER_OPTIONS = [
  { value: "youtube", label: "YouTube" },
] as const;

export const EVENT_LIVESTREAM_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "live", label: "Live / available" },
  { value: "ended", label: "Ended" },
] as const;

export const EVENT_ANNOUNCEMENT_PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "important", label: "Important" },
  { value: "urgent", label: "Urgent" },
] as const;

export const DEFAULT_EVENT_PRESENTATION: EventPresentation = {
  eyebrow: "",
  headline: "",
  subtitle: "",
  message: "",
  story: "",
  primaryCtaLabel: "",
};

export const DEFAULT_EVENT_SECTIONS: EventSectionConfig = {
  countdown: true,
  hosts: false,
  story: true,
  schedule: false,
  venue: true,
  sharing: true,
  gallery: false,
  livestream: false,
  announcements: false,
  highlights: false,
};

export const DEFAULT_EVENT_VENUE_DETAILS: EventVenueDetails = {
  name: "",
  address: "",
  city: "",
  mapLink: "",
  note: "",
};

export const DEFAULT_EVENT_LIFECYCLE: EventLifecycleConfig = {
  mode: "auto",
  timezone: "Asia/Kolkata",
  startDateTime: "",
  endDateTime: "",
};

export const DEFAULT_EVENT_MEDIA: EventMediaConfig = {
  galleryEnabled: false,
  galleryStatus: "disabled",
  galleryCoverImage: "",
  livestreamEnabled: false,
  livestreamProvider: "youtube",
  livestreamUrl: "",
  livestreamLabel: "",
  livestreamTitle: "",
  livestreamDescription: "",
  livestreamStartDateTime: "",
  livestreamEndDateTime: "",
  livestreamStatus: "scheduled",
  livestreamFallbackMessage: "",
  livestreamReplayEnabled: true,
  highlightsEnabled: false,
  highlightVideoUrl: "",
};

export function createEmptyEvent(): EventInput {
  return {
    title: "",
    slug: "",
    eventType: "Wedding",
    status: "draft",
    eventDate: "",
    eventTime: "",
    eventEndDate: "",
    eventEndTime: "",
    timezone: "Asia/Kolkata",
    venue: "",
    mapLink: "",
    theme: "cinematic-gold",
    published: false,
    heroImage: "",
    coverVideo: "",
    presentation: { ...DEFAULT_EVENT_PRESENTATION },
    hosts: [],
    schedule: [],
    venueDetails: { ...DEFAULT_EVENT_VENUE_DETAILS },
    sections: { ...DEFAULT_EVENT_SECTIONS },
    lifecycle: { ...DEFAULT_EVENT_LIFECYCLE },
    media: { ...DEFAULT_EVENT_MEDIA },
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  };
}
