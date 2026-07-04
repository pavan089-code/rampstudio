import type { EventInput, EventSectionKey } from "@/types/event";

export const EVENT_TYPES = [
  "Wedding", "Birthday", "Engagement", "Anniversary", "Baby Shower",
  "Naming Ceremony", "Maternity Celebration", "Housewarming", "Half Saree",
  "Corporate Event", "Sports Tournament", "Concert", "Photography Exhibition",
  "Graduation", "Retirement", "Temple Event", "Custom Event",
] as const;

export const EVENT_THEMES = {
  "royal-gold": { label: "Royal Gold", background: "#0b0906", surface: "#171109", text: "#fff8ea", muted: "#cbbfa9", accent: "#c6a46c", font: "var(--font-playfair)", radius: "0px" },
  "minimal-white": { label: "Minimal White", background: "#f7f5f0", surface: "#ffffff", text: "#171717", muted: "#6b6b6b", accent: "#9a7b4f", font: "var(--font-playfair)", radius: "0px" },
  "dark-luxury": { label: "Dark Luxury", background: "#070707", surface: "#101010", text: "#f5f3ef", muted: "#aaa59e", accent: "#a88a5b", font: "var(--font-playfair)", radius: "0px" },
  floral: { label: "Floral", background: "#f6f0ec", surface: "#fffaf7", text: "#382d2b", muted: "#796966", accent: "#9b5f68", font: "var(--font-playfair)", radius: "20px" },
  traditional: { label: "Traditional", background: "#210909", surface: "#32100d", text: "#fff2dc", muted: "#d8bca5", accent: "#d6a44a", font: "var(--font-playfair)", radius: "4px" },
  "birthday-fun": { label: "Birthday Fun", background: "#171329", surface: "#241e3b", text: "#fffaf0", muted: "#c9c0dc", accent: "#e5b75b", font: "var(--font-geist-sans)", radius: "18px" },
  corporate: { label: "Corporate", background: "#0d1720", surface: "#152431", text: "#eef6fb", muted: "#9eb0bd", accent: "#7da5bd", font: "var(--font-geist-sans)", radius: "2px" },
  modern: { label: "Modern", background: "#121212", surface: "#1d1d1d", text: "#ffffff", muted: "#aaaaaa", accent: "#d5c6aa", font: "var(--font-geist-sans)", radius: "12px" },
  classic: { label: "Classic", background: "#f1ede4", surface: "#faf8f2", text: "#24211c", muted: "#6f685d", accent: "#806e50", font: "var(--font-playfair)", radius: "0px" },
} as const;

export const EVENT_SECTIONS: { key: EventSectionKey; label: string }[] = [
  { key: "hero", label: "Hero" }, { key: "countdown", label: "Countdown" },
  { key: "details", label: "Event Details" }, { key: "timeline", label: "Timeline" },
  { key: "story", label: "Story" }, { key: "family", label: "Family" },
  { key: "gallery", label: "Gallery" }, { key: "livestream", label: "Live Stream" },
  { key: "map", label: "Map" }, { key: "rsvp", label: "RSVP" },
  { key: "guestbook", label: "Guestbook" }, { key: "thankYou", label: "Thank You" },
  { key: "footer", label: "Footer" },
];

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function createEmptyEvent(): EventInput {
  return {
    title: "", slug: "", eventType: "Wedding", theme: "royal-gold", status: "draft",
    coverImage: "", heroImage: "", backgroundAccent: "", seoTitle: "", seoDescription: "",
    openGraphImage: "", eventDate: "", eventTime: "", endDate: "", venue: "", address: "",
    mapsUrl: "", hostNames: "", description: "", story: "", family: "", dressCode: "",
    hashtag: "", youtubeLive: "", livestreamState: "upcoming", timeline: [], gallery: [],
    sections: Object.fromEntries(EVENT_SECTIONS.map(({ key }) => [key, true])) as EventInput["sections"],
    settings: { allowDownloads: false, allowGuestbook: true, showShare: true },
  };
}

export function extractYouTubeId(url: string) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/))([\w-]{11})/);
  return match?.[1] || "";
}
