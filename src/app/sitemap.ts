import type { MetadataRoute } from "next";

import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeEventDocument } from "@/lib/events/converter";

const SITE_URL = "https://www.rampstudio.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const coreRoutes: MetadataRoute.Sitemap = ["", "/portfolio", "/booking", "/contact", "/events"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority: route === "" ? 1 : 0.7,
  }));

  try {
    const snapshot = await getAdminDb()
      .collection("events")
      .where("published", "==", true)
      .where("status", "==", "published")
      .get();

    const eventRoutes = snapshot.docs
      .map((item) => normalizeEventDocument(item.data()))
      .filter((event) => event.slug)
      .map((event) => ({
        url: `${baseUrl}/events/${event.slug}`,
        lastModified: event.updatedAt?.toDate() || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    return [...coreRoutes, ...eventRoutes];
  } catch (error) {
    console.error("[sitemap] Unable to load published events", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return coreRoutes;
  }
}
