"use client";

import { useState } from "react";

import { useEventAnalytics } from "./EventAnalyticsProvider";

export default function EventSharing({ title }: { title: string }) {
  const [message, setMessage] = useState("");
  const { track } = useEventAnalytics();

  function getEventUrl() {
    return window.location.href;
  }

  async function shareNative() {
    const url = getEventUrl();
    track("share_click");
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setMessage("Shared");
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Link copied");
      }
    } catch {
      setMessage("Sharing cancelled");
    }
  }

  async function copyLink() {
    const url = getEventUrl();
    track("share_click");
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
    } catch {
      setMessage("Copy unavailable");
    }
  }

  function shareWhatsapp() {
    track("share_click");
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${getEventUrl()}`)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="sharing" className="scroll-mt-24 border-t border-white/10 px-5 py-20 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#d0ad72]">Share</p>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-white sm:text-5xl">
            Keep this event close.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/52">
            Share the event page with family and friends using a simple public link.
          </p>
          {message ? <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/45" role="status">{message}</p> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={shareNative}
            className="inline-flex min-h-12 items-center justify-center border border-white/10 px-5 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-[#d0ad72] hover:text-[#d0ad72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72]"
          >
            Share
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex min-h-12 items-center justify-center border border-white/10 px-5 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-[#d0ad72] hover:text-[#d0ad72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72]"
          >
            Copy link
          </button>
          <button
              type="button"
              onClick={shareWhatsapp}
              className="inline-flex min-h-12 items-center justify-center border border-[#d0ad72] px-5 text-xs uppercase tracking-[0.2em] text-[#d0ad72] transition hover:bg-[#d0ad72] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0ad72]"
            >
              WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}
