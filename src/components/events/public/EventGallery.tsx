"use client";

import { useEffect, useMemo, useState, type TouchEvent } from "react";
import type { PublicEventGalleryMedia, ResolvedEventLifecycle } from "@/types/event";

import { useEventAnalytics } from "./EventAnalyticsProvider";
import EventSection from "./EventSection";

function getAltText(item: PublicEventGalleryMedia): string {
  return item.altText || item.caption || item.fileName || "Event Gallery photograph";
}

function getTitle(lifecycle: ResolvedEventLifecycle): string {
  if (lifecycle.phase === "after") return "Event memories";
  if (lifecycle.phase === "live") return "Photos from the event";
  return "Gallery preview";
}

function getEyebrow(lifecycle: ResolvedEventLifecycle): string {
  if (lifecycle.phase === "after") return "Gallery";
  if (lifecycle.phase === "live") return "Live Gallery";
  return "Preview Gallery";
}

export default function EventGallery({
  media,
  lifecycle,
}: {
  media: PublicEventGalleryMedia[];
  lifecycle: ResolvedEventLifecycle;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const activeMedia = activeIndex !== null ? media[activeIndex] : null;
  const { track } = useEventAnalytics();

  const navigation = useMemo(() => ({
    next: () => setActiveIndex((current) => current === null ? current : (current + 1) % media.length),
    previous: () => setActiveIndex((current) => current === null ? current : (current - 1 + media.length) % media.length),
  }), [media.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") navigation.next();
      if (event.key === "ArrowLeft") navigation.previous();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, navigation]);

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart === null) return;
    const distance = touchStart - event.changedTouches[0].clientX;
    if (Math.abs(distance) > 48) {
      distance > 0 ? navigation.next() : navigation.previous();
    }
    setTouchStart(null);
  }

  function openGallery(index: number) {
    setActiveIndex(index);
    track("gallery_open");
  }

  if (media.length === 0) return null;

  return (
    <>
      <EventSection id="gallery" eyebrow={getEyebrow(lifecycle)} title={getTitle(lifecycle)} className={lifecycle.phase === "after" ? "bg-white/[0.018]" : ""}>
        <div className="columns-2 gap-3 sm:gap-4 md:columns-3 md:gap-5 xl:columns-4">
          {media.map((item, index) => {
            const ratio = item.width > 0 && item.height > 0 ? `${item.width} / ${item.height}` : "4 / 5";
            return (
              <article key={item.id} className="mb-3 break-inside-avoid sm:mb-4 md:mb-5">
                <button
                  type="button"
                  onClick={() => openGallery(index)}
                  className="group block w-full overflow-hidden border border-white/10 bg-white/[0.025] text-left transition hover:border-[#d0ad72]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72]"
                  style={{ aspectRatio: ratio }}
                  aria-label={`Open ${getAltText(item)}`}
                >
                  {/* Firebase Storage URLs are runtime media; native img avoids broad remote image config changes. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.downloadUrl}
                    alt={getAltText(item)}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                  />
                </button>
                {item.caption ? <p className="mt-3 text-sm leading-6 text-white/54">{item.caption}</p> : null}
              </article>
            );
          })}
        </div>
      </EventSection>

      {activeMedia ? (
        <div
          className="fixed inset-0 z-[120] bg-black/90 px-4 py-5 backdrop-blur-xl sm:px-8 md:px-12"
          role="dialog"
          aria-modal="true"
          aria-label="Event Gallery image viewer"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveIndex(null);
          }}
        >
          <div className="flex h-full flex-col">
            <div className="flex min-h-12 items-center justify-between gap-4 text-xs uppercase tracking-[0.22em] text-white/70">
              <span>{String((activeIndex ?? 0) + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}</span>
              <div className="flex items-center gap-3">
                {activeMedia.downloadEnabled ? (
                  <a
                    href={activeMedia.downloadUrl}
                    download={activeMedia.fileName}
                    onClick={() => track("photo_download")}
                    className="min-h-12 px-2 py-4 text-white transition hover:text-[#d0ad72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72]"
                    aria-label={`Download ${getAltText(activeMedia)}`}
                  >
                    Download
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="min-h-12 px-2 text-white transition hover:text-[#d0ad72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72]"
                  aria-label="Close Gallery"
                >
                  Close
                </button>
              </div>
            </div>

            <div
              className="relative flex flex-1 items-center justify-center"
              onTouchStart={(event) => setTouchStart(event.changedTouches[0].clientX)}
              onTouchEnd={handleTouchEnd}
            >
              {media.length > 1 ? (
                <button
                  type="button"
                  onClick={navigation.previous}
                  className="absolute left-0 z-20 hidden min-h-12 w-12 items-center justify-center border border-white/10 bg-black/35 text-2xl text-white transition hover:border-[#d0ad72] hover:text-[#d0ad72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72] md:flex"
                  aria-label="Previous image"
                >
                  &lt;
                </button>
              ) : null}

              <div className="relative flex h-[74vh] w-full max-w-6xl items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeMedia.downloadUrl} alt={getAltText(activeMedia)} className="max-h-full max-w-full object-contain" />
              </div>

              {media.length > 1 ? (
                <button
                  type="button"
                  onClick={navigation.next}
                  className="absolute right-0 z-20 hidden min-h-12 w-12 items-center justify-center border border-white/10 bg-black/35 text-2xl text-white transition hover:border-[#d0ad72] hover:text-[#d0ad72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72] md:flex"
                  aria-label="Next image"
                >
                  &gt;
                </button>
              ) : null}
            </div>

            <div className="mx-auto max-w-3xl pb-3 text-center">
              {activeMedia.caption ? <p className="font-serif text-xl text-white sm:text-2xl">{activeMedia.caption}</p> : null}
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/42">{activeMedia.fileName}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
