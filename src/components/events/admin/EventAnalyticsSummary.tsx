"use client";

import { Activity, Loader2 } from "lucide-react";
import { doc, onSnapshot, type Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { useAdminClientAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { EVENT_ANALYTICS_COLLECTION } from "@/lib/events";

type AnalyticsCounts = {
  page_view?: number;
  gallery_open?: number;
  livestream_open?: number;
  map_click?: number;
  share_click?: number;
  photo_download?: number;
};

type AnalyticsState = {
  counts: AnalyticsCounts;
  lastUpdatedAt: Timestamp | null;
};

function countValue(counts: AnalyticsCounts, key: keyof AnalyticsCounts) {
  const value = counts[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatRatio(part: number, total: number) {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function formatUpdatedAt(value: Timestamp | null) {
  if (!value) return "No analytics yet";
  return value.toDate().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function EventAnalyticsSummary({ eventId }: { eventId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsState>({ counts: {}, lastUpdatedAt: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { status } = useAdminClientAuth();

  useEffect(() => {
    if (status === "checking") return;

    if (status !== "authenticated") {
      const timeout = window.setTimeout(() => {
        setError("Please sign in to view Event analytics.");
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    return onSnapshot(
      doc(db, EVENT_ANALYTICS_COLLECTION, eventId),
      (snapshot) => {
        const data = snapshot.data();
        setAnalytics({
          counts: (data?.counts || {}) as AnalyticsCounts,
          lastUpdatedAt: (data?.lastUpdatedAt as Timestamp | null) || null,
        });
        setError("");
        setLoading(false);
      },
      () => {
        setError("Unable to load Event analytics.");
        setLoading(false);
      }
    );
  }, [eventId, status]);

  const metrics = useMemo(() => {
    const pageViews = countValue(analytics.counts, "page_view");
    const galleryOpens = countValue(analytics.counts, "gallery_open");
    const livestreamOpens = countValue(analytics.counts, "livestream_open");
    const mapClicks = countValue(analytics.counts, "map_click");
    const shareClicks = countValue(analytics.counts, "share_click");
    const downloads = countValue(analytics.counts, "photo_download");

    return [
      { label: "Page views", value: pageViews, detail: "Public microsite visits" },
      { label: "Gallery opens", value: galleryOpens, detail: `${formatRatio(galleryOpens, pageViews)} of page views` },
      { label: "Livestream opens", value: livestreamOpens, detail: `${formatRatio(livestreamOpens, pageViews)} of page views` },
      { label: "Map clicks", value: mapClicks, detail: `${formatRatio(mapClicks, pageViews)} of page views` },
      { label: "Shares", value: shareClicks, detail: `${formatRatio(shareClicks, pageViews)} of page views` },
      { label: "Photo downloads", value: downloads, detail: `${formatRatio(downloads, galleryOpens)} of gallery opens` },
    ];
  }, [analytics.counts]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm text-white/55">
          <Activity className="h-4 w-4 text-[var(--accent-gold)]" />
          Last updated: {formatUpdatedAt(analytics.lastUpdatedAt)}
        </p>
        {loading ? <p className="inline-flex items-center gap-2 text-sm text-white/45"><Loader2 className="h-4 w-4 animate-spin" />Loading</p> : null}
      </div>

      {error ? <p role="alert" className="border border-red-400/25 bg-red-400/[0.08] px-4 py-3 text-sm text-red-100">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">{metric.label}</p>
            <p className="mt-3 font-serif text-4xl text-white">{metric.value}</p>
            <p className="mt-2 text-xs text-white/35">{metric.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
