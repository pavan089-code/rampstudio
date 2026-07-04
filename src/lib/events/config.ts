import type { EventInput } from "@/types/event";

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

export function createEmptyEvent(): EventInput {
  return {
    title: "",
    slug: "",
    eventType: "Wedding",
    status: "draft",
    eventDate: "",
    eventTime: "",
    venue: "",
    mapLink: "",
    theme: "cinematic-gold",
    published: false,
    heroImage: "",
    coverVideo: "",
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  };
}
