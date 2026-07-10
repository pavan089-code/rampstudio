import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase-admin";

export const EVENT_ANALYTICS_COLLECTION = "eventAnalytics";

export const EVENT_ANALYTICS_TYPES = [
  "page_view",
  "gallery_open",
  "livestream_open",
  "map_click",
  "share_click",
  "photo_download",
] as const;

export type EventAnalyticsType = (typeof EVENT_ANALYTICS_TYPES)[number];

export type EventAnalyticsCounts = Record<EventAnalyticsType, number>;

export type EventAnalyticsSummary = {
  eventId: string;
  counts: Partial<EventAnalyticsCounts>;
  lastEventType: EventAnalyticsType | null;
  lastUpdatedAt: unknown;
};

export function isEventAnalyticsType(value: unknown): value is EventAnalyticsType {
  return typeof value === "string" && EVENT_ANALYTICS_TYPES.includes(value as EventAnalyticsType);
}

export async function assertPublishedEventForAnalytics(eventId: string) {
  if (!/^[A-Za-z0-9_-]{6,80}$/.test(eventId)) return null;

  const snapshot = await getAdminDb().collection("events").doc(eventId).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data();
  if (data?.published !== true || data.status !== "published") return null;

  return snapshot;
}

export async function recordEventAnalytics(eventId: string, type: EventAnalyticsType) {
  await getAdminDb()
    .collection(EVENT_ANALYTICS_COLLECTION)
    .doc(eventId)
    .set(
      {
        eventId,
        [`counts.${type}`]: FieldValue.increment(1),
        lastEventType: type,
        lastUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}
