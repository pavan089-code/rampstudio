"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getPermanentEventUrl } from "@/lib/events/public-url";

export default function EventQrCode({ eventId, title, published }: { eventId?: string; title: string; published: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState("");
  if (!eventId || !published) return <p className="text-sm leading-6 text-white/50">Save and publish this event to make its QR code available.</p>;

  const url = getPermanentEventUrl(eventId);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Event link copied.");
    } catch {
      setMessage("Copy unavailable. Select the event link above to copy it.");
    }
  }
  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `event-${eventId}-qr.png`;
    link.click();
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="w-fit bg-white p-3"><QRCodeCanvas ref={canvasRef} value={url} size={512} marginSize={4} className="h-48 w-48 max-w-full" aria-label={`QR code for ${title}`} /></div>
      <div className="min-w-0 space-y-4">
        <p className="font-serif text-xl text-white">{title}</p>
        <p className="break-all text-sm text-white/65">{url}</p>
        <p className="text-xs leading-5 text-white/45">This permanent link continues to work if the event slug changes. It is available while the event is published.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={download} className="btn-primary min-h-11 px-4 text-sm">Download QR Code (PNG)</button>
          <button type="button" onClick={copyLink} className="min-h-11 border border-white/20 px-4 text-sm text-white/75">Copy Event Link</button>
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-white/20 px-4 text-sm text-white/75">Open Public Event</a>
        </div>
        {message ? <p role="status" className="text-sm text-white/60">{message}</p> : null}
      </div>
    </div>
  );
}
