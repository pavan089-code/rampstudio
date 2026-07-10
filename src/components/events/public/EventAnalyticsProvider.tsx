"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";

export type ClientEventAnalyticsType =
  | "page_view"
  | "gallery_open"
  | "livestream_open"
  | "map_click"
  | "share_click"
  | "photo_download";

type EventAnalyticsContextValue = {
  track: (type: ClientEventAnalyticsType) => void;
};

const EventAnalyticsContext = createContext<EventAnalyticsContextValue>({
  track: () => undefined,
});

export function useEventAnalytics() {
  return useContext(EventAnalyticsContext);
}

export default function EventAnalyticsProvider({
  eventId,
  children,
}: {
  eventId: string;
  children: ReactNode;
}) {
  const track = useCallback((type: ClientEventAnalyticsType) => {
    const body = JSON.stringify({ eventId, type });

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/events/analytics", blob);
        return;
      }
    } catch {
      // Fall through to fetch; analytics must never affect the guest experience.
    }

    fetch("/api/events/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }, [eventId]);

  useEffect(() => {
    const key = `ramp:event:${eventId}:page_view`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Continue with a best-effort page view if session storage is unavailable.
    }
    track("page_view");
  }, [eventId, track]);

  const value = useMemo(() => ({ track }), [track]);

  return (
    <EventAnalyticsContext.Provider value={value}>
      {children}
    </EventAnalyticsContext.Provider>
  );
}
