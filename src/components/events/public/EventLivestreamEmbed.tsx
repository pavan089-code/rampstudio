"use client";

import { useRef } from "react";

import { useEventAnalytics } from "./EventAnalyticsProvider";

export default function EventLivestreamEmbed({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const trackedRef = useRef(false);
  const { track } = useEventAnalytics();

  return (
    <iframe
      src={src}
      title={title}
      className="aspect-video h-auto w-full"
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      onLoad={() => {
        if (trackedRef.current) return;
        trackedRef.current = true;
        track("livestream_open");
      }}
    />
  );
}
