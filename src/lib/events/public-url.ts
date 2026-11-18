// Keep this aligned with the canonical domain in the sitemap and robots metadata.
export const EVENT_PUBLIC_ORIGIN = "https://www.rampstudio.in";

export function getPermanentEventUrl(eventId: string): string {
  return `${EVENT_PUBLIC_ORIGIN}/e/${encodeURIComponent(eventId)}`;
}
