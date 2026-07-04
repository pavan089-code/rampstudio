import "server-only";

import { cache } from "react";

import { getAdminDb } from "@/lib/firebase-admin";
import type { Event } from "@/types/event";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
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
    title: text(data.title),
    slug: text(data.slug),
    eventType: text(data.eventType),
    status: "published",
    eventDate: text(data.eventDate),
    eventTime: text(data.eventTime),
    venue: text(data.venue),
    mapLink: text(data.mapLink),
    theme: text(data.theme) || "cinematic-gold",
    published: true,
    heroImage: text(data.heroImage),
    coverVideo: text(data.coverVideo),
    metaTitle: text(data.metaTitle),
    metaDescription: text(data.metaDescription),
    ogImage: text(data.ogImage),
    createdAt: null,
    updatedAt: null,
  };
});
